import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { CampusLocation, ItemReport } from '../../types';
import { mockCampusLocations, mockReports } from '../../lib/mockData';
import { MapPin, Layers, Flame, Navigation, Building2, Filter } from 'lucide-react';
import { NeumorphicCard } from '../ui/NeumorphicCard';

interface CampusMapProps {
  onLocationSelect?: (locationName: string) => void;
  selectedLocation?: string;
  showHeatmap?: boolean;
}

export const CampusMap: React.FC<CampusMapProps> = ({
  onLocationSelect,
  selectedLocation,
  showHeatmap: initialHeatmap = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const [activeZoneFilter, setActiveZoneFilter] = useState<string>('ALL');
  const [isHeatmapMode, setIsHeatmapMode] = useState<boolean>(initialHeatmap);
  const [selectedBuilding, setSelectedBuilding] = useState<CampusLocation | null>(null);

  // NIE North Campus Boundary
  const campusBoundaryCoords: [number, number][] = [
    [12.3708164, 76.5857619],
    [12.3704832, 76.5876098],
    [12.3702353, 76.5878755],
    [12.3702106, 76.5886288],
    [12.3710493, 76.5885008],
    [12.3709666, 76.5874306],
    [12.3719324, 76.5874824],
    [12.3724239, 76.5871614],
    [12.3741434, 76.5870053],
    [12.3750691, 76.5861900],
    [12.3709411, 76.5840391],
    [12.3708164, 76.5857619]
  ];

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const bounds = L.latLngBounds(campusBoundaryCoords);

    // Initialize Map
    const map = L.map(mapContainerRef.current, {
      center: bounds.getCenter(),
      zoom: 17,
      minZoom: 15,
      maxZoom: 20,
      maxBounds: bounds.pad(0.35),
      maxBoundsViscosity: 0.95,
      zoomControl: false
    });

    // Satellite base layer
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; Esri &bull; High-Res Satellite',
      maxZoom: 20,
      maxNativeZoom: 18,
      minZoom: 15
    }).addTo(map);

    // Frosted Boundary Dim Mask
    const worldOuter: [number, number][] = [[-90, -180], [-90, 180], [90, 180], [90, -180], [-90, -180]];
    L.polygon([worldOuter, campusBoundaryCoords], {
      color: '#070b14',
      fillColor: '#070b14',
      fillOpacity: 0.65,
      weight: 0,
      interactive: false
    }).addTo(map);

    // Campus Perimeter Glowing Outline
    L.polygon(campusBoundaryCoords, {
      color: '#05B6F3',
      weight: 3,
      opacity: 0.9,
      fillColor: 'transparent',
      fillOpacity: 0,
      dashArray: '5, 8',
      interactive: false
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;
    mapInstanceRef.current = map;

    map.fitBounds(bounds, { padding: [30, 30] });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    const markersGroup = markersGroupRef.current;
    markersGroup.clearLayers();

    const filtered = mockCampusLocations.filter(loc => {
      if (activeZoneFilter === 'ALL') return true;
      return loc.zone === activeZoneFilter;
    });

    filtered.forEach(loc => {
      const isSelected = selectedLocation === loc.name || selectedBuilding?.id === loc.id;
      const zoneColors: Record<string, string> = {
        'Academic Block': '#0375DE',
        'Lab Block': '#8B5CF6',
        'Library': '#05B6F3',
        'Canteen': '#DDAD4B',
        'Parking': '#64748B',
        'Gate': '#3F8F68'
      };

      const color = zoneColors[loc.zone] || '#05B6F3';

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="
            background: ${color};
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #ffffff;
            box-shadow: 0 4px 10px rgba(0,0,0,0.5);
            cursor: pointer;
            ${isSelected ? 'transform: rotate(-45deg) scale(1.3); border-color: #DDAD4B;' : ''}
          ">
            <span style="transform: rotate(45deg); font-size: 14px;">📍</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });

      const marker = L.marker([loc.latitude, loc.longitude], { icon: customIcon });

      const popupHtml = `
        <div style="min-width: 170px; font-family: Inter, sans-serif; padding: 4px;">
          <div style="font-weight: 700; font-size: 0.9rem; color: #18304A; margin-bottom: 2px;">${loc.name}</div>
          <div style="font-size: 0.72rem; color: #0375DE; font-weight: 600; margin-bottom: 4px;">${loc.zone}</div>
          <div style="font-size: 0.72rem; color: #5F6B76; margin-bottom: 6px;">${loc.floor || 'Campus Landmark'}</div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        setSelectedBuilding(loc);
        onLocationSelect?.(loc.name);
      });

      markersGroup.addLayer(marker);
    });

    // If heatmap mode enabled, render hotspot circles
    if (isHeatmapMode) {
      const hotspots = [
        { lat: 12.3713084, lng: 76.5869772, count: 12, label: 'MB Block CRs' },
        { lat: 12.3728602, lng: 76.5856585, count: 9, label: 'Food Court' },
        { lat: 12.3715731, lng: 76.5871760, count: 7, label: 'Library' },
        { lat: 12.3714376, lng: 76.5847868, count: 5, label: 'SB Labs' }
      ];

      hotspots.forEach(h => {
        const circle = L.circle([h.lat, h.lng], {
          radius: 25,
          color: '#B84F45',
          fillColor: '#B84F45',
          fillOpacity: 0.45,
          weight: 2
        });
        circle.bindTooltip(`🔥 Activity Hotspot: ${h.label} (${h.count} reports logged)`, { permanent: false });
        markersGroup.addLayer(circle);
      });
    }
  }, [activeZoneFilter, isHeatmapMode, selectedLocation, selectedBuilding]);

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden neu-card p-0 border border-cream-warm shadow-neu-card">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Controls Overlay */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Zone Filters */}
        <div className="flex items-center gap-1.5 bg-cream-soft/90 backdrop-blur-md p-1.5 rounded-xl border border-cream-warm shadow-md pointer-events-auto overflow-x-auto max-w-full">
          {['ALL', 'Academic Block', 'Lab Block', 'Library', 'Canteen', 'Parking'].map(zone => (
            <button
              key={zone}
              onClick={() => setActiveZoneFilter(zone)}
              className={`text-xs font-semibold px-3 py-1 rounded-lg transition-all whitespace-nowrap ${
                activeZoneFilter === zone
                  ? 'bg-primary-dark text-white shadow-sm'
                  : 'text-sahayak-secondary hover:text-sahayak-text hover:bg-cream'
              }`}
            >
              {zone === 'ALL' ? 'All Zones' : zone}
            </button>
          ))}
        </div>

        {/* Heatmap Toggle */}
        <button
          onClick={() => setIsHeatmapMode(!isHeatmapMode)}
          className={`neu-btn-secondary text-xs py-1.5 px-3 pointer-events-auto flex items-center gap-1.5 shadow-md ${
            isHeatmapMode ? 'bg-amber-100 text-amber-900 border-amber-300' : ''
          }`}
        >
          <Flame className={`w-4 h-4 ${isHeatmapMode ? 'text-amber-600' : 'text-sahayak-secondary'}`} />
          <span>{isHeatmapMode ? 'Heatmap: Active' : 'Heatmap View'}</span>
        </button>
      </div>

      {/* Selected Location Bottom Drawer */}
      {selectedBuilding && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-cream-soft/95 backdrop-blur-md p-4 rounded-2xl border border-cream-warm shadow-xl z-10 animate-slideUp">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-primary-dark/10 rounded-lg text-primary-dark">
                <Building2 className="w-5 h-5" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-sahayak-text font-heading">{selectedBuilding.name}</h4>
                <span className="text-[11px] font-semibold text-primary">{selectedBuilding.zone}</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedBuilding(null)}
              className="text-sahayak-muted hover:text-sahayak-text text-sm font-bold"
            >
              &times;
            </button>
          </div>
          <p className="text-xs text-sahayak-secondary mt-2">
            Floor: {selectedBuilding.floor || 'Campus Ground Level'}
          </p>
          <div className="mt-3 pt-2 border-t border-cream-warm flex justify-between items-center text-xs">
            <span className="text-sahayak-muted text-[11px]">Ready for report tagging</span>
            <button
              onClick={() => onLocationSelect?.(selectedBuilding.name)}
              className="neu-btn-primary text-[11px] py-1 px-3"
            >
              Select Place
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
