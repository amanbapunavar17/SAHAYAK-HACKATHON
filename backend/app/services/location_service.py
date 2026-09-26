import json
from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.models.location import CampusLocation
from app.db.models.report import ItemReport
from app.repositories.locations import LocationRepository
from app.repositories.reports import ReportRepository


class LocationService:
    def __init__(self, db: Session):
        self.db = db
        self.loc_repo = LocationRepository(db)
        self.report_repo = ReportRepository(db)

    def get_all_locations(self) -> List[CampusLocation]:
        locations = self.loc_repo.get_all()
        # Compute real-time item counts dynamically
        for loc in locations:
            cnt = self.db.query(func.count(ItemReport.id)).filter(ItemReport.place_id == loc.id).scalar()
            loc.item_count = cnt or 0
        return locations

    def get_location_by_id(self, loc_id: str) -> Optional[CampusLocation]:
        return self.loc_repo.get_by_id(loc_id)

    def get_campus_heatmap(self) -> Dict:
        """Return privacy-safe aggregated report and recovery density for NIE North campus."""
        locations = self.get_all_locations()
        points = []

        for loc in locations:
            lost_count = self.db.query(func.count(ItemReport.id)).filter(
                ItemReport.place_id == loc.id,
                ItemReport.report_type == "LOST"
            ).scalar() or 0

            found_count = self.db.query(func.count(ItemReport.id)).filter(
                ItemReport.place_id == loc.id,
                ItemReport.report_type == "FOUND"
            ).scalar() or 0

            intensity = min(1.0, (lost_count + found_count) * 0.15 + 0.1)

            points.append({
                "locationId": loc.id,
                "name": loc.name,
                "zone": loc.zone,
                "latitude": loc.latitude,
                "longitude": loc.longitude,
                "intensity": round(intensity, 2),
                "lostCount": lost_count,
                "foundCount": found_count,
                "hasCollectionDesk": loc.has_collection_desk
            })

        return {
            "campus": "NIE North Campus, Mysuru",
            "dataSource": "HISTORICAL_AGGREGATE",
            "totalLocations": len(points),
            "points": points
        }
