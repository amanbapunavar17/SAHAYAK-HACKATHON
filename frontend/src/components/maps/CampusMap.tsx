import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CampusLocation } from '../../types';
import { api } from '../../lib/api';
import nieNorthGeoJson from '../../data/nie_north';
import { 
  MapPin, 
  Layers, 
  Flame, 
  Building2, 
  Compass, 
  Eye, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Sparkles,
  Maximize2
} from 'lucide-react';
import { NeumorphicCard } from '../ui/NeumorphicCard';

interface CampusMapProps {
  onLocationSelect?: (locationName: string) => void;
  selectedLocation?: string;
  showHeatmap?: boolean;
}

type MapTileStyle = 'campus' | 'satellite' | 'street';

export const CampusMap: React.FC<CampusMapProps> = ({
  onLocationSelect,
  selectedLocation,
  showHeatmap: initialHeatmap = true
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const geoJsonLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const [locations, setLocations] = useState<CampusLocation[]>([]);
  const [activeZoneFilter, setActiveZoneFilter] = useState<string>('ALL');
  const [isHeatmapMode, setIsHeatmapMode] = useState<boolean>(initialHeatmap);
  const [mapTileStyle, setMapTileStyle] = useState<MapTileStyle>('satellite');
  const [selectedBuilding, setSelectedBuilding] = useState<any | null>(null);
  const [selectedItemPin, setSelectedItemPin] = useState<any | null>(null);
  const [heatmapData, setHeatmapData] = useState<any>(null);

  // Fetch live locations & heatmap from database
  const loadData = async () => {
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
  };

  useEffect(() => {
    loadData();
  }, []);

  // Helper to switch tile layers (Esri Satellite, Campus Voyager, Street)
  const updateTileLayer = (map: L.Map, style: MapTileStyle) => {
    if (tileLayerGroupRef.current) {
      tileLayerGroupRef.current.clearLayers();
    } else {
      tileLayerGroupRef.current = L.layerGroup().addTo(map);
    }

    const tileGroup = tileLayerGroupRef.current;

    if (style === 'satellite') {
      // Esri ArcGIS World Imagery High-Res Satellite
      const sat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; Esri &bull; High-Res Satellite Imagery',
        maxNativeZoom: 19,
        maxZoom: 20
      });
      // Esri Places & Boundaries Labels Overlay
      const labels = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 20
      });
      // Esri Transportation Overlay
      const roads = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 20
      });

      tileGroup.addLayer(sat);
      tileGroup.addLayer(roads);
      tileGroup.addLayer(labels);
    } else if (style === 'campus') {
      // CartoDB Voyager: Crisp, modern vector colors
      const voyager = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &bull; NIE Campus',
        maxZoom: 20,
        subdomains: 'abcd'
      });
      tileGroup.addLayer(voyager);
    } else {
      // OpenStreetMap Standard
      const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      });
      tileGroup.addLayer(osm);
    }
  };

  // 1. Initialize Leaflet Map and Render exact nie_north.geojson on Esri Satellite
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center around NIE North coordinates in nie_north.geojson
    const centerLatLng: [number, number] = [12.3713, 76.5869];

    const map = L.map(mapContainerRef.current, {
      center: centerLatLng,
      zoom: 17,
      minZoom: 14,
      maxZoom: 20,
      zoomControl: false
    });

    updateTileLayer(map, 'satellite');
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Layer group for GeoJSON Boundary & Places
    const geoJsonGroup = L.layerGroup().addTo(map);
    geoJsonLayerGroupRef.current = geoJsonGroup;

    // Load exact GeoJSON data with high-contrast glowing styling for Satellite
    try {
      const geoLayer = L.geoJSON(nieNorthGeoJson as any, {
        style: (feature) => {
          if (feature?.geometry?.type === 'Polygon') {
            return {
              color: '#00f0ff',
              weight: 3,
              dashArray: '5, 5',
              fillColor: '#00f0ff',
              fillOpacity: 0.12
            };
          }
          return {};
        },
        onEachFeature: (feature, layer) => {
          if (feature?.geometry?.type === 'Polygon') {
            layer.bindTooltip(`🏛️ <strong>${feature.properties?.Name || 'NIE North Campus Boundary'}</strong><br/>${feature.properties?.description || 'National Institute of Engineering'}`, { sticky: true });
          }
        }
      });

      geoJsonGroup.addLayer(geoLayer);

      // Fit map viewport directly to the nie_north.geojson bounds
      const bounds = geoLayer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [35, 35], maxZoom: 18 });
      }
    } catch (err) {
      console.warn('Failed to render nie_north.geojson layer:', err);
    }

    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Invalidate size on mount and container resizing
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. React to Tile Style Changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      updateTileLayer(mapInstanceRef.current, mapTileStyle);
    }
  }, [mapTileStyle]);

  // 3. Render Landmark Markers from nie_north.geojson & Live DB Reports
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    const markersGroup = markersGroupRef.current;
    markersGroup.clearLayers();

    // Extract Point landmarks from nie_north.geojson
    const geoJsonPoints = ((nieNorthGeoJson as any).features || []).filter(
      (f: any) => f.geometry?.type === 'Point'
    );

    // Render Point Landmark Markers
    geoJsonPoints.forEach((feat: any) => {
      const [lng, lat] = feat.geometry.coordinates;
      const props = feat.properties || {};
      const name = props.name || 'Campus Place';
      const category = props.category || 'General';
      const color = props.color || '#0375DE';

      // Match with database location report counts
      const matchedDbLoc = locations.find(l => 
        l.name.toLowerCase().includes(name.toLowerCase()) || 
        name.toLowerCase().includes(l.name.toLowerCase()) ||
        name.toLowerCase().includes(l.building?.toLowerCase() || '')
      );

      const itemCount = matchedDbLoc?.itemCount || 0;
      const isSelected = selectedLocation === name || selectedBuilding?.name === name;

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
            box-shadow: 0 4px 10px rgba(0,0,0,0.35);
            cursor: pointer;
            transition: all 0.2s ease;
            ${isSelected ? 'transform: rotate(-45deg) scale(1.3); border-color: #F59E0B;' : ''}
          ">
            <span style="transform: rotate(45deg); font-size: 13px; font-weight: bold; color: white;">📍</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      const popupHtml = `
        <div style="min-width: 190px; font-family: Inter, sans-serif; padding: 4px;">
          <div style="font-weight: 800; font-size: 0.95rem; color: #0C1E33; margin-bottom: 2px;">${name}</div>
          <div style="font-size: 0.72rem; color: ${color}; font-weight: 700; margin-bottom: 4px;">Category: ${category}</div>
          <div style="font-size: 0.75rem; color: #4A5A6A; margin-bottom: 6px;">Active Items Logged: <strong>${itemCount}</strong></div>
          <div style="font-size: 0.7rem; color: #8A96A0;">NIE North Campus Feature</div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        setSelectedBuilding({ name, category, color, itemCount, latitude: lat, longitude: lng });
        setSelectedItemPin(null);
        onLocationSelect?.(name);
      });

      markersGroup.addLayer(marker);
    });

    // Real-Time Dynamic Heatmap from Live Database Reports
    if (isHeatmapMode && heatmapData?.points) {
      heatmapData.points.forEach((p: any) => {
        if (p.totalCount > 0) {
          const radius = Math.max(35, Math.min(85, 30 + p.totalCount * 14));
          const opacity = Math.min(0.7, 0.3 + p.intensity * 0.4);
          const color = p.totalCount >= 3 ? '#EF4444' : p.totalCount >= 1 ? '#F59E0B' : '#0375DE';

          const circle = L.circle([p.latitude, p.longitude], {
            radius: radius,
            color: color,
            fillColor: color,
            fillOpacity: opacity,
            weight: 2
          });
          circle.bindTooltip(`🔥 Activity Hotspot: <strong>${p.name}</strong><br/>• Total Logs: ${p.totalCount} (Lost: ${p.lostCount}, Found: ${p.foundCount}, Resolved: ${p.returnedCount || 0})`, { permanent: false });
          markersGroup.addLayer(circle);
        }
      });
    }

    // Live Item Pins (Render actual lost/found item points)
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
              width: 28px;
              height: 28px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 2px solid #ffffff;
              box-shadow: 0 3px 8px rgba(0,0,0,0.4);
              cursor: pointer;
              font-size: 12px;
              color: white;
              transition: transform 0.2s;
            ">
              ${symbol}
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          popupAnchor: [0, -14]
        });

        const itemMarker = L.marker([item.latitude, item.longitude], { icon: itemIcon });
        const itemPopup = `
          <div style="min-width: 180px; font-family: Inter, sans-serif; padding: 4px;">
            <div style="font-weight: 800; font-size: 0.9rem; color: #0C1E33;">${item.title}</div>
            <div style="font-size: 0.72rem; font-weight: 700; color: ${pinColor}; text-transform: uppercase; margin-top: 1px;">
              ${item.type} &bull; ${item.status}
            </div>
            <div style="font-size: 0.72rem; color: #4A5A6A; margin-top: 3px;">📍 ${item.incidentPlace || item.locationName}</div>
            <div style="font-size: 0.7rem; color: #8A96A0;">📅 ${item.eventDate || 'Recent'} ${item.eventTime || ''}</div>
          </div>
        `;
        itemMarker.bindPopup(itemPopup);
        itemMarker.on('click', () => {
          setSelectedItemPin(item);
          setSelectedBuilding(null);
        });
        markersGroup.addLayer(itemMarker);
      });
    }
  }, [activeZoneFilter, isHeatmapMode, selectedLocation, selectedBuilding, locations, heatmapData]);

  // 2. React to Tile Style Changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      updateTileLayer(mapInstanceRef.current, mapTileStyle);
    }
  }, [mapTileStyle]);

  // 3. Render Markers & Live Items
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    const markersGroup = markersGroupRef.current;
    markersGroup.clearLayers();

    const filtered = locations.filter(loc => {
      if (activeZoneFilter === 'ALL') return true;
      return loc.zone === activeZoneFilter;
    });

    // A. Campus Landmark / Desk Markers
    filtered.forEach(loc => {
      const isSelected = selectedLocation === loc.name || selectedBuilding?.id === loc.id;
      const zoneColors: Record<string, string> = {
        'Academic Block': '#0375DE',
        'Lab Block': '#8B5CF6',
        'Library': '#0284C7',
        'Canteen': '#D97706',
        'Parking': '#64748B',
        'Gate': '#059669',
        'Admin': '#DC2626'
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
            box-shadow: 0 4px 10px rgba(0,0,0,0.35);
            cursor: pointer;
            transition: all 0.2s ease;
            ${isSelected ? 'transform: rotate(-45deg) scale(1.3); border-color: #F59E0B;' : ''}
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
        <div style="min-width: 190px; font-family: Inter, sans-serif; padding: 4px;">
          <div style="font-weight: 800; font-size: 0.95rem; color: #0C1E33; margin-bottom: 2px;">${loc.name}</div>
          <div style="font-size: 0.72rem; color: #0375DE; font-weight: 700; margin-bottom: 4px;">Zone: ${loc.zone} (${loc.building})</div>
          <div style="font-size: 0.75rem; color: #4A5A6A; margin-bottom: 6px;">Active Items Logged: <strong>${loc.itemCount || 0}</strong></div>
          ${loc.hasCollectionDesk ? '<div style="background: #E8F5EE; color: #1E6B47; font-size: 0.7rem; font-weight: bold; padding: 3px 8px; border-radius: 6px; display: inline-block;">🛡️ Proctor Collection Desk Active</div>' : ''}
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        setSelectedBuilding(loc);
        setSelectedItemPin(null);
        onLocationSelect?.(loc.name);
      });

      markersGroup.addLayer(marker);
    });

    // B. Real-Time Dynamic Heatmap from Live Database Reports
    if (isHeatmapMode && heatmapData?.points) {
      heatmapData.points.forEach((p: any) => {
        if (p.totalCount > 0) {
          const radius = Math.max(35, Math.min(90, 30 + p.totalCount * 14));
          const opacity = Math.min(0.7, 0.3 + p.intensity * 0.4);
          const color = p.totalCount >= 3 ? '#EF4444' : p.totalCount >= 1 ? '#F59E0B' : '#0375DE';

          const circle = L.circle([p.latitude, p.longitude], {
            radius: radius,
            color: color,
            fillColor: color,
            fillOpacity: opacity,
            weight: 2
          });
          circle.bindTooltip(`🔥 Activity Hotspot: <strong>${p.name}</strong><br/>• Total Logs: ${p.totalCount} (Lost: ${p.lostCount}, Found: ${p.foundCount}, Resolved: ${p.returnedCount || 0})`, { permanent: false });
          markersGroup.addLayer(circle);
        }
      });
    }

    // C. Live Item Pins (Render actual lost/found item points)
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
              width: 28px;
              height: 28px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 2px solid #ffffff;
              box-shadow: 0 3px 8px rgba(0,0,0,0.4);
              cursor: pointer;
              font-size: 12px;
              color: white;
              transition: transform 0.2s;
            ">
              ${symbol}
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          popupAnchor: [0, -14]
        });

        const itemMarker = L.marker([item.latitude, item.longitude], { icon: itemIcon });
        const itemPopup = `
          <div style="min-width: 180px; font-family: Inter, sans-serif; padding: 4px;">
            <div style="font-weight: 800; font-size: 0.9rem; color: #0C1E33;">${item.title}</div>
            <div style="font-size: 0.72rem; font-weight: 700; color: ${pinColor}; text-transform: uppercase; margin-top: 1px;">
              ${item.type} &bull; ${item.status}
            </div>
            <div style="font-size: 0.72rem; color: #4A5A6A; margin-top: 3px;">📍 ${item.incidentPlace || item.locationName}</div>
            <div style="font-size: 0.7rem; color: #8A96A0;">📅 ${item.eventDate || 'Recent'} ${item.eventTime || ''}</div>
          </div>
        `;
        itemMarker.bindPopup(itemPopup);
        itemMarker.on('click', () => {
          setSelectedItemPin(item);
          setSelectedBuilding(null);
        });
        markersGroup.addLayer(itemMarker);
      });
    }
  }, [activeZoneFilter, isHeatmapMode, selectedLocation, selectedBuilding, locations, heatmapData]);

  // Center on campus
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([12.3548, 76.6130], 17, { animate: true });
    }
  };

  return (
    <div className="relative w-full h-[560px] rounded-3xl overflow-hidden bg-sahayak-cream-soft border border-sahayak-brown/20 shadow-neumorph p-0">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Floating Controls */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Zone Filters */}
        <div className="flex items-center gap-1.5 bg-sahayak-cream/95 backdrop-blur-md p-1.5 rounded-2xl border border-sahayak-brown/20 shadow-neumorph-sm pointer-events-auto overflow-x-auto max-w-full">
          {['ALL', 'Academic Block', 'Lab Block', 'Library', 'Canteen', 'Parking'].map(zone => (
            <button
              key={zone}
              onClick={() => setActiveZoneFilter(zone)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeZoneFilter === zone
                  ? 'bg-sahayak-blue text-white shadow-neumorph-sm'
                  : 'text-sahayak-text-secondary hover:text-sahayak-blue hover:bg-sahayak-cream-soft'
              }`}
            >
              {zone === 'ALL' ? 'All Zones' : zone}
            </button>
          ))}
        </div>

        {/* Right Tools: Style Switcher & Heatmap */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Tile Style Selector */}
          <div className="flex items-center bg-sahayak-cream/95 backdrop-blur-md p-1 rounded-xl border border-sahayak-brown/20 shadow-neumorph-sm text-xs font-bold">
            <button
              onClick={() => setMapTileStyle('campus')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                mapTileStyle === 'campus' ? 'bg-sahayak-blue text-white' : 'text-sahayak-text-secondary hover:text-sahayak-blue'
              }`}
            >
              Campus
            </button>
            <button
              onClick={() => setMapTileStyle('satellite')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                mapTileStyle === 'satellite' ? 'bg-sahayak-blue text-white' : 'text-sahayak-text-secondary hover:text-sahayak-blue'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setMapTileStyle('street')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                mapTileStyle === 'street' ? 'bg-sahayak-blue text-white' : 'text-sahayak-text-secondary hover:text-sahayak-blue'
              }`}
            >
              Street
            </button>
          </div>

          {/* Heatmap Toggle */}
          <button
            onClick={() => setIsHeatmapMode(!isHeatmapMode)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-neumorph-sm cursor-pointer ${
              isHeatmapMode
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-sahayak-cream/95 text-sahayak-text-secondary border border-sahayak-brown/20 hover:text-sahayak-blue'
            }`}
          >
            <Flame className={`w-4 h-4 ${isHeatmapMode ? 'text-white' : 'text-amber-500'}`} />
            <span>{isHeatmapMode ? 'Heatmap: ON' : 'Heatmap'}</span>
          </button>

          {/* Recenter */}
          <button
            onClick={handleRecenter}
            className="p-2 rounded-xl bg-sahayak-cream/95 border border-sahayak-brown/20 text-sahayak-blue hover:text-sahayak-blue-deep shadow-neumorph-sm cursor-pointer"
            title="Recenter Map to NIE North"
          >
            <Compass className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Floating Legend */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-auto hidden md:flex items-center gap-3 bg-sahayak-cream/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-sahayak-brown/20 shadow-neumorph text-[11px] font-semibold text-sahayak-text-secondary">
        <span className="font-bold text-sahayak-blue-deep">Live Legend:</span>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span>Lost Report</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span>Found Item</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Resolved</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-amber-500 font-bold">🔥</span>
          <span>Hotspot Radius</span>
        </div>
        <div className="flex items-center gap-1">
          <span>🏢</span>
          <span>Campus Desk</span>
        </div>
      </div>

      {/* Selected Item Pin Drawer */}
      {selectedItemPin && (
        <div className="absolute bottom-4 right-4 sm:w-84 bg-sahayak-cream/98 backdrop-blur-md p-4 rounded-2xl border border-sahayak-brown/20 shadow-xl z-20 animate-slideUp">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
                selectedItemPin.status === 'RETURNED' ? 'bg-emerald-500' : selectedItemPin.type === 'LOST' ? 'bg-red-500' : 'bg-blue-500'
              }`}>
                {selectedItemPin.type === 'LOST' ? '🔍' : '📦'}
              </span>
              <div>
                <h4 className="text-sm font-bold text-sahayak-blue-deep truncate max-w-[180px]">{selectedItemPin.title}</h4>
                <span className="text-[11px] font-bold uppercase text-sahayak-blue">{selectedItemPin.type} &bull; {selectedItemPin.status}</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedItemPin(null)}
              className="text-sahayak-text-muted hover:text-sahayak-text-primary text-sm font-bold px-1.5 py-0.5"
            >
              &times;
            </button>
          </div>
          <div className="mt-3 space-y-1 text-xs text-sahayak-text-secondary">
            <p><strong>Location:</strong> {selectedItemPin.incidentPlace || selectedItemPin.locationName}</p>
            <p><strong>Category:</strong> {selectedItemPin.category}</p>
            <p><strong>Reported:</strong> {selectedItemPin.eventDate || 'Recent'} {selectedItemPin.eventTime || ''}</p>
          </div>
        </div>
      )}

      {/* Selected Building Drawer */}
      {selectedBuilding && (
        <div className="absolute bottom-4 right-4 sm:w-84 bg-sahayak-cream/98 backdrop-blur-md p-4 rounded-2xl border border-sahayak-brown/20 shadow-xl z-20 animate-slideUp">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-sahayak-blue text-white rounded-xl">
                <Building2 className="w-5 h-5" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-sahayak-blue-deep font-heading">{selectedBuilding.name}</h4>
                <span className="text-[11px] font-semibold text-sahayak-blue">{selectedBuilding.zone}</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedBuilding(null)}
              className="text-sahayak-text-muted hover:text-sahayak-text-primary text-sm font-bold px-1.5 py-0.5"
            >
              &times;
            </button>
          </div>
          <p className="text-xs text-sahayak-text-secondary mt-2">
            <strong>Floor / Details:</strong> {selectedBuilding.floor || 'Campus Ground Level'}
          </p>
          <div className="mt-3 pt-2 border-t border-sahayak-brown/10 flex justify-between items-center text-xs">
            <span className="text-sahayak-text-muted text-[11px]">{selectedBuilding.itemCount || 0} items active</span>
            <button
              onClick={() => onLocationSelect?.(selectedBuilding.name)}
              className="px-3 py-1.5 rounded-xl bg-sahayak-blue text-white text-xs font-bold shadow-neumorph hover:bg-sahayak-blue-mid"
            >
              Select Place
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
