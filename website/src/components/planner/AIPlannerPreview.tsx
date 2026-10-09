import { ArrowRight, Bot, MapPinned } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePlannerHistory } from "@/hooks/use-planner-history";
import destKerala from "@/assets/dest-kerala-backwaters.jpg";

export default function AIPlannerPreview() {
  const navigate = useNavigate();
  const { threads, createThread } = usePlannerHistory();
  const openPlanner = () => {
    const thread = threads[0] ?? createThread();
    navigate(`/planner/${thread.id}`);
  };
  return (
    <section className="py-16 lg:py-24" data-reveal>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="relative min-h-[520px] overflow-hidden rounded-lg border border-border shadow-glass">
          <img src={destKerala} alt="Kerala backwaters for AI trip planning" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-dark/95 via-navy-dark/80 to-navy-dark/35" />
          <div className="relative z-10 grid min-h-[520px] items-center gap-8 p-6 md:p-10 lg:grid-cols-[0.85fr_1.15fr] lg:p-14">
            <div className="max-w-xl">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-on-image/15 bg-on-image/10 px-3 py-1.5 text-xs font-semibold text-on-image"><Bot className="h-4 w-4 text-accent" /> Meet Nila, your AI planner</span>
              <h2 className="font-display text-3xl font-bold text-on-image md:text-5xl">From one idea to a complete journey.</h2>
              <p className="mt-4 max-w-lg text-sm leading-7 text-on-image-muted md:text-base">Build day-by-day plans, compare stops, and keep separate trips saved in your browser.</p>
              <Button onClick={openPlanner} size="lg" className="mt-7 gap-2 border-0 gradient-accent text-accent-foreground hover:opacity-90">Start planning <ArrowRight className="h-4 w-4" /></Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-lg border border-on-image/15 bg-navy-dark/65 p-4 backdrop-blur-xl">
                <p className="mb-3 text-xs font-semibold uppercase text-on-image-muted">Saved trips</p>
                {["Kerala escape", "Munnar weekend", "Maldives honeymoon"].map((trip, index) => <div key={trip} className={`mb-2 rounded-md border p-3 text-sm ${index === 0 ? "border-accent/50 bg-accent/15 text-on-image" : "border-on-image/10 bg-on-image/5 text-on-image-muted"}`}>{trip}</div>)}
              </div>
              <div className="rounded-lg border border-on-image/15 bg-card/95 p-4 shadow-card backdrop-blur-xl">
                <div className="mb-6 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/10 text-accent"><MapPinned className="h-5 w-5" /></div><div><p className="font-semibold text-foreground">Kerala route</p><p className="text-xs text-muted-foreground">4-day itinerary</p></div></div>
                <div className="space-y-3">{["Kochi · Culture & cafés", "Munnar · Tea country", "Alappuzha · Backwaters", "Varkala · Sunset coast"].map((stop, index) => <div key={stop} className="flex items-center gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{index + 1}</span><span className="text-sm text-foreground">{stop}</span></div>)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}