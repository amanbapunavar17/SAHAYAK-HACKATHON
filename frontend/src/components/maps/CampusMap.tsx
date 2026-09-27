import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { CampusLocation, ItemReport } from '../../types';
import { api } from '../../lib/api';
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

  const [locations, setLocations] = useState<CampusLocation[]>([]);
  const [activeZoneFilter, setActiveZoneFilter] = useState<string>('ALL');
  const [isHeatmapMode, setIsHeatmapMode] = useState<boolean>(initialHeatmap);
  const [selectedBuilding, setSelectedBuilding] = useState<CampusLocation | null>(null);

  const [heatmapData, setHeatmapData] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [locData, heatRes] = await Promise.all([
          api.locations.list(),
          api.locations.heatmap()
        ]);
        if (Array.isArray(locData) && locData.length > 0) {
          setLocations(locData);
        }
        if (heatRes && heatRes.points) {
          setHeatmapData(heatRes);
        }
      } catch (err) {
        console.warn('Failed to fetch live locations & heatmap:', err);
      }
    }
    loadData();
  }, []);

  // NIE North Campus Boundary
  const campusBoundaryCoords: [number, number][] = [
    [12.3530, 76.6110],
    [12.3565, 76.6115],
    [12.3570, 76.6145],
    [12.3530, 76.6150],
    [12.3530, 76.6110]
  ];

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center map around NIE North Campus
    const centerLatLng: [number, number] = [12.3548, 76.6130];

    // Initialize Map
    const map = L.map(mapContainerRef.current, {
      center: centerLatLng,
      zoom: 17,
      minZoom: 14,
      maxZoom: 20,
      zoomControl: false
    });

    // High-Resolution Satellite base layer
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; Esri &bull; High-Res Satellite',
      maxZoom: 20,
      maxNativeZoom: 18,
      minZoom: 14
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers & Live Heatmap
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    const markersGroup = markersGroupRef.current;
    markersGroup.clearLayers();

    const filtered = locations.filter(loc => {
      if (activeZoneFilter === 'ALL') return true;
      return loc.zone === activeZoneFilter;
    });

    // 1. Campus Landmark / Desk Markers
    filtered.forEach(loc => {
      const isSelected = selectedLocation === loc.name || selectedBuilding?.id === loc.id;
      const zoneColors: Record<string, string> = {
        'Academic Block': '#0375DE',
        'Lab Block': '#8B5CF6',
        'Library': '#05B6F3',
        'Canteen': '#DDAD4B',
        'Parking': '#64748B',
        'Gate': '#3F8F68',
        'Admin': '#E06D53'
      };

      const color = zoneColors[loc.zone] || '#0375DE';

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
            <span style="transform: rotate(45deg); font-size: 13px; font-weight: bold; color: white;">🏢</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });

      const marker = L.marker([loc.latitude, loc.longitude], { icon: customIcon });

      const popupHtml = `
        <div style="min-width: 180px; font-family: Inter, sans-serif; padding: 4px;">
          <div style="font-weight: 800; font-size: 0.95rem; color: #0C1E33; margin-bottom: 2px;">${loc.name}</div>
          <div style="font-size: 0.72rem; color: #0375DE; font-weight: 700; margin-bottom: 4px;">Zone: ${loc.zone} (${loc.building})</div>
          <div style="font-size: 0.75rem; color: #4A5A6A; margin-bottom: 6px;">Active Items Logged: <strong>${loc.itemCount || 0}</strong></div>
          ${loc.hasCollectionDesk ? '<div style="background: #E8F5EE; color: #1E6B47; font-size: 0.7rem; font-weight: bold; padding: 2px 6px; border-radius: 4px; display: inline-block;">Proctor Collection Desk Active</div>' : ''}
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        setSelectedBuilding(loc);
        onLocationSelect?.(loc.name);
      });

      markersGroup.addLayer(marker);
    });

    // 2. Real-Time Dynamic Heatmap from Live Database Reports
    if (isHeatmapMode && heatmapData?.points) {
      heatmapData.points.forEach((p: any) => {
        if (p.totalCount > 0) {
          const radius = Math.max(35, Math.min(90, 30 + p.totalCount * 15));
          const opacity = Math.min(0.75, 0.35 + p.intensity * 0.4);
          const color = p.totalCount >= 3 ? '#E04F43' : p.totalCount >= 1 ? '#F59E0B' : '#0375DE';

          const circle = L.circle([p.latitude, p.longitude], {
            radius: radius,
            color: color,
            fillColor: color,
            fillOpacity: opacity,
            weight: 2
          });
          circle.bindTooltip(`🔥 Live Activity Hotspot: ${p.name}<br/>• Total Logs: ${p.totalCount} (Lost: ${p.lostCount}, Found: ${p.foundCount}, Resolved: ${p.returnedCount || 0})`, { permanent: false });
          markersGroup.addLayer(circle);
        }
      });
    }

    // 3. Live Item Pins (Render actual lost/found item points)
    if (heatmapData?.liveItems && heatmapData.liveItems.length > 0) {
      heatmapData.liveItems.forEach((item: any) => {
        const isLost = item.type === 'LOST';
        const isResolved = item.status === 'RETURNED' || item.status === 'CLOSED';
        const pinColor = isResolved ? '#10B981' : isLost ? '#EF4444' : '#3B82F6';
        const symbol = isResolved ? '✓' : isLost ? '🔍' : '📦';

        const itemIcon = L.divIcon({
          className: 'item-live-pin',
          html: `
            <div style="
              background: ${pinColor};
              width: 26px;
              height: 26px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 2px solid #ffffff;
              box-shadow: 0 2px 6px rgba(0,0,0,0.4);
              cursor: pointer;
              font-size: 11px;
              color: white;
            ">
              ${symbol}
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
          popupAnchor: [0, -13]
        });

        const itemMarker = L.marker([item.latitude, item.longitude], { icon: itemIcon });
        const itemPopup = `
          <div style="min-width: 170px; font-family: Inter, sans-serif; padding: 4px;">
            <div style="font-weight: 800; font-size: 0.9rem; color: #0C1E33;">${item.title}</div>
            <div style="font-size: 0.72rem; font-weight: 700; color: ${pinColor}; text-transform: uppercase;">${item.type} • ${item.status}</div>
            <div style="font-size: 0.72rem; color: #4A5A6A; margin-top: 2px;">📍 ${item.incidentPlace || item.locationName}</div>
            <div style="font-size: 0.7rem; color: #8A96A0;">📅 ${item.eventDate || 'Recent'}</div>
          </div>
        `;
        itemMarker.bindPopup(itemPopup);
        markersGroup.addLayer(itemMarker);
      });
    }
  }, [activeZoneFilter, isHeatmapMode, selectedLocation, selectedBuilding, locations, heatmapData]);

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
