import { ArrowRight, Bot, MapPinned, Tag, ShieldCheck, Sparkles, Navigation } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePlannerHistory } from "@/hooks/use-planner-history";
import destKerala from "@/assets/dest-kerala-backwaters.jpg";

export default function AIPlannerPreview() {
  const navigate = useNavigate();
  const { threads, createThread } = usePlannerHistory();

  const openPlanner = () => {
    const thread = threads[0] ?? createThread();
    window.open(`/planner/${thread.id}`, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="py-16 lg:py-24" data-reveal>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="relative min-h-[520px] overflow-hidden rounded-3xl border border-border shadow-2xl">
          <img
            src={destKerala}
            alt="Kerala backwaters for AI trip planning"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-dark/95 via-navy-dark/85 to-navy-dark/40" />

          <div className="relative z-10 grid min-h-[520px] items-center gap-8 p-6 md:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:p-14">
            <div className="max-w-xl">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-on-image/15 bg-on-image/10 px-3.5 py-1.5 text-xs font-semibold text-on-image backdrop-blur-md">
                <Bot className="h-4 w-4 text-accent" />
                <span>Meet Nila, Your AI Travel Architect</span>
              </span>

              <h2 className="font-display text-3xl font-bold text-on-image md:text-5xl tracking-tight leading-tight">
                Instant Rootmaps, Real Waypoints & Verified Package Rates.
              </h2>

              <p className="mt-4 max-w-lg text-sm leading-7 text-on-image-muted md:text-base">
                Ask Nila for any circuit or destination. Watch your route map plot live with GPS waypoints, day-by-day stops, drive times, and real package prices.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button
                  onClick={openPlanner}
                  size="lg"
                  className="gap-2 border-0 gradient-accent text-accent-foreground hover:opacity-90 rounded-full font-bold shadow-lg"
                >
                  <span>Launch AI Planner</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-white">
                  <ShieldCheck className="h-4 w-4 text-accent" />
                  <span>Verified Packages & Live Rootmaps</span>
                </div>
              </div>
            </div>

            {/* Interactive Preview Cards */}
            <div className="grid gap-3 sm:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-2xl border border-on-image/15 bg-navy-dark/75 p-4.5 backdrop-blur-2xl shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Saved Circuits</span>
                  </p>
                  <span className="text-[10px] text-on-image-muted">Browser Synced</span>
                </div>

                {[
                  { title: "Kerala Circuit (4D)", price: "₹14,999", active: true },
                  { title: "Munnar Hills (3D)", price: "₹9,999", active: false },
                  { title: "Kashmir Snow (4D)", price: "₹18,999", active: false },
                  { title: "Dubai Luxury (4D)", price: "₹36,999", active: false },
                ].map((trip) => (
                  <div
                    key={trip.title}
                    onClick={openPlanner}
                    className={`rounded-xl border p-2.5 text-xs transition-all cursor-pointer ${
                      trip.active
                        ? "border-accent/60 bg-accent/20 text-on-image shadow-sm"
                        : "border-on-image/10 bg-on-image/5 text-on-image-muted hover:bg-on-image/10"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{trip.title}</span>
                      <span className="font-bold text-accent">{trip.price}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-on-image/20 bg-card/95 p-5 shadow-2xl backdrop-blur-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent border border-accent/25">
                      <Navigation className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="font-display text-sm font-bold text-foreground">
                        Kerala Classic Route
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        4-Day Verified Waypoint Circuit
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-bold text-accent">
                    ₹14,999 / person
                  </span>
                </div>

                <div className="space-y-2.5">
                  {[
                    { stop: "Fort Kochi", desc: "Chinese Nets & Heritage", time: "Day 1" },
                    { stop: "Munnar", desc: "128 km · Tea Valleys & Fog", time: "Day 2" },
                    { stop: "Thekkady", desc: "91 km · Periyar Wildlife Safari", time: "Day 3" },
                    { stop: "Alleppey", desc: "138 km · Private Houseboat", time: "Day 4" },
                  ].map((s, index) => (
                    <div
                      key={s.stop}
                      className="flex items-center gap-3 rounded-xl bg-muted/40 p-2 border border-border/40"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-accent text-[11px] font-bold text-accent-foreground">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-xs text-foreground truncate">{s.stop}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{s.desc}</p>
                      </div>
                      <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
                        {s.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}