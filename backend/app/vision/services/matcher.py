import logging
from typing import List, Tuple, Dict, Any

from app.vision.core.config import vision_settings
from app.vision.schemas.comparison import (
    ComparisonResult, MatchSignals, CandidatePayload, RankedMatch, MultiMatchResponse
)
from app.vision.schemas.features import ProcessedItem
from app.vision.services.embedder import VisualEmbedder
from app.vision.services.visual_features import VisualFeatureExtractor
from app.vision.utils.serialization import unpack_descriptors

logger = logging.getLogger("sahayak.vision.matcher")


class VisualMatchingEngine:
    """
    Multi-signal visual matching engine combining:
    - OpenCLIP semantic embedding similarity
    - Perceptual hashes (pHash, dHash, aHash)
    - ORB local invariant descriptors + BFMatcher
    - Category compatibility
    """
    def __init__(self):
        self.feature_extractor = VisualFeatureExtractor()
        self.embedder = VisualEmbedder()

    def compare_items(self, item_a: ProcessedItem, item_b: ProcessedItem) -> ComparisonResult:
        reasons: List[str] = []

        # 1. CLIP Semantic Similarity
        clip_sim = self.embedder.cosine_similarity(
            item_a.embedding.vector,
            item_b.embedding.vector
        )
        if clip_sim >= 0.80:
            reasons.append(f"Strong semantic appearance match ({clip_sim*100:.1f}%)")

        # 2. Perceptual Hash Similarity
        hash_sim = self.feature_extractor.compute_hash_similarity(
            item_a.hashes,
            item_b.hashes
        )
        if hash_sim >= 0.75:
            reasons.append("Structural layout and color gradient correspondence")

        # 3. ORB Keypoints Match
        desc_a = unpack_descriptors(item_a.orb.descriptors_b64)
        desc_b = unpack_descriptors(item_b.orb.descriptors_b64)
        inliers, orb_score = self.feature_extractor.match_orb_descriptors(desc_a, desc_b)
        if inliers >= 8:
            reasons.append(f"Detected {inliers} fine-grained local visual keypoint matches")

        # 4. Category Agreement
        cat_a = item_a.detection.category.lower().strip()
        cat_b = item_b.detection.category.lower().strip()
        cat_match = 1.0 if cat_a == cat_b else 0.30
        if cat_match == 1.0:
            reasons.append(f"Matching category classification: {item_a.detection.category}")

        # Multi-Metric Weighted Fusion
        overall_confidence = (
            vision_settings.WEIGHT_CLIP * clip_sim +
            vision_settings.WEIGHT_HASH * hash_sim +
            vision_settings.WEIGHT_ORB * orb_score +
            vision_settings.WEIGHT_CATEGORY * cat_match
        )

        # Decision Thresholds
        if overall_confidence >= vision_settings.HIGH_CONFIDENCE_THRESHOLD:
            verdict = "MATCH"
            is_match = True
        elif overall_confidence >= vision_settings.SIMILARITY_MATCH_THRESHOLD:
            verdict = "POSSIBLE_MATCH"
            is_match = True
        else:
            verdict = "NO_MATCH"
            is_match = False

        signals = MatchSignals(
            clip_similarity=round(clip_sim, 4),
            hash_similarity=round(hash_sim, 4),
            orb_inliers_score=round(orb_score, 4),
            category_match=round(cat_match, 4),
            overall_confidence=round(overall_confidence, 4)
        )

        return ComparisonResult(
            match=is_match,
            confidence=round(overall_confidence, 4),
            verdict=verdict,
            signals=signals,
            reasons=reasons
        )

    def rank_candidates(
        self,
        query_item: ProcessedItem,
        candidates: List[CandidatePayload]
    ) -> List[RankedMatch]:
        ranked: List[RankedMatch] = []

        for candidate in candidates:
            comp = self.compare_items(query_item, candidate.features)
            ranked.append(RankedMatch(
                candidate_id=candidate.id,
                title=candidate.title,
                confidence=comp.confidence,
                verdict=comp.verdict,
                signals=comp.signals,
                reasons=comp.reasons
            ))

        # Sort descending by confidence
        ranked.sort(key=lambda r: r.confidence, reverse=True)
        return ranked


_engine_instance = None

def get_matching_engine() -> VisualMatchingEngine:
    global _engine_instance
    if _engine_instance is None:
        _engine_instance = VisualMatchingEngine()
    return _engine_instance
