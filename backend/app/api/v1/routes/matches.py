import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models.user import User
from app.db.models.match import PotentialMatch
from app.core.permissions import get_current_user, get_optional_current_user
from app.api.v1.routes.reports import format_report_dict
from app.repositories.matches import MatchRepository
from app.services.matching_service import MatchingService
from app.utils.formatters import api_response

router = APIRouter(prefix="/matches", tags=["Matches"])


def format_match_dict(m: PotentialMatch) -> dict:
    reasons = json.loads(m.reasons_json) if m.reasons_json else []
    match_clues = json.loads(m.match_clues_json) if m.match_clues_json else []

    return {
        "id": m.id,
        "lostReportId": m.lost_report_id,
        "foundReportId": m.found_report_id,
        "similarityScore": m.similarity_score,
        "similarity_score": m.similarity_score,
        "signals": {
            "categoryMatch": m.category_score >= 0.8,
            "imageSimilarity": m.visual_score,
            "imageSimilarityScore": m.visual_score,
            "textSimilarity": m.text_score,
            "textSimilarityScore": m.text_score,
            "locationScore": m.location_score,
            "locationProximityScore": m.location_score,
            "timeScore": m.time_score,
            "timeProximityScore": m.time_score,
            "attributeMatchScore": m.attribute_score,
            "reasons": reasons
        },
        "status": m.status,
        "lostReport": format_report_dict(m.lost_report) if m.lost_report else None,
        "foundReport": format_report_dict(m.found_report) if m.found_report else None,
        "matchClues": match_clues,
        "suggestedAt": m.created_at.isoformat() if m.created_at else None,
        "createdAt": m.created_at.isoformat() if m.created_at else None
    }


@router.get("", summary="Get potential matches for user or campus radar")
def list_matches(
    report_id: Optional[str] = None,
    min_score: float = 0.50,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    svc = MatchingService(db)
    if report_id:
        repo = MatchRepository(db)
        matches = repo.get_all(report_id=report_id, min_score=min_score)
    elif current_user:
        matches = svc.get_matches_for_user(current_user.id)
        if not matches:
            repo = MatchRepository(db)
            matches = repo.get_all(min_score=min_score, limit=20)
    else:
        repo = MatchRepository(db)
        matches = repo.get_all(min_score=min_score, limit=20)

    data = [format_match_dict(m) for m in matches]
    return api_response(data)


@router.get("/{match_id}", summary="Get match details and signal breakdown")
def get_match(match_id: str, db: Session = Depends(get_db)):
    repo = MatchRepository(db)
    match = repo.get_by_id(match_id)
    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Match with ID '{match_id}' not found."
        )
    return api_response(format_match_dict(match))
