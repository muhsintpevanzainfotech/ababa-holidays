import { useEffect, useRef, useState, useCallback } from "react";
import {
  MapPin,
  Compass,
  Check,
  Search,
  Crosshair,
  Sparkles,
  X,
  Loader2,
  Navigation2,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface LocationMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: string;
  onSelectLocation: (location: string) => void;
}

interface DestinationHub {
  name: string;
  lat: number;
  lng: number;
  region: string;
}

interface PlaceSearchResult {
  id: string;
  name: string;
  subtitle: string;
  lat: number;
  lng: number;
  cleanName: string;
}

const DESTINATION_HUBS: DestinationHub[] = [
  { name: "Kochi, Kerala", lat: 9.9312, lng: 76.2673, region: "Central Hub" },
  { name: "Munnar, Kerala", lat: 10.0889, lng: 77.0595, region: "Hill Station" },
  { name: "Wayanad, Kerala", lat: 11.6854, lng: 76.1320, region: "Rainforest" },
  { name: "Alleppey, Kerala", lat: 9.4981, lng: 76.3388, region: "Backwaters" },
  { name: "Thekkady, Kerala", lat: 9.6031, lng: 77.1648, region: "Wildlife Sanctuary" },
  { name: "Varkala, Kerala", lat: 8.7379, lng: 76.7163, region: "Cliff & Beach" },
  { name: "Kovalam, Kerala", lat: 8.4004, lng: 76.9787, region: "Beach Paradise" },
  { name: "Vagamon, Kerala", lat: 9.6872, lng: 76.9056, region: "Pine Valley" },
  { name: "Kozhikode, Kerala", lat: 11.2588, lng: 75.7804, region: "Malabar Coast" },
  { name: "Thiruvananthapuram, Kerala", lat: 8.5241, lng: 76.9366, region: "Capital City" },
  { name: "Athirappilly, Kerala", lat: 10.2851, lng: 76.5698, region: "Waterfalls" },
  { name: "Bekal, Kerala", lat: 12.3931, lng: 75.0328, region: "Historic Fort" },
  { name: "Bengaluru, India", lat: 12.9716, lng: 77.5946, region: "Karnataka" },
  { name: "Chennai, India", lat: 13.0827, lng: 80.2707, region: "Tamil Nadu" },
  { name: "Mumbai, India", lat: 19.0760, lng: 72.8777, region: "Maharashtra" },
  { name: "Goa, India", lat: 15.2993, lng: 74.1240, region: "Coast & Nightlife" },
  { name: "Dubai, UAE", lat: 25.2048, lng: 55.2708, region: "Middle East" },
];

export default function LocationMapModal({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
}: LocationMapModalProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const searchAbortRef = useRef<AbortController | null>(null);

  const [selectedLocation, setSelectedLocation] = useState<string>(
    currentLocation || "Kochi, Kerala"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PlaceSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [activeCoords, setActiveCoords] = useState<{ lat: number; lng: number }>({
    lat: 9.9312,
    lng: 76.2673,
  });
  const [mapContainerEl, setMapContainerEl] = useState<HTMLDivElement | null>(null);

  // Global window hook so inline Leaflet popup buttons can apply location directly
  useEffect(() => {
    (window as any).__selectAndApplyLocation = (locName: string) => {
      setSelectedLocation(locName);
      onSelectLocation(locName);
      localStorage.setItem("userLocation", locName);
      window.dispatchEvent(new CustomEvent("userLocationChanged", { detail: locName }));
      onClose();
    };
    return () => {
      delete (window as any).__selectAndApplyLocation;
    };
  }, [onSelectLocation, onClose]);

  // Sync initial location when opened
  useEffect(() => {
    if (isOpen) {
      const initial = currentLocation || "Kochi, Kerala";
      setSelectedLocation(initial);
      setSearchQuery("");
      setShowDropdown(false);
      setSearchResults([]);

      // Match coordinates from hub if exists
      const match = DESTINATION_HUBS.find((h) =>
        initial.toLowerCase().includes(h.name.split(",")[0].toLowerCase())
      );
      if (match) {
        setActiveCoords({ lat: match.lat, lng: match.lng });
      }
    }
  }, [isOpen, currentLocation]);

  // Function to move active marker and fly map
  const flyToLocation = useCallback(
    (lat: number, lng: number, title: string, zoom = 10) => {
      const L = (window as any).L;
      const map = mapInstanceRef.current;
      if (!map || !L) return;

      setActiveCoords({ lat, lng });

      const activeIcon = L.divIcon({
        className: "custom-active-pin",
        html: `
          <div class="relative flex items-center justify-center cursor-pointer select-none">
            <div class="absolute -inset-2 rounded-full bg-sky-400/35 animate-ping"></div>
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 border-2 border-white text-white shadow-2xl scale-110">
              <span class="text-sm font-black">✓</span>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const popupHtml = `
        <div style="font-family: inherit; min-width: 170px; padding: 4px 2px;">
          <div style="font-weight: 700; font-size: 13px; color: #0f172a; margin-bottom: 2px;">
            ${title}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
            📍 Selected Topbar Location
          </div>
          <button 
            type="button"
            onclick="window.__selectAndApplyLocation('${title.replace(/'/g, "\\'")}')"
            style="width: 100%; background: #0284c7; color: #ffffff; border: none; padding: 6px 10px; border-radius: 8px; font-weight: 600; font-size: 11px; cursor: pointer; display: flex; items-center; justify-content: center; gap: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.2);"
          >
            ✓ Set Topbar Location
          </button>
        </div>
      `;

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
        markerRef.current.setIcon(activeIcon);
        markerRef.current.bindPopup(popupHtml).openPopup();
      } else {
        markerRef.current = L.marker([lat, lng], { icon: activeIcon })
          .addTo(map)
          .bindPopup(popupHtml)
          .openPopup();
      }

      map.flyTo([lat, lng], zoom, { duration: 0.7 });
    },
    []
  );

  // Initialize Leaflet Map
  useEffect(() => {
    if (!isOpen || !mapContainerEl) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
      return;
    }

    const L = (window as any).L;
    if (!L) return;

    // Check if element is already initialized
    if ((mapContainerEl as any)._leaflet_id) {
      return;
    }

    const initialHub =
      DESTINATION_HUBS.find((h) =>
        (selectedLocation || "").toLowerCase().includes(h.name.split(",")[0].toLowerCase())
      ) || DESTINATION_HUBS[0];

    const map = L.map(mapContainerEl, {
      center: [initialHub.lat, initialHub.lng],
      zoom: 8,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      subdomains: "abc",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Only show single selected/searched pin on map (no multiple cluttered pins)

    // Click anywhere on map to select and reverse geocode
    map.on("click", async (e: any) => {
      const { lat, lng } = e.latlng;
      setIsGeocoding(true);
      setShowDropdown(false);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12&addressdetails=1`
        );
        const data = await res.json();
        const city =
          data.address?.city ||
          data.address?.town ||
          data.address?.village ||
          data.address?.suburb ||
          data.address?.state_district ||
          data.address?.county ||
          "Pinned Destination";
        const state = data.address?.state || data.address?.country || "";
        const locName = state && !city.includes(state) ? `${city}, ${state}` : city;
        setSelectedLocation(locName);
        flyToLocation(lat, lng, locName, Math.max(map.getZoom(), 9));
      } catch {
        const fallback = `Point (${lat.toFixed(2)}, ${lng.toFixed(2)})`;
        setSelectedLocation(fallback);
        flyToLocation(lat, lng, fallback, Math.max(map.getZoom(), 9));
      } finally {
        setIsGeocoding(false);
      }
    });

    mapInstanceRef.current = map;

    // Place initial selection pin
    flyToLocation(initialHub.lat, initialHub.lng, initialHub.name, 8);

    // Multiple invalidateSize calls to ensure Leaflet renders correctly after dialog transitions
    const t1 = setTimeout(() => map.invalidateSize(), 60);
    const t2 = setTimeout(() => map.invalidateSize(), 200);
    const t3 = setTimeout(() => map.invalidateSize(), 500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [isOpen, mapContainerEl, flyToLocation]);

  // Live place search with debounce & instant local matches
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      setShowDropdown(false);
      if (searchAbortRef.current) {
        searchAbortRef.current.abort();
      }
      return;
    }

    // 1. Instant local matches (0ms response)
    const localMatches: PlaceSearchResult[] = DESTINATION_HUBS.filter(
      (h) =>
        h.name.toLowerCase().includes(trimmed.toLowerCase()) ||
        h.region.toLowerCase().includes(trimmed.toLowerCase())
    ).map((h) => ({
      id: `local-${h.name}`,
      name: h.name.split(",")[0].trim(),
      subtitle: `${h.region} • Kerala/India`,
      lat: h.lat,
      lng: h.lng,
      cleanName: h.name,
    }));

    setSearchResults(localMatches);
    setShowDropdown(true);
    setIsSearching(true);

    if (searchAbortRef.current) {
      searchAbortRef.current.abort();
    }
    const controller = new AbortController();
    searchAbortRef.current = controller;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            trimmed
          )}&limit=6&addressdetails=1`,
          { signal: controller.signal }
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          const apiMatches: PlaceSearchResult[] = data.map((item: any, idx: number) => {
            const rawParts = item.display_name.split(",");
            const primary =
              item.address?.city ||
              item.address?.town ||
              item.address?.village ||
              item.address?.municipality ||
              rawParts[0].trim();

            const state = item.address?.state || "";
            const country = item.address?.country || "";
            const district = item.address?.state_district || item.address?.county || "";

            const subtitle = [district, state, country].filter(Boolean).join(", ");
            const cleanName =
              state && !primary.toLowerCase().includes(state.toLowerCase())
                ? `${primary}, ${state}`
                : country && !primary.toLowerCase().includes(country.toLowerCase())
                ? `${primary}, ${country}`
                : primary;

            return {
              id: `api-${item.place_id || idx}`,
              name: primary,
              subtitle: subtitle || item.display_name,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
              cleanName: cleanName || item.display_name,
            };
          });

          // Merge without duplicate coordinates
          const combined = [...localMatches];
          apiMatches.forEach((apiItem) => {
            const exists = combined.some(
              (c) =>
                Math.abs(c.lat - apiItem.lat) < 0.05 && Math.abs(c.lng - apiItem.lng) < 0.05
            );
            if (!exists) {
              combined.push(apiItem);
            }
          });

          setSearchResults(combined);
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.warn("Place search failed:", err);
        }
      } finally {
        setIsSearching(false);
      }
    }, 320);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // Handle selecting a place result from dropdown
  const handleSelectPlace = (place: PlaceSearchResult) => {
    setSelectedLocation(place.cleanName);
    setSearchQuery(place.cleanName);
    setShowDropdown(false);
    flyToLocation(place.lat, place.lng, place.cleanName, 11);
  };


  // Use current browser GPS location
  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsGeocoding(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12&addressdetails=1`
          );
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.state_district ||
            "My Current Location";
          const state = data.address?.state || "";
          const locName = state && !city.includes(state) ? `${city}, ${state}` : city;
          setSelectedLocation(locName);
          flyToLocation(lat, lng, locName, 12);
        } catch {
          const fallback = "Current GPS Location";
          setSelectedLocation(fallback);
          flyToLocation(lat, lng, fallback, 12);
        } finally {
          setIsGeocoding(false);
        }
      },
      () => {
        setIsGeocoding(false);
        alert("Unable to retrieve your location. Please check browser permissions.");
      }
    );
  };

  // Search form submit
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      handleSelectPlace(searchResults[0]);
      return;
    }
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    // Check local matches immediately
    const localMatch = DESTINATION_HUBS.find(
      (h) =>
        h.name.toLowerCase().includes(trimmed.toLowerCase()) ||
        h.region.toLowerCase().includes(trimmed.toLowerCase())
    );
    if (localMatch) {
      handleSelectPlace({
        id: `hub-${localMatch.name}`,
        name: localMatch.name.split(",")[0],
        subtitle: `${localMatch.region} • Kerala/India`,
        lat: localMatch.lat,
        lng: localMatch.lng,
        cleanName: localMatch.name,
      });
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          trimmed
        )}&limit=1&addressdetails=1`
      );
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        const primary =
          item.name ||
          item.address?.city ||
          item.address?.town ||
          item.address?.village ||
          item.display_name.split(",")[0];
        const state = item.address?.state || "";
        const cleanName =
          state && !primary.toLowerCase().includes(state.toLowerCase())
            ? `${primary}, ${state}`
            : primary;

        handleSelectPlace({
          id: `direct-${item.place_id || Date.now()}`,
          name: primary,
          subtitle: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          cleanName: cleanName || item.display_name,
        });
      }
    } catch (err) {
      console.warn("Direct search submit failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  // Confirm and set topbar location
  const handleConfirm = () => {
    if (selectedLocation) {
      onSelectLocation(selectedLocation);
      localStorage.setItem("userLocation", selectedLocation);
      window.dispatchEvent(
        new CustomEvent("userLocationChanged", { detail: selectedLocation })
      );
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl overflow-visible p-0 rounded-3xl border border-border/80 bg-card shadow-2xl z-[150]">
        {/* Header & Search Bar */}
        <DialogHeader className="px-5 pt-4 pb-3 border-b border-border/70 bg-card/95 relative z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-accent/15 text-accent border border-accent/25">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="font-display text-base font-bold text-foreground">
                  Select Location on Interactive Map
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  Search any place or click directly on the map to set your location
                </p>
              </div>
            </div>
          </div>

          {/* Place Search Bar with Live Autocomplete Suggestions */}
          <div className="relative mt-3">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-1.5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchResults.length > 0) setShowDropdown(true);
                  }}
                  placeholder="Search city, destination, or tourist spot (e.g. Munnar, Kochi)..."
                  className="w-full h-9 pl-9 pr-8 rounded-xl border border-border/80 bg-muted/40 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSearchResults([]);
                      setShowDropdown(false);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* GPS button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleUseGPS}
                title="Use Current GPS Location"
                disabled={isGeocoding}
                className="h-9 px-2.5 rounded-xl border-border/80 hover:border-accent hover:text-accent shrink-0 gap-1 text-xs"
              >
                <Crosshair className={`h-3.5 w-3.5 ${isGeocoding ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">GPS</span>
              </Button>

              <Button
                type="submit"
                size="sm"
                disabled={isSearching || isGeocoding}
                className="h-9 text-xs rounded-xl gradient-accent text-accent-foreground font-semibold px-3 border-0 shrink-0"
              >
                {isSearching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Search"}
              </Button>
            </form>

            {/* Live Autocomplete Suggestions Dropdown ("place search select") */}
            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute left-0 right-0 top-full mt-1.5 z-50 overflow-hidden rounded-2xl border border-border/90 bg-card/95 shadow-2xl backdrop-blur-xl max-h-60 overflow-y-auto">
                  <div className="p-1.5 space-y-0.5">
                    <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                      <span>Matching Places</span>
                      {isSearching && (
                        <span className="flex items-center gap-1 text-accent">
                          <Loader2 className="h-2.5 w-2.5 animate-spin" />
                          Searching...
                        </span>
                      )}
                    </div>

                    {searchResults.length === 0 ? (
                      <div className="p-3 text-center text-xs text-muted-foreground">
                        {isSearching ? "Finding matching places..." : "No destinations found. Try another city name."}
                      </div>
                    ) : (
                      searchResults.map((place) => (
                        <button
                          key={place.id}
                          type="button"
                          onClick={() => handleSelectPlace(place)}
                          className="w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-accent/15 transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent border border-accent/25 group-hover:scale-110 transition-transform">
                              <MapPin className="h-3.5 w-3.5" />
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-foreground group-hover:text-accent transition-colors truncate">
                                {place.name}
                              </p>
                              <p className="text-[10px] text-muted-foreground truncate">
                                {place.subtitle}
                              </p>
                            </div>
                          </div>
                          <span className="shrink-0 text-[10px] font-semibold text-accent opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 bg-accent/15 px-2 py-0.5 rounded-full">
                            Select & Fly ✈️
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogHeader>

        {/* Leaflet Map Body - Shows Only Selected/Searched Location Pin */}
        <div className="relative w-full h-[360px] sm:h-[390px] bg-slate-100 dark:bg-slate-900 border-y border-border/60 isolate overflow-hidden">
          <div
            ref={(el) => setMapContainerEl(el)}
            className="w-full h-full absolute inset-0"
            style={{ zIndex: 1 }}
          />

          {/* Floating hint pill on map */}
          <div className="absolute top-3 left-3 z-[400] pointer-events-none">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-md border border-slate-700/60 text-slate-200 text-[10px] font-semibold shadow-lg">
              <Navigation2 className="h-3 w-3 text-sky-400" />
              Click anywhere on map or search to place pin
            </span>
          </div>
        </div>

        {/* Modal Footer Confirmation Bar */}
        <div className="px-5 py-3.5 border-t border-border/70 bg-card/95 flex flex-wrap items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-accent-foreground shrink-0 font-bold shadow-xs">
              <MapPin className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-accent block">
                Selected Topbar Location:
              </span>
              <p className="font-display text-sm font-bold text-foreground truncate max-w-[280px] sm:max-w-[340px]">
                {selectedLocation}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-9 rounded-xl text-xs font-semibold px-3"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirm}
              className="h-9 rounded-xl gradient-accent text-accent-foreground font-semibold text-xs border-0 shadow-md gap-1.5 px-4 cursor-pointer hover:opacity-95"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Confirm & Set Topbar</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
