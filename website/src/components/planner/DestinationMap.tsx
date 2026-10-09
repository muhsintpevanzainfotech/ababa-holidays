import { useState } from "react";
import { MapPin, Navigation, Palmtree, ExternalLink, Layers, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PlannerDestination } from "@/hooks/use-planner-history";

const fallback: PlannerDestination = {
  destination: "Kerala",
  country: "India",
  latitude: 10.1632,
  longitude: 76.6413,
  highlights: ["Fort Kochi", "Munnar Tea Hills", "Alleppey Houseboat", "Varkala Cliff"],
};

export default function DestinationMap({ destination }: { destination?: PlannerDestination }) {
  const place = destination ?? fallback;
  const [mapMode, setMapMode] = useState<"interactive" | "overview">("interactive");

  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${
    place.longitude - 0.25
  }%2C${place.latitude - 0.25}%2C${place.longitude + 0.25}%2C${
    place.latitude + 0.25
  }&layer=mapnik&marker=${place.latitude}%2C${place.longitude}`;

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${place.destination}, ${place.country}`
  )}`;

  return (
    <div
      className="relative flex min-h-[380px] h-full overflow-hidden rounded-xl border border-border bg-card shadow-md flex-col"
      aria-label={`Interactive Map of ${place.destination}, ${place.country}`}
    >
      {/* Map Control Bar Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-card/95 border-b border-border/80 backdrop-blur-md z-20">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15 text-accent border border-accent/20">
            <Compass className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-display text-xs font-bold text-foreground leading-none">
              {place.destination} Interactive Map
            </h4>
            <span className="text-[10px] text-muted-foreground font-mono">
              {place.latitude.toFixed(4)}° N, {place.longitude.toFixed(4)}° E
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant={mapMode === "interactive" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setMapMode(mapMode === "interactive" ? "overview" : "interactive")}
            className="h-7 text-[11px] gap-1 rounded-md"
          >
            <Layers className="h-3 w-3" />
            <span>{mapMode === "interactive" ? "Grid View" : "Interactive"}</span>
          </Button>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md bg-accent/10 text-accent hover:bg-accent/20 text-[11px] font-semibold transition-colors"
          >
            <span>Directions</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Map Body Container */}
      <div className="relative flex-1 min-h-[260px] w-full overflow-hidden">
        {mapMode === "interactive" ? (
          <iframe
            key={`${place.latitude}-${place.longitude}`}
            title={`Interactive Map for ${place.destination}`}
            src={osmUrl}
            className="h-full w-full border-0 filter contrast-[1.02] brightness-[0.98]"
            loading="lazy"
          />
        ) : (
          <div className="relative h-full w-full bg-slate-950 p-6 flex flex-col justify-between">
            <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(hsl(var(--border))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border))_1px,transparent_1px)] [background-size:24px_24px]" />
            <div className="relative z-10 space-y-2">
              <span className="text-xs font-bold text-accent uppercase tracking-wider">Overview Coordinates</span>
              <h3 className="font-display text-2xl font-bold text-white">{place.destination}</h3>
              <p className="text-xs text-slate-300">{place.country}</p>
            </div>
          </div>
        )}

        {/* Floating Destination Badge */}
        <div className="absolute left-3 top-3 z-10 rounded-xl border border-border/80 bg-card/90 p-3 shadow-lg backdrop-blur-md max-w-[220px]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/15 text-accent border border-accent/30 shrink-0">
              <Navigation className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase text-accent tracking-wider">Current Target</p>
              <h4 className="font-display text-sm font-bold text-foreground truncate">{place.destination}</h4>
              <p className="text-[11px] text-muted-foreground truncate">{place.country}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Route Highlights Footer */}
      <div className="border-t border-border/80 bg-card/95 p-3 backdrop-blur-md z-20">
        <div className="mb-2 flex items-center justify-between text-xs font-bold text-foreground">
          <span className="flex items-center gap-1.5">
            <Palmtree className="h-3.5 w-3.5 text-accent" />
            <span>Suggested Stops ({place.highlights.length})</span>
          </span>
          <span className="text-[10px] font-semibold text-muted-foreground">Order of Visit</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {place.highlights.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/80 px-2.5 py-1 text-[11px] font-medium text-foreground shadow-2xs"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent/20 text-[9px] font-bold text-accent">
                {index + 1}
              </span>
              <span>{item}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
