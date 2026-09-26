import json
import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.db.models.report import ItemReport, ReportType, ReportStatus
from app.db.models.image import ItemImage, ImageSource
from app.db.models.user import User
from app.integrations.embedding import get_embedding_provider
from app.repositories.reports import ReportRepository
from app.repositories.locations import LocationRepository
from app.schemas.reports import ReportCreate, ReportUpdate, StatusTransitionRequest
from app.services.audit_service import AuditService
from app.services.matching_service import MatchingService
from app.utils.state_machine import validate_status_transition


class ReportService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = ReportRepository(db)
        self.loc_repo = LocationRepository(db)
        self.audit_service = AuditService(db)
        self.matching_service = MatchingService(db)
        self.embedding_provider = get_embedding_provider()

    def get_reports(
        self,
        report_type: Optional[str] = None,
        category: Optional[str] = None,
        status_filter: Optional[str] = None,
        search: Optional[str] = None,
        reporter_id: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[ItemReport]:
        return self.repo.get_all(
            report_type=report_type,
            category=category,
            status=status_filter,
            search=search,
            reporter_id=reporter_id,
            limit=limit,
            offset=offset
        )

    def get_report_by_id(self, report_id: str) -> Optional[ItemReport]:
        return self.repo.get_by_id(report_id)

    def create_report(self, req: ReportCreate, reporter: User) -> ItemReport:
        report_id = f"rep_{uuid.uuid4().hex[:8]}"
        
        # Determine location id if incident_place matches campus location
        place_id = req.place_id
        if not place_id and req.incident_place:
            loc = self.loc_repo.get_by_name(req.incident_place)
            if loc:
                place_id = loc.id

        # Generate text embedding
        combined_text = f"{req.title} {req.category} {req.description} {req.incident_place} {req.brand or ''} {req.color or ''}"
        text_emb = self.embedding_provider.generate_text_embedding(combined_text)

        report = ItemReport(
            id=report_id,
            report_type=req.report_type.upper(),
            title=req.title.strip(),
            category=req.category,
            description=req.description.strip(),
            incident_place=req.incident_place.strip(),
            current_location=req.current_location or ("Finder Custody" if req.report_type.upper() == "FOUND" else None),
            place_id=place_id,
            event_date=req.event_date or datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            event_time=req.event_time or datetime.now(timezone.utc).strftime("%H:%M"),
            brand=req.brand,
            model=req.model,
            color=req.color,
            material=req.material,
            size=req.size,
            distinguishing_marks=req.distinguishing_marks,
            serial_number=req.serial_number,
            secret_verification_clue=req.secret_verification_clue,
            status=ReportStatus.ACTIVE.value,
            reward_points_eligible=50,
            is_anonymous=req.is_anonymous or False,
            reporter_id=reporter.id,
            reporter_name=reporter.full_name,
            reporter_usn=reporter.student_profile.usn if reporter.student_profile else "ADMIN",
            text_embedding=json.dumps(text_emb)
        )

        saved_report = self.repo.create(report)

        # Attach images if URLs provided
        if req.image_urls:
            for idx, url in enumerate(req.image_urls):
                img = ItemImage(
                    id=f"img_{uuid.uuid4().hex[:10]}",
                    report_id=report_id,
                    storage_path=url,
                    url=url,
                    source_type=ImageSource.USER_UPLOADED.value,
                    is_primary=(idx == 0)
                )
                self.repo.add_image(img)

        # Audit log
        self.audit_service.log(
            event_type="REPORT_CREATED",
            description=f"New {report.report_type} report: {report.title} ({report.category}) at {report.incident_place}",
            actor_id=reporter.id,
            actor_name=reporter.full_name,
            actor_role=reporter.role,
            case_id=report.id
        )

        # Run matching
        try:
            self.matching_service.run_matching_for_report(saved_report)
        except Exception as e:
            # Matching shouldn't block report creation
            pass

        return saved_report

    def update_report_status(self, report_id: str, new_status: str, actor: User, notes: Optional[str] = None) -> ItemReport:
        report = self.repo.get_by_id(report_id)
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Report with ID '{report_id}' not found."
            )

        # Permission check: Reporter or Admin
        if report.reporter_id != actor.id and actor.role not in ["admin", "proctor", "authorized_reviewer"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update status for this report."
            )

        # State transition validation
        validate_status_transition(report.status, new_status)

        old_status = report.status
        report.status = new_status
        updated = self.repo.update(report)

        self.audit_service.log(
            event_type="STATUS_TRANSITION",
            description=f"Report {report.id} transitioned from {old_status} to {new_status}. {notes or ''}".strip(),
            actor_id=actor.id,
            actor_name=actor.full_name,
            actor_role=actor.role,
            case_id=report.id
        )

        return updated
