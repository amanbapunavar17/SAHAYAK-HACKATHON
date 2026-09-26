import json
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.logging import logger
from app.db.models.report import ItemReport, ReportType, ReportStatus
from app.db.models.match import PotentialMatch, MatchStatus
from app.db.models.notification import NotificationType
from app.integrations.embedding import get_embedding_provider, cosine_similarity
from app.integrations.maps import calculate_location_proximity_score
from app.repositories.matches import MatchRepository
from app.repositories.reports import ReportRepository
from app.services.notification_service import NotificationService
from app.services.audit_service import AuditService


class MatchingService:
    def __init__(self, db: Session):
        self.db = db
        self.match_repo = MatchRepository(db)
        self.report_repo = ReportRepository(db)
        self.embedding_provider = get_embedding_provider()
        self.notif_service = NotificationService(db)
        self.audit_service = AuditService(db)

    def calculate_signals(self, lost: ItemReport, found: ItemReport) -> Tuple[float, Dict[str, float], List[str]]:
        reasons = []

        # 1. Category similarity (Strict or compatible)
        category_match = (lost.category.lower().strip() == found.category.lower().strip())
        category_score = 1.0 if category_match else 0.20
        if category_match:
            reasons.append(f"Matching category ({lost.category})")

        # 2. Text similarity via embeddings
        text_score = 0.50
        if lost.text_embedding and found.text_embedding:
            try:
                emb1 = json.loads(lost.text_embedding)
                emb2 = json.loads(found.text_embedding)
                text_score = cosine_similarity(emb1, emb2)
            except Exception:
                text_score = 0.50
        else:
            # Fallback string comparison
            t1 = f"{lost.title} {lost.description}".lower()
            t2 = f"{found.title} {found.description}".lower()
            words1 = set(t1.split())
            words2 = set(t2.split())
            intersection = words1.intersection(words2)
            if words1 or words2:
                text_score = len(intersection) / max(1, len(words1.union(words2)))
                text_score = min(1.0, 0.4 + text_score * 0.6)

        if text_score > 0.70:
            reasons.append("High title and description context similarity")

        # 3. Visual similarity
        visual_score = 0.50
        if lost.image_embedding and found.image_embedding:
            try:
                img_emb1 = json.loads(lost.image_embedding)
                img_emb2 = json.loads(found.image_embedding)
                visual_score = cosine_similarity(img_emb1, img_emb2)
            except Exception:
                visual_score = 0.60
        else:
            visual_score = 0.65  # Default baseline for user uploaded items

        if visual_score > 0.75:
            reasons.append("Visual appearance correlates with item features")

        # 4. Location proximity
        location_score = 0.50
        if lost.place_id and found.place_id and lost.place_id == found.place_id:
            location_score = 1.0
            reasons.append(f"Same designated campus location ({lost.incident_place})")
        elif lost.incident_place.lower() in found.incident_place.lower() or found.incident_place.lower() in lost.incident_place.lower():
            location_score = 0.85
            reasons.append(f"Proximate campus area ({lost.incident_place})")
        else:
            location_score = 0.40

        # 5. Time proximity
        time_score = 0.70
        if lost.event_date and found.event_date:
            try:
                d1 = datetime.strptime(lost.event_date[:10], "%Y-%m-%d")
                d2 = datetime.strptime(found.event_date[:10], "%Y-%m-%d")
                delta_days = abs((d1 - d2).days)
                if delta_days == 0:
                    time_score = 1.0
                    reasons.append("Reported lost and found on the exact same date")
                elif delta_days <= 2:
                    time_score = 0.85
                    reasons.append("Reported within 48 hours of occurrence")
                elif delta_days <= 7:
                    time_score = 0.65
                else:
                    time_score = 0.35
            except Exception:
                time_score = 0.50

        # 6. Attribute match (Brand, Color, Model)
        attr_matches = 0
        attr_total = 0
        if lost.brand and found.brand:
            attr_total += 1
            if lost.brand.lower().strip() == found.brand.lower().strip():
                attr_matches += 1
                reasons.append(f"Matching brand ({lost.brand})")

        if lost.color and found.color:
            attr_total += 1
            if lost.color.lower().strip() == found.color.lower().strip():
                attr_matches += 1
                reasons.append(f"Matching primary color ({lost.color})")

        attribute_score = (attr_matches / attr_total) if attr_total > 0 else 0.60

        # Configurable Weighted Combination
        w_v = settings.MATCH_WEIGHT_VISUAL
        w_tx = settings.MATCH_WEIGHT_TEXT
        w_loc = settings.MATCH_WEIGHT_LOCATION
        w_tm = settings.MATCH_WEIGHT_TIME
        w_cat = 0.15
        w_attr = settings.MATCH_WEIGHT_ATTRIBUTE

        overall_score = (
            visual_score * w_v +
            text_score * w_tx +
            location_score * w_loc +
            time_score * w_tm +
            category_score * w_cat +
            attribute_score * w_attr
        )
        overall_score = round(min(0.98, max(0.10, overall_score)), 2)

        signals = {
            "visual": round(visual_score, 2),
            "text": round(text_score, 2),
            "location": round(location_score, 2),
            "time": round(time_score, 2),
            "category": round(category_score, 2),
            "attribute": round(attribute_score, 2)
        }

        return overall_score, signals, reasons

    def run_matching_for_report(self, target_report: ItemReport) -> List[PotentialMatch]:
        """Find candidates across database and compute similarity scores."""
        target_type = target_report.report_type.upper()
        candidate_type = ReportType.FOUND.value if target_type == ReportType.LOST.value else ReportType.LOST.value

        candidates = self.report_repo.get_all(
            report_type=candidate_type,
            limit=50
        )

        matches_created = []

        for cand in candidates:
            # Skip if already closed or returned
            if cand.status in [ReportStatus.RETURNED.value, ReportStatus.CLOSED.value]:
                continue

            lost_rep = target_report if target_type == ReportType.LOST.value else cand
            found_rep = cand if target_type == ReportType.LOST.value else target_report

            score, signals, reasons = self.calculate_signals(lost_rep, found_rep)

            if score >= settings.MATCH_SCORE_THRESHOLD:
                existing = self.match_repo.get_by_reports(lost_rep.id, found_rep.id)
                if existing:
                    existing.similarity_score = score
                    existing.visual_score = signals["visual"]
                    existing.text_score = signals["text"]
                    existing.location_score = signals["location"]
                    existing.time_score = signals["time"]
                    existing.category_score = signals["category"]
                    existing.attribute_score = signals["attribute"]
                    existing.reasons_json = json.dumps(reasons)
                    self.match_repo.update(existing)
                    matches_created.append(existing)
                else:
                    match_obj = PotentialMatch(
                        id=f"mat_{uuid.uuid4().hex[:10]}",
                        lost_report_id=lost_rep.id,
                        found_report_id=found_rep.id,
                        similarity_score=score,
                        visual_score=signals["visual"],
                        text_score=signals["text"],
                        location_score=signals["location"],
                        time_score=signals["time"],
                        category_score=signals["category"],
                        attribute_score=signals["attribute"],
                        reasons_json=json.dumps(reasons),
                        match_clues_json=json.dumps(reasons[:2]),
                        status=MatchStatus.PENDING_REVIEW.value
                    )
                    self.match_repo.create(match_obj)
                    matches_created.append(match_obj)

                    # Notify lost item reporter
                    self.notif_service.send_notification(
                        user_id=lost_rep.reporter_id,
                        title="Potential Match Detected on Match Radar!",
                        body=f"A found {found_rep.title} at {found_rep.incident_place} matches your lost report ({int(score * 100)}% similarity).",
                        notif_type=NotificationType.MATCH_FOUND.value,
                        related_case_id=match_obj.id,
                        link_url=f"/student/matches/{match_obj.id}"
                    )

        return matches_created

    def get_matches_for_user(self, user_id: str) -> List[PotentialMatch]:
        user_reports = self.report_repo.get_all(reporter_id=user_id)
        user_report_ids = [r.id for r in user_reports]
        all_matches = self.match_repo.get_all(min_score=settings.MATCH_SCORE_THRESHOLD)
        return [m for m in all_matches if m.lost_report_id in user_report_ids or m.found_report_id in user_report_ids]
