import { useState, useMemo, useEffect, useRef } from "react";
import {
  MapPin,
  Navigation,
  Compass,
  ExternalLink,
  Layers,
  Sparkles,
  Car,
  Tag,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Hotel,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Globe,
  Route,
  ChevronRight,
  CalendarDays,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { PlannerDestination, RouteStop, MatchedPackage } from "@/hooks/use-planner-history";
import { defaultKeralaDestination } from "@/hooks/use-planner-history";
import { matchApiPackages } from "@/data/plannerDatabase";

interface DestinationMapProps {
  destination?: PlannerDestination;
  activeStopIndex?: number;
  onSelectStop?: (index: number) => void;
  apiPackages?: any[];
}

type TileTheme = "osm" | "voyager" | "terrain" | "satellite" | "dark";

export default function DestinationMap({
  destination,
  activeStopIndex = 0,
  onSelectStop,
  apiPackages,
}: DestinationMapProps) {
  const place = destination ?? defaultKeralaDestination;
  const stops: RouteStop[] = place.stops && place.stops.length > 0 ? place.stops : defaultKeralaDestination.stops;

  const [activeTab, setActiveTab] = useState<"interactive_map" | "vector_route" | "itinerary" | "packages">("interactive_map");
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [tileTheme, setTileTheme] = useState<TileTheme>("osm");
  const [selectedStopIdx, setSelectedStopIdx] = useState<number>(activeStopIndex);
  const [travelerCount, setTravelerCount] = useState<number>(2);

  const [roadCoordinates, setRoadCoordinates] = useState<[number, number][]>([]);
  const [roadStats, setRoadStats] = useState<{ distanceKm: number; durationHours: number } | null>(null);
  const [isRoutingRoad, setIsRoutingRoad] = useState(false);
  const [useRealRoads, setUseRealRoads] = useState(true);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);
  const glowPolylineRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);

  const currentStop = stops[selectedStopIdx] || stops[0];

  // Sync external active stop
  useEffect(() => {
    setSelectedStopIdx(activeStopIndex);
  }, [activeStopIndex]);

  // FETCH REAL ROAD ROUTING FROM FREE OSRM API (ZERO API KEYS)
  useEffect(() => {
    if (!stops || stops.length < 2) return;

    let isMounted = true;
    setIsRoutingRoad(true);

    const coordsStr = stops.map((s) => `${s.longitude},${s.latitude}`).join(";");
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`;

    fetch(osrmUrl)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.code === "Ok" && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          // OSRM returns [longitude, latitude], Leaflet needs [latitude, longitude]
          const latLngs: [number, number][] = route.geometry.coordinates.map(
            ([lng, lat]: [number, number]) => [lat, lng]
          );
          setRoadCoordinates(latLngs);
          setRoadStats({
            distanceKm: Math.round(route.distance / 100) / 10,
            durationHours: Math.round((route.duration / 3600) * 10) / 10,
          });

          // If Leaflet polylines exist, update them directly with the road coordinates
          if (polylineRef.current && glowPolylineRef.current) {
            glowPolylineRef.current.setLatLngs(latLngs);
            polylineRef.current.setLatLngs(latLngs);
            polylineRef.current.setStyle({ dashArray: undefined });
          }
        }
      })
      .catch((err) => {
        console.warn("OSRM road route fallback to direct waypoints:", err);
      })
      .finally(() => {
        if (isMounted) setIsRoutingRoad(false);
      });

    return () => {
      isMounted = false;
    };
  }, [stops]);

  // 100% Free Open Map Tile Config (Zero API Keys Required)
  const getTileConfig = (theme: TileTheme) => {
    switch (theme) {
      case "osm":
        return {
          url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          subdomains: "abc",
          maxZoom: 19,
        };
      case "terrain":
        return {
          url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
          subdomains: "abc",
          maxZoom: 17,
        };
      case "satellite":
        return {
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          subdomains: "",
          maxZoom: 19,
        };
      case "dark":
        return {
          url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
          subdomains: "abcd",
          maxZoom: 19,
        };
      case "voyager":
      default:
        return {
          url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
          subdomains: "abcd",
          maxZoom: 19,
        };
    }
  };

  // INITIALIZE / UPDATE LEAFLET MAP
  useEffect(() => {
    if (activeTab !== "interactive_map" || !mapContainerRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    // Create Map Instance if not exists
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: true,
      });

      const config = getTileConfig(tileTheme);
      const tileLayer = L.tileLayer(config.url, {
        maxZoom: config.maxZoom,
        subdomains: config.subdomains,
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      mapInstanceRef.current = map;
    } else {
      // Update tile layer if theme changed
      if (tileLayerRef.current) {
        const config = getTileConfig(tileTheme);
        tileLayerRef.current.setUrl(config.url);
      }
    }

    const map = mapInstanceRef.current;

    // Clear existing markers & route
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    if (polylineRef.current) polylineRef.current.remove();
    if (glowPolylineRef.current) glowPolylineRef.current.remove();

    if (stops.length === 0) return;

    const directLatLngs = stops.map((s) => [s.latitude, s.longitude]);
    const activeLatLngs =
      useRealRoads && roadCoordinates.length > 0 ? roadCoordinates : directLatLngs;

    // Outer Glow Road Route Polyline
    glowPolylineRef.current = L.polyline(activeLatLngs, {
      color: "#38bdf8",
      weight: 7,
      opacity: 0.35,
      lineCap: "round",
      lineJoin: "round",
    }).addTo(map);

    // Main Driving Road Polyline
    polylineRef.current = L.polyline(activeLatLngs, {
      color: "#0284c7",
      weight: 4,
      dashArray: useRealRoads && roadCoordinates.length > 0 ? undefined : "8, 6",
      opacity: 0.95,
      lineCap: "round",
      lineJoin: "round",
    }).addTo(map);

    // Plot Stop Pins with custom DivIcon
    stops.forEach((stop, idx) => {
      const isSelected = selectedStopIdx === idx;

      const iconHtml = `
        <div class="group relative cursor-pointer select-none">
          <div class="flex items-center justify-center">
            ${
              isSelected
                ? `<div class="absolute -inset-2 rounded-full bg-sky-400/30 animate-ping"></div>`
                : ""
            }
            <div class="flex h-8 w-8 items-center justify-center rounded-full border-2 ${
              isSelected
                ? "bg-sky-600 border-white text-white shadow-xl scale-110"
                : "bg-slate-900 border-sky-400 text-sky-200 shadow-md"
            } text-xs font-bold transition-transform">
              ${idx + 1}
            </div>
          </div>
          <div class="absolute top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900/90 border border-slate-700/80 px-2 py-0.5 text-[10px] font-bold text-white shadow-md backdrop-blur-md">
            ${stop.name}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: "custom-leaflet-marker",
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18],
      });

      const popupContent = `
        <div class="p-1 space-y-1 text-slate-900 dark:text-white" style="min-width: 170px;">
          <div class="flex items-center justify-between gap-1 border-b pb-1">
            <span class="text-[10px] font-bold uppercase text-sky-600">Day ${stop.dayNumber} Stop</span>
            <span class="text-[10px] font-mono text-slate-500">${stop.distanceKm ? `${stop.distanceKm} km` : "Start"}</span>
          </div>
          <h4 class="font-bold text-xs pt-0.5">${stop.name}</h4>
          <p class="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">${stop.description}</p>
          ${
            stop.recommendedStay
              ? `<div class="text-[10px] text-slate-700 dark:text-slate-300 pt-1 font-semibold">🏨 ${stop.recommendedStay}</div>`
              : ""
          }
        </div>
      `;

      const marker = L.marker([stop.latitude, stop.longitude], { icon: customIcon })
        .addTo(map)
        .bindPopup(popupContent, { className: "custom-leaflet-popup" });

      marker.on("click", () => {
        handleSelect(idx);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to display all stops comfortably
    if (activeLatLngs.length > 0) {
      const bounds = L.latLngBounds(activeLatLngs);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }

    // Force map container layout recalculation
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [activeTab, stops, tileTheme, useRealRoads, roadCoordinates]);

  // Smooth fly to active stop when selectedStopIdx changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || activeTab !== "interactive_map" || !currentStop) return;

    map.flyTo([currentStop.latitude, currentStop.longitude], Math.max(map.getZoom(), 11), {
      duration: 0.8,
    });

    const marker = markersRef.current[selectedStopIdx];
    if (marker) {
      marker.openPopup();
    }
  }, [selectedStopIdx, activeTab]);

  // Zoom controls
  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleResetBounds = () => {
    const L = (window as any).L;
    if (mapInstanceRef.current && L && stops.length > 0) {
      const active =
        useRealRoads && roadCoordinates.length > 0
          ? roadCoordinates
          : stops.map((s) => [s.latitude, s.longitude]);
      mapInstanceRef.current.fitBounds(L.latLngBounds(active), { padding: [50, 50] });
    }
  };

  // SVG calculations for Vector Route mode
  const { points, totalDistanceKm, totalDriveHours } = useMemo(() => {
    if (!stops || stops.length === 0) return { points: [], totalDistanceKm: 0, totalDriveHours: 0 };

    const lats = stops.map((s) => s.latitude);
    const lngs = stops.map((s) => s.longitude);

    let minLat = Math.min(...lats);
    let maxLat = Math.max(...lats);
    let minLng = Math.min(...lngs);
    let maxLng = Math.max(...lngs);

    const latDiff = Math.max(maxLat - minLat, 0.05);
    const lngDiff = Math.max(maxLng - minLng, 0.05);

    minLat -= latDiff * 0.18;
    maxLat += latDiff * 0.18;
    minLng -= lngDiff * 0.18;
    maxLng += lngDiff * 0.18;

    const width = 640;
    const height = 380;

    const pts = stops.map((stop) => {
      const x = ((stop.longitude - minLng) / (maxLng - minLng)) * (width - 120) + 60;
      const y = height - (((stop.latitude - minLat) / (maxLat - minLat)) * (height - 100) + 50);
      return { ...stop, x, y };
    });

    let dist = 0;
    stops.forEach((s) => {
      dist += s.distanceKm || 0;
    });

    const hours = Math.round((dist / 40) * 10) / 10;
    return { points: pts, totalDistanceKm: dist, totalDriveHours: hours };
  }, [stops]);

  const svgPathD = useMemo(() => {
    if (points.length < 2) return "";
    return points.reduce((acc, pt, i) => {
      if (i === 0) return `M ${pt.x} ${pt.y}`;
      const prev = points[i - 1];
      const cx = (prev.x + pt.x) / 2;
      return `${acc} Q ${cx} ${prev.y}, ${pt.x} ${pt.y}`;
    }, "");
  }, [points]);

  const googleMapsRouteUrl = useMemo(() => {
    const stopsEncoded = stops.map((s) => encodeURIComponent(`${s.name}, ${place.country}`)).join("/");
    return `https://www.google.com/maps/dir/${stopsEncoded}`;
  }, [stops, place.country]);

  const handleSelect = (idx: number) => {
    setSelectedStopIdx(idx);
    if (onSelectStop) onSelectStop(idx);
  };

  const matchedPackages: MatchedPackage[] = useMemo(() => {
    if (Array.isArray(apiPackages) && apiPackages.length > 0) {
      const live = matchApiPackages(place.destination, place.stops, apiPackages);
      if (live.length > 0) return live;
    }
    if (place.matchedPackages && place.matchedPackages.length > 0) {
      return place.matchedPackages;
    }
    return defaultKeralaDestination.matchedPackages!;
  }, [place.destination, place.stops, place.matchedPackages, apiPackages]);

  const packagePricePerPerson =
    (matchedPackages.length > 0 ? matchedPackages[0].price : null) ||
    place.totalEstimatedPrice ||
    14999;
  const calculatedGroupPrice = packagePricePerPerson * travelerCount;

  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden bg-card"
      aria-label={`Interactive map of ${place.destination}`}
    >
      {/* MAP TOP CONTROL BAR */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/80 bg-card/95 px-4 py-3 backdrop-blur-md z-20">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-accent/15 text-accent border border-accent/25">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="font-display text-sm font-bold text-foreground leading-tight">
                {place.destination} Route Map
              </h4>
              <span className="rounded-full bg-accent/15 px-2 py-0.2 text-[10px] font-bold text-accent">
                {stops.length} Stops
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.2 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-2.5 w-2.5" />
                <span>Free Open Map</span>
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-foreground">
                {isRoutingRoad
                  ? "Tracing road network..."
                  : roadStats
                  ? `${roadStats.distanceKm} km road drive`
                  : `${totalDistanceKm} km`}
              </span>
              <span>•</span>
              <span>
                {roadStats ? `~${roadStats.durationHours}h drive` : `~${totalDriveHours}h`}
              </span>
              <span>•</span>
              <span className="text-accent font-semibold flex items-center gap-1">
                <Car className="h-3 w-3" />
                <span>Road Highway Route</span>
              </span>
            </p>
          </div>
        </div>

        {/* View Mode & Tile Switcher */}
        <div className="flex flex-wrap items-center gap-1 bg-muted/60 p-1 rounded-2xl border border-border/60">
          <button
            type="button"
            onClick={() => setActiveTab("interactive_map")}
            className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold transition-all ${
              activeTab === "interactive_map"
                ? "bg-card text-foreground shadow-sm border border-border/50"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Globe className="h-3 w-3 text-accent" />
            <span>Live Map</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("vector_route")}
            className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold transition-all ${
              activeTab === "vector_route"
                ? "bg-card text-foreground shadow-sm border border-border/50"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Route className="h-3 w-3 text-accent" />
            <span>Vector Route</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("itinerary")}
            className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold transition-all ${
              activeTab === "itinerary"
                ? "bg-card text-foreground shadow-sm border border-border/50"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CalendarDays className="h-3 w-3 text-accent" />
            <span>Day Plan ({place.daysPlan?.length || stops.length}D)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("packages")}
            className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold transition-all ${
              activeTab === "packages"
                ? "bg-accent text-accent-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Tag className="h-3 w-3" />
            <span>Packages ({matchedPackages.length})</span>
          </button>

          <a
            href={googleMapsRouteUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open complete multi-stop turn-by-turn route in Google Maps"
            className="flex items-center gap-1 rounded-xl px-2 py-1 text-xs font-semibold text-accent hover:bg-accent/15 transition-colors ml-0.5"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* MAP BODY AREA */}
      <div className="relative flex-1 min-h-[320px] w-full overflow-hidden bg-slate-950">
        {/* LEAFLET INTERACTIVE REAL MAP VIEW */}
        <div
          ref={mapContainerRef}
          className={`h-full w-full ${activeTab === "interactive_map" ? "block" : "hidden"}`}
          style={{ minHeight: "340px", zIndex: 1 }}
        />

        {/* MAP FLOATING CONTROLS FOR LEAFLET */}
        {activeTab === "interactive_map" && (
          <>
            {/* Free Tile Style Picker */}
            <div className="absolute top-3 left-3 z-[400] flex items-center gap-1 rounded-xl bg-card/90 border border-border/80 p-1 shadow-lg backdrop-blur-md">
              {(
                [
                  { id: "osm", label: "OpenStreetMap" },
                  { id: "terrain", label: "Terrain" },
                  { id: "voyager", label: "Streets" },
                  { id: "satellite", label: "Satellite" },
                  { id: "dark", label: "Dark" },
                ] as { id: TileTheme; label: string }[]
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTileTheme(t.id)}
                  className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase transition-all ${
                    tileTheme === t.id
                      ? "bg-accent text-accent-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Zoom Controls */}
            <div className="absolute top-3 right-3 z-[400] flex flex-col gap-1 rounded-xl bg-card/90 border border-border/80 p-1 shadow-lg backdrop-blur-md">
              <button
                type="button"
                onClick={handleZoomIn}
                title="Zoom In"
                className="h-7 w-7 rounded-lg flex items-center justify-center text-foreground hover:bg-muted transition-colors"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                title="Zoom Out"
                className="h-7 w-7 rounded-lg flex items-center justify-center text-foreground hover:bg-muted transition-colors"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleResetBounds}
                title="Fit Route to Screen"
                className="h-7 w-7 rounded-lg flex items-center justify-center text-accent hover:bg-accent/15 transition-colors border-t border-border/40"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </>
        )}

        {/* VECTOR ROUTE MODE */}
        {activeTab === "vector_route" && (
          <div className="relative h-full w-full select-none overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
            <div className="absolute inset-0 opacity-15 [background-image:linear-gradient(to_right,#38bdf8_1px,transparent_1px),linear-gradient(to_bottom,#38bdf8_1px,transparent_1px)] [background-size:28px_28px]" />
            <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

            <svg
              viewBox="0 0 640 380"
              className="relative h-full w-full max-h-[380px] filter drop-shadow-md"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>

              <path
                d={svgPathD}
                fill="none"
                stroke="url(#routeGradient)"
                strokeWidth="4"
                strokeDasharray="6 4"
                className="animate-[dash_20s_linear_infinite]"
              />

              {points.map((pt, i) => {
                if (i === 0) return null;
                const prev = points[i - 1];
                const midX = (prev.x + pt.x) / 2;
                const midY = (prev.y + pt.y) / 2;
                return (
                  <g key={`leg-${pt.id}`}>
                    <rect
                      x={midX - 32}
                      y={midY - 11}
                      width="64"
                      height="20"
                      rx="10"
                      fill="#0f172a"
                      stroke="#334155"
                      strokeWidth="1"
                      opacity="0.95"
                    />
                    <text
                      x={midX}
                      y={midY + 3}
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {pt.distanceKm ? `${pt.distanceKm} km` : "Leg"}
                    </text>
                  </g>
                );
              })}

              {points.map((pt, idx) => {
                const isSelected = selectedStopIdx === idx;
                return (
                  <g
                    key={pt.id}
                    onClick={() => handleSelect(idx)}
                    className="cursor-pointer transition-transform duration-200 hover:scale-110"
                  >
                    {isSelected && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="22"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="2"
                        className="animate-ping opacity-75"
                      />
                    )}

                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isSelected ? "16" : "13"}
                      fill={isSelected ? "#0284c7" : "#1e293b"}
                      stroke={isSelected ? "#38bdf8" : "#475569"}
                      strokeWidth={isSelected ? "3" : "2"}
                    />

                    <text
                      x={pt.x}
                      y={pt.y + 4}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize={isSelected ? "11" : "10"}
                      fontWeight="bold"
                    >
                      {idx + 1}
                    </text>

                    <g transform={`translate(${pt.x}, ${pt.y + 24})`}>
                      <rect
                        x="-48"
                        y="-9"
                        width="96"
                        height="18"
                        rx="9"
                        fill={isSelected ? "#0284c7" : "#0f172a"}
                        stroke={isSelected ? "#38bdf8" : "#334155"}
                        strokeWidth="1"
                        opacity="0.95"
                      />
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="9.5"
                        fontWeight="600"
                      >
                        {pt.name.length > 13 ? `${pt.name.slice(0, 12)}…` : pt.name}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* PACKAGES & PRICING TAB */}
        {activeTab === "packages" && (
          <div className="h-full w-full overflow-y-auto p-4 bg-muted/20 space-y-4">
            {/* Price Estimator Widget */}
            <div className="rounded-2xl border border-accent/30 bg-accent/5 p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-accent-foreground font-bold">
                    ₹
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-bold text-foreground">
                      Package Price Estimator
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Verified package rates for {place.durationDays || 4} days
                    </p>
                  </div>
                </div>

                {/* Travelers Counter */}
                <div className="flex items-center gap-2 bg-card border border-border/80 px-2.5 py-1 rounded-xl">
                  <Users className="h-3.5 w-3.5 text-accent" />
                  <span className="text-xs font-semibold text-foreground">Travelers:</span>
                  {[1, 2, 4, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setTravelerCount(num)}
                      className={`h-6 w-6 rounded-md text-xs font-bold transition-all ${
                        travelerCount === num
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-accent/20 text-xs">
                <div>
                  <span className="text-[10px] text-muted-foreground block">Per Person Rate</span>
                  <span className="font-display font-bold text-foreground text-sm">
                    ₹{packagePricePerPerson.toLocaleString("en-IN")}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Stay & Resort</span>
                  <span className="font-semibold text-foreground">
                    ₹{((place.priceBreakdown?.stay || 7200) * (travelerCount > 2 ? 1.8 : 1)).toLocaleString("en-IN")}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">AC Cab / Transport</span>
                  <span className="font-semibold text-foreground">
                    ₹{((place.priceBreakdown?.transport || 4800) * (travelerCount > 4 ? 1.4 : 1)).toLocaleString("en-IN")}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-accent font-bold block">Total Group Est.</span>
                  <span className="font-display font-bold text-accent text-sm sm:text-base">
                    ₹{calculatedGroupPrice.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Packages List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-foreground">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-accent" />
                  <span>Verified Packages Matching This Route ({matchedPackages.length})</span>
                </span>
                <Link to="/packages" className="text-accent hover:underline text-[11px] font-semibold flex items-center gap-0.5">
                  <span>View All Packages</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>

              {matchedPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="rounded-2xl border border-border/80 bg-card p-3.5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-3.5 items-start sm:items-center"
                >
                  <img
                    src={pkg.image}
                    alt={pkg.title}
                    className="h-24 w-full sm:w-32 rounded-xl object-cover shrink-0 border border-border/50"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent">
                        {pkg.badge || "Verified"}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{pkg.duration}</span>
                      <span className="text-[11px] font-semibold text-foreground flex items-center gap-0.5">
                        ⭐ {pkg.rating} ({pkg.reviewsCount || 20})
                      </span>
                    </div>

                    <h4 className="font-display text-sm font-bold text-foreground line-clamp-1">
                      {pkg.title}
                    </h4>

                    <div className="flex flex-wrap gap-1 text-[10px] text-muted-foreground">
                      {pkg.inclusions.slice(0, 3).map((inc, i) => (
                        <span key={i} className="inline-flex items-center gap-0.5 bg-muted/60 px-1.5 py-0.5 rounded-md">
                          <CheckCircle2 className="h-2.5 w-2.5 text-accent" />
                          <span>{inc}</span>
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-1 gap-2">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-display text-base font-bold text-accent">
                          ₹{pkg.price.toLocaleString("en-IN")}
                        </span>
                        {pkg.originalPrice && (
                          <span className="text-xs text-muted-foreground line-through">
                            ₹{pkg.originalPrice.toLocaleString("en-IN")}
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground">/ person</span>
                      </div>

                      <Link to={`/packages/${pkg.id}`}>
                        <Button
                          size="sm"
                          className="h-7 text-xs rounded-full gradient-accent border-0 text-accent-foreground font-semibold px-3 gap-1 shadow-sm"
                        >
                          <span>Explore Package</span>
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DAY-BY-DAY ITINERARY TAB */}
        {activeTab === "itinerary" && (
          <div className="h-full w-full overflow-y-auto p-4 bg-muted/20 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-foreground pb-1">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-accent" />
                <span>Day-by-Day Journey Schedule ({place.daysPlan?.length || stops.length} Days)</span>
              </span>
              <span className="text-[11px] text-muted-foreground">Click day to view stop details</span>
            </div>

            {(place.daysPlan || []).map((day) => {
              const isExpanded = expandedDay === day.day;
              return (
                <div
                  key={day.day}
                  className={`rounded-2xl border transition-all ${
                    selectedStopIdx === day.day - 1
                      ? "border-accent/40 bg-card shadow-md"
                      : "border-border/70 bg-card/70 hover:bg-card"
                  }`}
                >
                  <div
                    onClick={() => {
                      setExpandedDay(isExpanded ? null : day.day);
                      handleSelect(day.day - 1);
                    }}
                    className="flex items-center justify-between p-3.5 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/15 text-accent text-xs font-bold">
                        D{day.day}
                      </span>
                      <div>
                        <p className="font-display text-sm font-bold text-foreground">
                          {day.title}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-accent" />
                          <span>{day.location}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-accent hidden sm:inline">
                        Est. ₹{day.estimatedCost.toLocaleString("en-IN")}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 space-y-3 text-xs border-t border-border/40 text-foreground/90">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                        <div className="rounded-xl bg-muted/40 p-2.5 border border-border/40">
                          <span className="text-[10px] font-bold text-accent uppercase tracking-wider block">Morning</span>
                          <p className="text-muted-foreground mt-1 leading-snug">{day.morning}</p>
                        </div>
                        <div className="rounded-xl bg-muted/40 p-2.5 border border-border/40">
                          <span className="text-[10px] font-bold text-accent uppercase tracking-wider block">Afternoon</span>
                          <p className="text-muted-foreground mt-1 leading-snug">{day.afternoon}</p>
                        </div>
                        <div className="rounded-xl bg-muted/40 p-2.5 border border-border/40">
                          <span className="text-[10px] font-bold text-accent uppercase tracking-wider block">Evening</span>
                          <p className="text-muted-foreground mt-1 leading-snug">{day.evening}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5 font-semibold text-foreground">
                          <Hotel className="h-3.5 w-3.5 text-accent" />
                          <span>Stay: {day.stay}</span>
                        </span>
                        <span className="flex items-center gap-1 text-accent font-medium italic">
                          💡 {day.travelTip}
                        </span>
                      </div>

                      <div className="pt-1 flex items-center justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(day.day - 1);
                            setActiveTab("interactive_map");
                          }}
                          className="h-7 text-xs rounded-lg gap-1 border-border/80 hover:border-accent hover:text-accent"
                        >
                          <Globe className="h-3 w-3" />
                          <span>View Stop on Map</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* STOP INSPECTOR FOOTER CARD (Active on Map & Vector Route) */}
      {(activeTab === "interactive_map" || activeTab === "vector_route") && (
        <div className="border-t border-border/80 bg-card/95 p-3.5 backdrop-blur-md z-20">
          <div className="mb-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-accent-foreground">
                {selectedStopIdx + 1}
              </span>
              <span className="font-display font-bold text-foreground text-sm">
                Day {currentStop.dayNumber}: {currentStop.name}
              </span>
            </div>

            <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
              <Car className="h-3.5 w-3.5 text-accent" />
              <span>{currentStop.driveFromPrev || "Starting Hub"}</span>
            </span>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-1 mb-2.5">
            {currentStop.description}
          </p>

          {/* Highlights Pills for Current Stop */}
          <div className="flex flex-wrap items-center gap-1.5">
            {currentStop.activities.map((act, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/90 px-2.5 py-0.5 text-[11px] font-medium text-foreground shadow-2xs"
              >
                <Sparkles className="h-3 w-3 text-accent" />
                <span>{act}</span>
              </span>
            ))}

            {currentStop.recommendedStay && (
              <span className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-[11px] font-semibold text-accent ml-auto">
                <Hotel className="h-3 w-3" />
                <span>{currentStop.recommendedStay}</span>
              </span>
            )}
          </div>

          {/* Stops Navigation Carousel Strip */}
          <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between gap-1 overflow-x-auto scrollbar-hide">
            {stops.map((stop, index) => {
              const isCurrent = selectedStopIdx === index;
              return (
                <button
                  key={stop.id}
                  type="button"
                  onClick={() => handleSelect(index)}
                  className={`flex-1 min-w-[90px] py-1 px-2 rounded-xl text-left border transition-all ${
                    isCurrent
                      ? "border-accent bg-accent/10 text-foreground shadow-2xs"
                      : "border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted/60"
                  }`}
                >
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-accent">
                    Stop {index + 1}
                  </span>
                  <span className="block font-semibold text-xs truncate">
                    {stop.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
