import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  Compass,
  Copy,
  MapPin,
  Plus,
  RotateCcw,
  Trash2,
  Printer,
  Sparkles,
  Car,
  Hotel,
  Tag,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Share2,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  PanelLeft,
  PanelLeftClose,
  MessageSquare,
  Map as MapIcon,
  Sun,
  Moon,
  ArrowLeft,
  X,
  Check,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from "@/components/ai-elements/tool";
import { usePlannerHistory, type PlannerDestination, type PlannerThread, defaultKeralaDestination } from "@/hooks/use-planner-history";
import { detectDestinationMatch, matchApiPackages } from "@/data/plannerDatabase";
import DestinationMap from "./DestinationMap";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchPackagesStart } from "@/store/slices/packagesSlice";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

function generateNilaReply(prompt: string, destination: PlannerDestination): string {
  const price = destination.totalEstimatedPrice || 14999;
  const stops = destination.stops || [];
  const daysPlan = destination.daysPlan || [];

  return `### 🌴 AI Travel Blueprint: ${destination.destination} (${destination.country})

I have crafted a complete, verified route itinerary for your trip to **${destination.destination}**, arranged sequentially for smooth driving and zero backtrack.

#### 📍 Route & Waypoints Overview
${stops.map((s, i) => `${i + 1}. **${s.name}** (Day ${s.dayNumber}) — *${s.driveFromPrev || "Starting Hub"}*`).join("\n")}

#### 📅 Day-by-Day Journey Itinerary
${daysPlan
  .map(
    (d) => `##### Day ${d.day}: ${d.title} (${d.location})
- **Morning:** ${d.morning}
- **Afternoon:** ${d.afternoon}
- **Evening:** ${d.evening}
- **Recommended Stay:** 🏨 *${d.stay}*
- **Local Tip:** 💡 *${d.travelTip}*`
  )
  .join("\n\n")}

#### 💰 Verified Package Pricing & Budget Breakdown
- **Estimated Package Rate:** **₹${price.toLocaleString("en-IN")}** / person (Special ABA Promo Applied)
- **Accommodation (Resorts & Houseboat):** ₹${(destination.priceBreakdown?.stay || 7200).toLocaleString("en-IN")}
- **Private Chauffeur & AC Transfers:** ₹${(destination.priceBreakdown?.transport || 4800).toLocaleString("en-IN")}
- **Activities & Entry Permits:** ₹${(destination.priceBreakdown?.activities || 2100).toLocaleString("en-IN")}

*Explore the interactive route map, inspect each stop's coordinates, or book matching packages directly from the live trip view.*`;
}

const getText = (message: any) => {
  if (!message || !Array.isArray(message.parts)) return "";
  return message.parts
    .filter((part: any): part is { type: "text"; text: string } => part.type === "text")
    .map((part: any) => part.text)
    .join("");
};

const formatDate = (timestamp: number) =>
  new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(timestamp);

const quickIdeas = [
  { label: "🌴 4-Day Classic Kerala Circuit", query: "Plan a 4-day trip to Kerala covering Kochi, Munnar, Thekkady, and Alleppey houseboat" },
  { label: "⛰️ 3-Day Munnar Mist & Tea Hills", query: "Plan 3 days in Munnar visiting tea gardens, waterfalls, and Top Station" },
  { label: "🛶 3-Day Alleppey Houseboat & Beach", query: "Plan 3 days in Alleppey with private backwater houseboat stay and Marari beach" },
  { label: "🐅 3-Day Wayanad Rainforest & Safari", query: "Plan 3 days in Wayanad with Banasura Dam, treehouse stay, and Edakkal caves" },
  { label: "🏖️ 4-Day Goa Beaches & Forts", query: "Plan 4 days in Goa with beach watersports, Portuguese churches, and Mandovi cruise" },
  { label: "❄️ 4-Day Kashmir Snow & Valley", query: "Plan 4 days in Kashmir with Dal lake houseboat, Gulmarg gondola, and Pahalgam" },
  { label: "🏙️ 4-Day Dubai Desert & Marina", query: "Plan 4 days in Dubai with Burj Khalifa, desert safari BBQ, and Marina yacht cruise" },
];

function PlannerChat({
  thread,
  updateThread,
  onSelectDestination,
  apiPackages,
}: {
  thread: PlannerThread;
  updateThread: ReturnType<typeof usePlannerHistory>["updateThread"];
  onSelectDestination: (dest: PlannerDestination) => void;
  apiPackages?: any[];
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [messages, setMessages] = useState<any[]>(thread.messages || []);
  const [isThinking, setIsThinking] = useState(false);
  const [isChatFullscreen, setIsChatFullscreen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isChatFullscreen) {
        setIsChatFullscreen(false);
      }
    };
    if (isChatFullscreen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isChatFullscreen]);

  useEffect(() => {
    setMessages(thread.messages || []);
  }, [thread.id]);

  const submit = useCallback(
    async ({ text }: PromptInputMessage) => {
      const clean = text.trim();
      if (!clean || isThinking) return;

      const userMsg = {
        id: crypto.randomUUID(),
        role: "user" as const,
        parts: [{ type: "text" as const, text: clean }],
      };

      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);
      setIsThinking(true);

      if (messages.length === 0) {
        updateThread(thread.id, { title: clean.slice(0, 42) });
      }

      setTimeout(() => {
        const dest = detectDestinationMatch(clean, apiPackages);
        const replyText = generateNilaReply(clean, dest);

        const assistantMsg = {
          id: crypto.randomUUID(),
          role: "assistant" as const,
          parts: [
            {
              type: "tool-set_destination",
              state: "output-available",
              input: { destination: dest.destination, country: dest.country },
              output: dest,
            },
            { type: "text" as const, text: replyText },
          ],
        };

        const finalMessages = [...nextMessages, assistantMsg];
        setMessages(finalMessages);
        setIsThinking(false);
        updateThread(thread.id, { messages: finalMessages, destination: dest });
        onSelectDestination(dest);
        window.setTimeout(() => textareaRef.current?.focus({ preventScroll: true }), 50);
      }, 550);
    },
    [isThinking, messages, onSelectDestination, thread.id, updateThread, apiPackages]
  );

  const regenerate = useCallback(() => {
    if (messages.length === 0 || isThinking) return;
    const lastUserIdx = [...messages].reverse().findIndex((m) => m.role === "user");
    if (lastUserIdx === -1) return;
    const actualIdx = messages.length - 1 - lastUserIdx;
    const userMsg = messages[actualIdx];
    const textPart = userMsg.parts.find((p: any) => p.type === "text");
    if (textPart) {
      submit({ text: textPart.text, files: [] });
    }
  }, [isThinking, messages, submit]);

  return (
    <div
      className={cn(
        "flex h-full w-full min-w-0 flex-col bg-card/60 backdrop-blur-sm transition-all duration-300",
        isChatFullscreen && "fixed inset-0 z-50 h-screen w-screen border-0 shadow-2xl overflow-hidden bg-background"
      )}
    >
      {/* Chat Header */}
      <div
        className={cn(
          "flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5 backdrop-blur-md",
          isChatFullscreen ? "bg-card/95 py-3.5 px-6 shadow-sm sticky top-0 z-30" : "bg-card"
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/15 text-accent border border-accent/25 shrink-0">
            <Compass className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate font-display text-base font-semibold text-foreground">
                {thread.title}
              </p>
              {isChatFullscreen && (
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-bold text-accent shrink-0">
                  <Sparkles className="h-3 w-3" />
                  Full Screen
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Nila · AI Travel Specialist</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={regenerate}
              aria-label="Regenerate trip plan"
              title="Regenerate trip plan"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}

          <Button
            variant={isChatFullscreen ? "default" : "ghost"}
            size={isChatFullscreen ? "sm" : "icon"}
            onClick={() => setIsChatFullscreen((prev) => !prev)}
            aria-label={isChatFullscreen ? "Exit Fullscreen" : "Fullscreen Chat"}
            title={isChatFullscreen ? "Exit Fullscreen (Esc)" : "Expand AI Chat to Fullscreen"}
            className={cn(
              "transition-all",
              isChatFullscreen
                ? "h-8 px-3 gap-1.5 rounded-full gradient-accent text-accent-foreground font-bold text-xs shadow-sm"
                : "h-8 w-8 text-muted-foreground hover:text-foreground"
            )}
          >
            {isChatFullscreen ? (
              <>
                <Minimize2 className="h-3.5 w-3.5" />
                <span>Exit Fullscreen</span>
                <kbd className="hidden sm:inline-block rounded bg-black/20 px-1 py-0.2 text-[9px] uppercase">Esc</kbd>
              </>
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Quick Prompts Strip */}
      <div
        className={cn(
          "border-b border-border/60 bg-muted/30 px-3 py-2 overflow-x-auto scrollbar-hide",
          isChatFullscreen ? "px-6 py-2.5 bg-muted/40" : ""
        )}
      >
        <div className={cn("flex items-center gap-1.5 min-w-max", isChatFullscreen && "max-w-4xl mx-auto w-full")}>
          <span className="text-[10px] font-bold text-accent uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Ideas:
          </span>
          {quickIdeas.map((idea) => (
            <button
              key={idea.label}
              type="button"
              onClick={() => submit({ text: idea.query, files: [] })}
              className="shrink-0 text-[11px] font-medium rounded-full bg-background border border-border/80 px-2.5 py-1 text-foreground hover:border-accent hover:text-accent transition-colors shadow-2xs"
            >
              {idea.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation Messages */}
      <Conversation className="min-h-0 flex-1">
        <ConversationContent
          className={cn(
            "gap-5 px-4 py-5 sm:px-5",
            isChatFullscreen && "max-w-4xl mx-auto w-full px-6 py-8"
          )}
        >
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-accent border border-accent/30 shadow-md">
                  <Compass className="h-6 w-6" />
                </div>
              }
              title="Where would you like to travel?"
              description="Tell Nila any destination, duration, budget, or travel style to see your interactive route map and package rates come to life."
            >
              <div className="w-full space-y-4 max-w-md mx-auto pt-2">
                <div className="flex flex-wrap justify-center gap-2">
                  {quickIdeas.slice(0, 4).map((idea) => (
                    <Button
                      key={idea.label}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => submit({ text: idea.query, files: [] })}
                      className="rounded-full text-xs font-semibold gap-1 hover:border-accent hover:text-accent"
                    >
                      {idea.label}
                    </Button>
                  ))}
                </div>
              </div>
            </ConversationEmptyState>
          ) : (
            messages.map((message) => (
              <Message key={message.id} from={message.role}>
                <MessageContent>
                  {message.parts.map((part: any, index: number) => {
                    if (part.type === "text")
                      return (
                        <MessageResponse key={`${message.id}-${index}`}>
                          {part.text}
                        </MessageResponse>
                      );
                    if (part.type === "tool-set_destination")
                      return (
                        <Tool key={`${message.id}-${index}`} defaultOpen={false}>
                          <ToolHeader
                            type={part.type}
                            state={part.state}
                            title="Interactive Route Map & Packages Synced"
                          />
                          <ToolContent>
                            <ToolInput input={part.input} />
                            <ToolOutput
                              output={
                                part.state === "output-available" ? part.output : undefined
                              }
                              errorText={
                                part.state === "output-error" ? part.errorText : undefined
                              }
                            />
                          </ToolContent>
                        </Tool>
                      );
                    return null;
                  })}
                </MessageContent>
                {message.role === "assistant" && getText(message) && (
                  <MessageActions>
                    <MessageAction
                      tooltip="Copy full trip itinerary"
                      onClick={() => {
                        navigator.clipboard.writeText(getText(message));
                        toast({
                          title: "Itinerary Copied",
                          description: "Plan copied to your clipboard.",
                        });
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </MessageAction>
                  </MessageActions>
                )}
              </Message>
            ))
          )}
          {isThinking && (
            <Shimmer className="text-sm py-2 text-accent">
              Nila is plotting your route, waypoints, and package prices...
            </Shimmer>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* Chat Prompt Input Bar */}
      <div
        className={cn(
          "border-t border-border bg-background/80 p-3 sm:p-4 backdrop-blur-md",
          isChatFullscreen && "p-4 sm:p-6 bg-background/90"
        )}
      >
        <div className={cn(isChatFullscreen && "max-w-4xl mx-auto w-full")}>
          <PromptInput
            onSubmit={submit}
            className="rounded-2xl border-border/80 bg-card shadow-lg"
          >
            <PromptInputTextarea
              ref={textareaRef}
              placeholder="Ask Nila: '5 days in Kerala with family' or 'Romantic Kashmir honeymoon'..."
              className={cn("text-sm", isChatFullscreen ? "min-h-[85px]" : "min-h-[74px]")}
            />
            <PromptInputFooter>
              <PromptInputTools>
                <span className="px-1 text-xs text-muted-foreground hidden sm:inline">
                  Enter to send · Shift + Enter for new line
                </span>
              </PromptInputTools>
              <PromptInputSubmit
                status={isThinking ? "submitted" : "ready"}
                disabled={isThinking}
                className="shrink-0 rounded-xl gradient-accent text-accent-foreground border-0"
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}

export default function PlannerWorkspace({ activeThreadId }: { activeThreadId?: string }) {
  const navigate = useNavigate();
  const history = usePlannerHistory();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mobileView, setMobileView] = useState<"chat" | "map">("chat");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { packages: reduxPackages } = useAppSelector((state) => state.packages);

  useEffect(() => {
    dispatch(fetchPackagesStart({}));
  }, [dispatch]);

  const activeThread =
    history.threads.find((thread) => thread.id === activeThreadId) ?? history.threads[0];

  useEffect(() => {
    if (!activeThread) return;
    if (!activeThreadId || activeThread.id !== activeThreadId) {
      navigate(`/planner/${activeThread.id}`, { replace: true });
    }
  }, [activeThread, activeThreadId, navigate]);

  const [activeStopIndex, setActiveStopIndex] = useState(0);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);

  if (!activeThread) return null;

  const destination: PlannerDestination = useMemo(() => {
    const base = activeThread.destination || defaultKeralaDestination;
    if (Array.isArray(reduxPackages) && reduxPackages.length > 0) {
      const liveMatches = matchApiPackages(base.destination, base.stops, reduxPackages);
      if (liveMatches.length > 0) {
        return {
          ...base,
          matchedPackages: liveMatches,
          totalEstimatedPrice: liveMatches[0].price || base.totalEstimatedPrice,
        };
      }
    }
    return base;
  }, [activeThread.destination, reduxPackages]);

  const currentStop = useMemo(() => {
    if (!destination.stops || destination.stops.length === 0) return null;
    return destination.stops[activeStopIndex] || destination.stops[0];
  }, [destination.stops, activeStopIndex]);

  const createTrip = () => {
    const thread = history.createThread();
    navigate(`/planner/${thread.id}`);
    setIsSidebarOpen(false);
  };

  const deleteTrip = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextId = history.deleteThread(id);
    if (id === activeThread.id) navigate(`/planner/${nextId}`, { replace: true });
  };

  const copyTripDetails = () => {
    const text = `🌴 AI Trip Blueprint: ${destination.destination} (${destination.country})
Duration: ${destination.durationDays || 4} Days
Estimated Price: ₹${(destination.totalEstimatedPrice || 14999).toLocaleString("en-IN")} / person

Route Stops:
${destination.stops.map((s, i) => `${i + 1}. ${s.name} - ${s.description}`).join("\n")}

Planned with dotravels AI Trip Studio.`;

    navigator.clipboard.writeText(text);
    toast({
      title: "Trip Blueprint Copied! 📋",
      description: "Full itinerary & route details copied to clipboard.",
    });
  };

  const toggleBrowserFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-background select-none">
      {/* MODERN AI STUDIO APP BAR */}
      <header className="h-14 border-b border-border/80 bg-card/90 backdrop-blur-md px-3 sm:px-5 flex items-center justify-between gap-2 z-30 shrink-0">
        {/* Left: Brand & Controls */}
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-muted/80 transition-colors group"
            title="Return to dotravels Main Website"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-accent-foreground font-bold shadow-xs transition-transform group-hover:scale-105">
              <Compass className="h-4 w-4" />
            </div>
            <div className="hidden sm:block">
              <span className="font-display text-sm font-bold tracking-tight text-foreground">
                dotravels
              </span>
              <span className="ml-1.5 rounded-md bg-accent/15 px-1.5 py-0.5 text-[9px] font-bold text-accent uppercase tracking-wider">
                AI Studio
              </span>
            </div>
          </Link>

          <div className="h-4 w-px bg-border/80 hidden sm:block mx-1" />

          {/* Toggle Saved Trips Drawer */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className={cn(
              "h-8 px-2.5 rounded-xl text-xs font-semibold gap-1.5 border border-border/70 hover:border-accent hover:text-accent transition-colors",
              isSidebarOpen && "bg-accent/10 border-accent text-accent"
            )}
            title="Saved Trips History"
          >
            {isSidebarOpen ? <PanelLeftClose className="h-3.5 w-3.5" /> : <PanelLeft className="h-3.5 w-3.5" />}
            <span className="hidden md:inline">Trips</span>
            <span className="rounded-full bg-muted px-1.5 py-0.2 text-[10px] font-bold">
              {history.threads.length}
            </span>
          </Button>

          {/* New Trip Button */}
          <Button
            size="sm"
            onClick={createTrip}
            className="h-8 px-2.5 sm:px-3 rounded-xl gradient-accent text-accent-foreground font-semibold text-xs border-0 shadow-xs gap-1"
            title="Start a new trip"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Trip</span>
          </Button>
        </div>

        {/* Center: Dynamic Active Location & Trip Selector (Synced with Map Selection) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setLocationDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-full border border-border/80 bg-muted/50 hover:bg-muted/80 px-3.5 py-1.5 shadow-2xs transition-all group max-w-[280px] sm:max-w-[420px] lg:max-w-none"
            title="Click to view all route stops or switch active location on map"
            aria-label="Active Map Location"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-accent group-hover:scale-110 transition-transform shrink-0">
              <MapPin className="h-3 w-3" />
            </div>

            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-display text-xs font-bold text-foreground truncate">
                {currentStop?.name ? currentStop.name : destination.destination}
              </span>
              <span className="text-[11px] text-muted-foreground truncate hidden sm:inline">
                ({destination.destination})
              </span>
              {destination.stops && destination.stops.length > 0 && (
                <span className="rounded-full bg-accent/15 px-2 py-0.2 text-[10px] font-bold text-accent shrink-0">
                  Stop {activeStopIndex + 1}/{destination.stops.length}
                </span>
              )}
            </div>

            <span className="text-muted-foreground hidden md:inline">•</span>
            <span className="text-[11px] text-muted-foreground font-medium hidden md:inline shrink-0">
              Day {currentStop?.dayNumber || activeStopIndex + 1}
            </span>

            <span className="text-muted-foreground hidden lg:inline">•</span>
            <span className="text-[11px] font-bold text-accent hidden lg:inline shrink-0">
              ₹{(destination.totalEstimatedPrice || 14999).toLocaleString("en-IN")}
            </span>

            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold ml-0.5 shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>

            <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform ml-0.5 shrink-0", locationDropdownOpen && "rotate-180")} />
          </button>

          {/* Interactive Route Waypoints Dropdown */}
          {locationDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setLocationDropdownOpen(false)}
              />
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 sm:w-96 rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl p-2.5 z-50 animate-in fade-in-0 zoom-in-95 duration-150">
                <div className="flex items-center justify-between px-2 py-1.5 border-b border-border/60 mb-1.5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
                      {destination.destination} Journey Route
                    </span>
                    <p className="text-xs font-bold text-foreground">
                      Select Stop to Fly on Map
                    </p>
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {destination.stops?.length || 0} Waypoints
                  </span>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                  {(destination.stops || []).map((stop, idx) => {
                    const isSelected = activeStopIndex === idx;
                    return (
                      <button
                        key={stop.id || idx}
                        type="button"
                        onClick={() => {
                          setActiveStopIndex(idx);
                          setLocationDropdownOpen(false);
                          if (mobileView === "chat") setMobileView("map");
                        }}
                        className={cn(
                          "w-full flex items-center justify-between p-2 rounded-xl text-left transition-all border",
                          isSelected
                            ? "bg-accent/15 border-accent text-foreground shadow-xs font-bold"
                            : "bg-muted/30 border-transparent hover:border-border hover:bg-muted/70 text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={cn(
                              "flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold shrink-0",
                              isSelected
                                ? "bg-accent text-accent-foreground"
                                : "bg-card border border-border/70 text-foreground"
                            )}
                          >
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-foreground">
                              {stop.name}
                            </p>
                            <p className="truncate text-[10px] text-muted-foreground">
                              Day {stop.dayNumber} · {stop.driveFromPrev || "Starting Hub"}
                            </p>
                          </div>
                        </div>

                        {isSelected ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-accent shrink-0">
                            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-ping" />
                            Active on Map
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground shrink-0 group-hover:text-accent">
                            Select ➔
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right: Actions & Theme & Mobile Toggle */}
        <div className="flex items-center gap-1.5">
          {/* Mobile View Switcher */}
          <div className="flex items-center lg:hidden bg-muted/60 p-0.5 rounded-xl border border-border/60 mr-1">
            <button
              type="button"
              onClick={() => setMobileView("chat")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1",
                mobileView === "chat"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <MessageSquare className="h-3 w-3 text-accent" />
              <span>Chat</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileView("map")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1",
                mobileView === "map"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <MapIcon className="h-3 w-3 text-accent" />
              <span>Map</span>
            </button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={copyTripDetails}
            className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60"
            title="Copy Trip Plan"
          >
            <Copy className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.print()}
            className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 hidden sm:inline-flex"
            title="Print Itinerary"
          >
            <Printer className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60"
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-amber-400" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleBrowserFullscreen}
            className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 hidden sm:inline-flex"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Studio"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      {/* MAIN SPLIT WORKSPACE: CHAT & MAP STUDIO */}
      <div className="flex-1 min-h-0 flex relative overflow-hidden">
        {/* COLLAPSIBLE SAVED TRIPS DRAWER / SIDEBAR */}
        {isSidebarOpen && (
          <aside className="w-64 border-r border-border/80 bg-card/95 backdrop-blur-md p-3 flex flex-col h-full shrink-0 z-20 shadow-lg animate-in slide-in-from-left-2 duration-200">
            <div className="mb-3 flex items-center justify-between px-1">
              <div>
                <p className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">Saved Trips</p>
                <p className="text-[11px] text-muted-foreground">{history.threads.length} trips in browser</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(false)}
                className="h-6 w-6 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>

            <Button
              size="sm"
              onClick={createTrip}
              className="w-full mb-3 h-8 rounded-xl gradient-accent text-accent-foreground font-semibold text-xs border-0 shadow-xs gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Start Fresh Trip</span>
            </Button>

            <div className="flex-1 min-h-0 overflow-y-auto space-y-1 pr-1">
              {history.threads.map((thread) => {
                const isCurrent = thread.id === activeThread.id;
                return (
                  <div
                    key={thread.id}
                    className={cn(
                      "group flex items-center gap-1 rounded-xl border p-1.5 transition-all cursor-pointer",
                      isCurrent
                        ? "border-accent/40 bg-accent/10 shadow-2xs"
                        : "border-transparent bg-muted/30 hover:border-border hover:bg-card"
                    )}
                    onClick={() => {
                      navigate(`/planner/${thread.id}`);
                      if (window.innerWidth < 1024) setIsSidebarOpen(false);
                    }}
                  >
                    <div className="min-w-0 flex-1 px-2 py-1">
                      <span className="block truncate text-xs font-semibold text-foreground">
                        {thread.title}
                      </span>
                      <span className="mt-0.5 block text-[10px] text-muted-foreground truncate">
                        {thread.destination?.destination ?? "Trip"} · {formatDate(thread.updatedAt)}
                      </span>
                    </div>
                    {history.threads.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={(e) => deleteTrip(thread.id, e)}
                        className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete trip"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>
        )}

        {/* CHAT COLUMN (LEFT PANE) */}
        <div
          className={cn(
            "flex flex-col h-full min-h-0 border-r border-border/80 transition-all duration-200",
            isSidebarOpen ? "w-[42%] xl:w-[40%]" : "w-[46%] xl:w-[43%]",
            mobileView === "chat" ? "flex w-full" : "hidden lg:flex"
          )}
        >
          <PlannerChat
            key={activeThread.id}
            thread={activeThread}
            updateThread={history.updateThread}
            apiPackages={reduxPackages}
            onSelectDestination={(dest) => {
              setActiveStopIndex(0);
            }}
          />
        </div>

        {/* MAP & ITINERARY STUDIO COLUMN (RIGHT PANE) */}
        <div
          className={cn(
            "flex-1 min-w-0 h-full flex flex-col overflow-hidden bg-background",
            mobileView === "map" ? "flex w-full" : "hidden lg:flex"
          )}
        >
          <DestinationMap
            destination={destination}
            activeStopIndex={activeStopIndex}
            apiPackages={reduxPackages}
            onSelectStop={(idx) => {
              setActiveStopIndex(idx);
            }}
          />
        </div>
      </div>
    </div>
  );
}