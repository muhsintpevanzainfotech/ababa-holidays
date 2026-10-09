import { useCallback, useEffect, useRef, useState } from "react";
import { CalendarDays, Compass, Copy, MapPin, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
import { usePlannerHistory, type PlannerDestination, type PlannerThread } from "@/hooks/use-planner-history";
import DestinationMap from "./DestinationMap";

const DESTINATION_DATABASE: Record<string, PlannerDestination> = {
  munnar: { destination: "Munnar", country: "India", latitude: 10.0889, longitude: 77.0595, highlights: ["Tea Gardens", "Eravikulam Park", "Mattupetty Dam", "Top Station"] },
  kochi: { destination: "Kochi", country: "India", latitude: 9.9312, longitude: 76.2673, highlights: ["Fort Kochi", "Chinese Fishing Nets", "Mattancherry Palace", "Marine Drive"] },
  alappuzha: { destination: "Alappuzha", country: "India", latitude: 9.4981, longitude: 76.3388, highlights: ["Backwater Houseboat", "Alappuzha Beach", "Punnamada Lake", "Kuttanad Fields"] },
  alleppey: { destination: "Alappuzha", country: "India", latitude: 9.4981, longitude: 76.3388, highlights: ["Backwater Houseboat", "Alappuzha Beach", "Punnamada Lake", "Kuttanad Fields"] },
  wayanad: { destination: "Wayanad", country: "India", latitude: 11.6854, longitude: 76.1320, highlights: ["Edakkal Caves", "Banasura Sagar", "Chembra Peak", "Kuruva Island"] },
  thekkady: { destination: "Thekkady", country: "India", latitude: 9.6031, longitude: 77.1612, highlights: ["Periyar Reserve", "Spice Plantations", "Elephant Junction", "Kathakali Show"] },
  varkala: { destination: "Varkala", country: "India", latitude: 8.7379, longitude: 76.7163, highlights: ["Varkala Cliff", "Papanasam Beach", "Janardhana Temple", "Black Beach"] },
  kovalam: { destination: "Kovalam", country: "India", latitude: 8.4004, longitude: 76.9787, highlights: ["Lighthouse Beach", "Hawah Beach", "Samudra Beach", "Vizhinjam Port"] },
  kerala: { destination: "Kerala", country: "India", latitude: 10.1632, longitude: 76.6413, highlights: ["Fort Kochi", "Munnar Tea Hills", "Alleppey Houseboat", "Varkala Cliff"] },
  maldives: { destination: "Maldives", country: "Maldives", latitude: 3.2028, longitude: 73.2207, highlights: ["Malé City", "Overwater Bungalows", "Maafushi Island", "Snorkeling Reefs"] },
  goa: { destination: "Goa", country: "India", latitude: 15.2993, longitude: 74.1240, highlights: ["Calangute Beach", "Fort Aguada", "Dudhsagar Falls", "Panaji Quarter"] },
  bali: { destination: "Bali", country: "Indonesia", latitude: -8.4095, longitude: 115.1889, highlights: ["Ubud Forest", "Tegallalang Terraces", "Uluwatu Temple", "Seminyak Beach"] },
  paris: { destination: "Paris", country: "France", latitude: 48.8566, longitude: 2.3522, highlights: ["Eiffel Tower", "Louvre Museum", "Seine River Cruise", "Montmartre"] },
  tokyo: { destination: "Tokyo", country: "Japan", latitude: 35.6762, longitude: 139.6503, highlights: ["Shibuya Crossing", "Senso-ji Temple", "Mount Fuji View", "Akihabara"] },
  dubai: { destination: "Dubai", country: "United Arab Emirates", latitude: 25.2048, longitude: 55.2708, highlights: ["Burj Khalifa", "Dubai Mall & Fountains", "Desert Safari", "Palm Jumeirah"] },
  kashmir: { destination: "Srinagar", country: "India", latitude: 34.0837, longitude: 74.7973, highlights: ["Dal Lake Shikara", "Gulmarg Gondola", "Pahalgam Valley", "Mughal Gardens"] },
};

function detectDestination(prompt: string): PlannerDestination {
  const lower = prompt.toLowerCase();
  for (const key of Object.keys(DESTINATION_DATABASE)) {
    if (lower.includes(key)) {
      return DESTINATION_DATABASE[key];
    }
  }
  // Generic fallback based on title words
  const words = prompt.split(/\s+/).filter(w => w.length > 3);
  const placeName = words.length > 0 ? words[0].charAt(0).toUpperCase() + words[0].slice(1) : "Kerala";
  return {
    destination: placeName,
    country: "India",
    latitude: 10.1632,
    longitude: 76.6413,
    highlights: [`${placeName} Sightseeing`, "Local Cultural Tour", "Scenic Views", "Relaxation & Dining"]
  };
}

function generateNilaReply(prompt: string, destination: PlannerDestination): string {
  return `### 🌴 Custom Trip Itinerary for ${destination.destination} (${destination.country})

Here is a curated, hassle-free travel plan tailored for your visit to **${destination.destination}**:

#### 📍 Suggested Day-by-Day Plan
${destination.highlights.map((h, i) => `- **Day ${i + 1}:** Explore **${h}** with local sightseeing, food tasting, and evening leisure.`).join("\n")}

#### 💡 Local Tips & Budget Guidance
- **Best Time to Visit:** October to March for pleasant, comfortable weather.
- **Estimated Budget:** ₹12,000 – ₹25,000 per person (depending on hotel luxury & transport choice).
- **Travel Tip:** Pre-book cabs or local transfers through dotravels for seamless pickups.

*Would you like me to adjust the duration, suggest top-rated family hotels, or arrange airport transfers for ${destination.destination}?*`;
}

const getText = (message: any) => {
  if (!message || !Array.isArray(message.parts)) return "";
  return message.parts
    .filter((part: any): part is { type: "text"; text: string } => part.type === "text")
    .map((part: any) => part.text)
    .join("");
};

const formatDate = (timestamp: number) => new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(timestamp);

function ItineraryCards({ destination }: { destination?: PlannerDestination }) {
  const place = destination ?? { destination: "Kerala", country: "India", latitude: 10.1632, longitude: 76.6413, highlights: ["Kochi", "Munnar", "Alappuzha", "Varkala"] };
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label={`Suggested ${place.destination} itinerary`}>
      {place.highlights.map((highlight, index) => (
        <div key={`${highlight}-${index}`} className="rounded-lg border border-border/70 bg-card/90 p-3 shadow-card backdrop-blur-md">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase text-primary">Day {index + 1}</span>
            <CalendarDays className="h-3.5 w-3.5 text-accent" />
          </div>
          <p className="truncate text-sm font-semibold text-foreground">{highlight}</p>
          <p className="mt-1 text-xs text-muted-foreground">Explore & unwind</p>
        </div>
      ))}
    </div>
  );
}

function PlannerChat({ thread, updateThread }: { thread: PlannerThread; updateThread: ReturnType<typeof usePlannerHistory>["updateThread"] }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [messages, setMessages] = useState<any[]>(thread.messages || []);
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    setMessages(thread.messages || []);
  }, [thread.id]);

  const submit = useCallback(async ({ text }: PromptInputMessage) => {
    const clean = text.trim();
    if (!clean || isThinking) return;

    const userMsg = {
      id: crypto.randomUUID(),
      role: "user" as const,
      parts: [{ type: "text" as const, text: clean }]
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setIsThinking(true);

    if (messages.length === 0) {
      updateThread(thread.id, { title: clean.slice(0, 42) });
    }

    setTimeout(() => {
      const dest = detectDestination(clean);
      const replyText = generateNilaReply(clean, dest);

      const assistantMsg = {
        id: crypto.randomUUID(),
        role: "assistant" as const,
        parts: [
          {
            type: "tool-set_destination",
            state: "output-available",
            input: { destination: dest.destination, country: dest.country },
            output: dest
          },
          { type: "text" as const, text: replyText }
        ]
      };

      const finalMessages = [...nextMessages, assistantMsg];
      setMessages(finalMessages);
      setIsThinking(false);
      updateThread(thread.id, { messages: finalMessages, destination: dest });
      window.setTimeout(() => textareaRef.current?.focus({ preventScroll: true }), 50);
    }, 600);
  }, [isThinking, messages, thread.id, updateThread]);

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
    <div className="flex min-h-[600px] min-w-0 flex-col bg-card lg:h-[720px] lg:min-h-0">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="truncate font-display text-base font-semibold text-foreground">{thread.title}</p>
          <p className="text-xs text-muted-foreground">Nila · Personal trip planner</p>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="icon" onClick={regenerate} aria-label="Regenerate last answer">
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Conversation className="min-h-0">
        <ConversationContent className="gap-5 px-4 py-5 sm:px-5">
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={<div className="flex h-12 w-12 items-center justify-center rounded-lg gradient-accent text-accent-foreground"><Compass className="h-6 w-6" /></div>}
              title="Where would you like to go?"
              description="Share a destination, dates, budget, or travel style."
            >
              <div className="w-full space-y-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg gradient-accent text-accent-foreground"><Compass className="h-6 w-6" /></div>
                <div><h3 className="font-display text-lg font-semibold text-foreground">Plan with Nila</h3><p className="mt-1 text-sm text-muted-foreground">Share a destination, dates, budget, or travel style.</p></div>
                <div className="flex flex-wrap justify-center gap-2">
                  {["4 days in Munnar", "Kerala family trip", "Maldives honeymoon"].map((idea) => (
                    <Button key={idea} type="button" variant="outline" size="sm" onClick={() => submit({ text: idea, files: [] })}>{idea}</Button>
                  ))}
                </div>
              </div>
            </ConversationEmptyState>
          ) : messages.map((message) => (
            <Message key={message.id} from={message.role}>
              <MessageContent>
                {message.parts.map((part: any, index: number) => {
                  if (part.type === "text") return <MessageResponse key={`${message.id}-${index}`}>{part.text}</MessageResponse>;
                  if (part.type === "tool-set_destination") return (
                    <Tool key={`${message.id}-${index}`} defaultOpen={false}>
                      <ToolHeader type={part.type} state={part.state} title="Updating destination map" />
                      <ToolContent>
                        <ToolInput input={part.input} />
                        <ToolOutput output={part.state === "output-available" ? part.output : undefined} errorText={part.state === "output-error" ? part.errorText : undefined} />
                      </ToolContent>
                    </Tool>
                  );
                  return null;
                })}
              </MessageContent>
              {message.role === "assistant" && getText(message) && (
                <MessageActions>
                  <MessageAction tooltip="Copy answer" onClick={() => navigator.clipboard.writeText(getText(message))}><Copy className="h-3.5 w-3.5" /></MessageAction>
                </MessageActions>
              )}
            </Message>
          ))}
          {isThinking && <Shimmer className="text-sm">Thinking through your trip...</Shimmer>}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-border bg-background/70 p-3 sm:p-4">
        <PromptInput onSubmit={submit} className="rounded-lg border-border bg-card shadow-card">
          <PromptInputTextarea ref={textareaRef} placeholder="Ask Nila to plan your next trip..." className="min-h-[76px]" />
          <PromptInputFooter>
            <PromptInputTools><span className="px-1 text-xs text-muted-foreground">Enter to send · Shift + Enter for a new line</span></PromptInputTools>
            <PromptInputSubmit status={isThinking ? "submitted" : "ready"} disabled={isThinking} className="shrink-0 rounded-md" />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}

export default function PlannerWorkspace({ activeThreadId }: { activeThreadId?: string }) {
  const navigate = useNavigate();
  const history = usePlannerHistory();
  const activeThread = history.threads.find((thread) => thread.id === activeThreadId) ?? history.threads[0];

  useEffect(() => {
    if (!activeThread) return;
    if (!activeThreadId || activeThread.id !== activeThreadId) navigate(`/planner/${activeThread.id}`, { replace: true });
  }, [activeThread, activeThreadId, navigate]);

  if (!activeThread) return null;
  const destination = activeThread.destination;

  const createTrip = () => {
    const thread = history.createThread();
    navigate(`/planner/${thread.id}`);
  };

  const deleteTrip = (id: string) => {
    const nextId = history.deleteThread(id);
    if (id === activeThread.id) navigate(`/planner/${nextId}`, { replace: true });
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-glass">
      <div className="grid lg:grid-cols-[220px_minmax(0,1fr)_minmax(340px,0.92fr)]">
        <aside className="border-b border-border bg-muted/55 p-3 lg:border-b-0 lg:border-r">
          <div className="mb-3 flex items-center justify-between gap-2 px-1">
            <div><p className="font-display text-sm font-semibold text-foreground">Saved trips</p><p className="text-xs text-muted-foreground">Stored in this browser</p></div>
            <Button size="icon-sm" onClick={createTrip} aria-label="Create new trip"><Plus className="h-4 w-4" /></Button>
          </div>
          <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1 lg:max-h-[652px] lg:flex-col lg:overflow-y-auto">
            {history.threads.map((thread) => (
              <div key={thread.id} className={`group flex min-w-[190px] items-center gap-1 rounded-md border p-1 transition-colors lg:min-w-0 ${thread.id === activeThread.id ? "border-primary/35 bg-primary/10" : "border-transparent bg-card hover:border-border"}`}>
                <button type="button" onClick={() => navigate(`/planner/${thread.id}`)} className="min-w-0 flex-1 px-2 py-2 text-left">
                  <span className="block truncate text-sm font-medium text-foreground">{thread.title}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{thread.destination?.destination ?? "Start planning"} · {formatDate(thread.updatedAt)}</span>
                </button>
                <Button type="button" variant="ghost" size="icon-sm" onClick={() => deleteTrip(thread.id)} aria-label={`Delete ${thread.title}`} className="shrink-0 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            ))}
          </div>
        </aside>

        <PlannerChat key={activeThread.id} thread={activeThread} updateThread={history.updateThread} />

        <div className="flex min-h-[590px] flex-col gap-3 border-t border-border bg-muted/35 p-3 lg:h-[720px] lg:border-l lg:border-t-0">
          <div className="flex items-center justify-between gap-3 px-1">
            <div><p className="flex items-center gap-2 font-display text-sm font-semibold text-foreground"><MapPin className="h-4 w-4 text-accent" /> Live trip view</p><p className="text-xs text-muted-foreground">Updates as your plan develops</p></div>
          </div>
          <div className="min-h-0 flex-1"><DestinationMap destination={destination} /></div>
          <ItineraryCards destination={destination} />
        </div>
      </div>
    </div>
  );
}