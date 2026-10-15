import { useCallback, useState } from "react";
import type { UIMessage } from "ai";

export interface RouteStop {
  id: string;
  name: string;
  dayNumber: number;
  description: string;
  latitude: number;
  longitude: number;
  driveFromPrev?: string;
  distanceKm?: number;
  activities: string[];
  recommendedStay?: string;
  stayPricePerNight?: number;
}

export interface MatchedPackage {
  id: string;
  title: string;
  duration: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  image: string;
  rating: number;
  reviewsCount?: number;
  location: string;
  badge?: string;
  highlights: string[];
  inclusions: string[];
}

export interface ItineraryDayPlan {
  day: number;
  title: string;
  location: string;
  morning: string;
  afternoon: string;
  evening: string;
  stay: string;
  highlights: string[];
  travelTip: string;
  estimatedCost: number;
}

export interface PlannerDestination {
  destination: string;
  country: string;
  latitude: number;
  longitude: number;
  highlights: string[];
  durationDays?: number;
  travelStyle?: string;
  budgetTier?: "Budget" | "Standard" | "Luxury";
  totalEstimatedPrice?: number;
  priceBreakdown?: {
    stay: number;
    transport: number;
    activities: number;
    meals: number;
    total: number;
  };
  stops: RouteStop[];
  daysPlan?: ItineraryDayPlan[];
  matchedPackages?: MatchedPackage[];
}

export type PlannerThread = {
  id: string;
  title: string;
  updatedAt: number;
  messages: UIMessage[];
  destination?: PlannerDestination;
};

const STORAGE_KEY = "global-travel-hub-planner-threads";

export const defaultKeralaDestination: PlannerDestination = {
  destination: "Kerala",
  country: "India",
  latitude: 10.1632,
  longitude: 76.6413,
  durationDays: 4,
  travelStyle: "Scenic & Leisure",
  budgetTier: "Standard",
  totalEstimatedPrice: 15499,
  highlights: ["Fort Kochi Heritage", "Munnar Tea Hills", "Thekkady Spice Trails", "Alleppey Houseboat"],
  priceBreakdown: {
    stay: 7200,
    transport: 4800,
    activities: 2100,
    meals: 1399,
    total: 15499,
  },
  stops: [
    {
      id: "stop-1",
      name: "Fort Kochi",
      dayNumber: 1,
      description: "Historic colonial quarter, Chinese fishing nets & sunset harbor promenade.",
      latitude: 9.9656,
      longitude: 76.2421,
      driveFromPrev: "Starting Point (Cochin Airport / Railway)",
      distanceKm: 0,
      activities: ["Chinese Fishing Nets", "St. Francis Church", "Jew Town & Mattancherry", "Kathakali Performance"],
      recommendedStay: "Heritage Boutique Resort, Fort Kochi",
      stayPricePerNight: 2800,
    },
    {
      id: "stop-2",
      name: "Munnar",
      dayNumber: 2,
      description: "Rolling mist-clad tea plantations, cascading waterfalls, and cool mountain air.",
      latitude: 10.0889,
      longitude: 77.0595,
      driveFromPrev: "128 km · ~3.5 hrs scenic hill drive",
      distanceKm: 128,
      activities: ["Cheeyappara Waterfalls", "Tata Tea Museum", "Eravikulam National Park (Nilgiri Tahr)", "Mattupetty Dam"],
      recommendedStay: "Hillside Tea Valley Resort, Munnar",
      stayPricePerNight: 3200,
    },
    {
      id: "stop-3",
      name: "Thekkady",
      dayNumber: 3,
      description: "Periyar tiger reserve, aromatic cardamom & pepper plantations, and bamboo rafting.",
      latitude: 9.6031,
      longitude: 77.1612,
      driveFromPrev: "91 km · ~2.5 hrs spice trail drive",
      distanceKm: 91,
      activities: ["Periyar Lake Boat Safari", "Organic Spice Garden Walk", "Martial Arts (Kalaripayattu) Show", "Elephant Camp"],
      recommendedStay: "Jungle Mist Eco Lodge, Thekkady",
      stayPricePerNight: 2900,
    },
    {
      id: "stop-4",
      name: "Alleppey",
      dayNumber: 4,
      description: "Iconic tranquil backwaters, traditional luxury houseboat stay, and village canals.",
      latitude: 9.4981,
      longitude: 76.3388,
      driveFromPrev: "138 km · ~3.5 hrs coastal drive",
      distanceKm: 138,
      activities: ["Private Houseboat Cruise", "Vembanad Lake Sunset", "Traditional Kerala Sadya Feast", "Alappuzha Lighthouse"],
      recommendedStay: "Air-Conditioned Premium Houseboat / Lagoon Resort",
      stayPricePerNight: 4500,
    },
  ],
  daysPlan: [
    {
      day: 1,
      title: "Colonial Charm & Spice Trade History",
      location: "Fort Kochi",
      morning: "Pickup from Cochin International Airport, check-in to boutique hotel, and walk down historic Princess Street.",
      afternoon: "Visit the iconic 14th-century Chinese Fishing Nets, Mattancherry Dutch Palace, and Jew Town antique markets.",
      evening: "Catch sunset over the Arabian Sea, followed by a live classical Kathakali & Kalaripayattu dance performance.",
      stay: "Heritage Boutique Resort, Fort Kochi",
      highlights: ["Chinese Fishing Nets", "Jew Town & Synagogue", "Kathakali Cultural Show"],
      travelTip: "Try authentic Malabar fish curry and freshly roasted tender coconut water near the pier.",
      estimatedCost: 3500,
    },
    {
      day: 2,
      title: "Climbing into the Mist & Tea Gardens",
      location: "Munnar",
      morning: "Scenic drive ascending through mountain ghats with photo stops at Cheeyappara and Valara waterfalls.",
      afternoon: "Tour the sprawling KDHP Tea Museum and explore Eravikulam National Park to spot the rare Nilgiri Tahr mountain goat.",
      evening: "Stroll through Munnar flower gardens, sample fresh mountain chocolates, and enjoy sunset at Mattupetty Dam.",
      stay: "Hillside Tea Valley Resort, Munnar",
      highlights: ["Cheeyappara Falls", "Tea Estate Safari", "Eravikulam National Park"],
      travelTip: "Carry light woolens as evenings drop down to 14°C throughout the year.",
      estimatedCost: 3800,
    },
    {
      day: 3,
      title: "Wild Aromas & Periyar Sanctuary",
      location: "Thekkady",
      morning: "Drive through the Cardamom Hills to Thekkady; check in and take a guided walk inside certified spice estates.",
      afternoon: "Embark on the Periyar Tiger Reserve lake safari boat ride to watch wild elephants, bisons, and bird colonies.",
      evening: "Experience an electrifying traditional Kalaripayattu ancient martial arts demonstration and tribal herbal massage.",
      stay: "Jungle Mist Eco Lodge, Thekkady",
      highlights: ["Periyar Boat Safari", "Spice Plantation Tasting", "Kalaripayattu Show"],
      travelTip: "Buy authentic green cardamom, vanilla beans, and clove oil directly from cooperative spice outlets.",
      estimatedCost: 3600,
    },
    {
      day: 4,
      title: "The Venice of the East & Houseboat Sunset",
      location: "Alleppey",
      morning: "Descend to the coastal backwaters of Alleppey and board your private luxury Kettuvallam (traditional houseboat).",
      afternoon: "Cruise gently along Vembanad Lake, gliding past lush paddy fields, duck farms, and rural canal hamlets with freshly cooked Karimeen lunch.",
      evening: "Anchor at tranquil backwaters for sunset, savor hot banana fritters and tea, followed by dinner under starlit skies.",
      stay: "Air-Conditioned Premium Houseboat",
      highlights: ["Private Houseboat Cruise", "Authentic Karimeen Pollichathu", "Backwater Sunset"],
      travelTip: "Check in to the houseboat by 12:30 PM to make the most of daytime cruising hours.",
      estimatedCost: 4599,
    },
  ],
  matchedPackages: [
    {
      id: "pkg-kerala-classic",
      title: "4D/3N Classic Kerala Backwaters & Tea Mist Tour",
      duration: "4 Days / 3 Nights",
      price: 14999,
      originalPrice: 19999,
      discountPercent: 25,
      image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
      rating: 4.9,
      reviewsCount: 38,
      location: "Kochi · Munnar · Alleppey",
      badge: "Best Seller",
      highlights: ["Private AC Houseboat Stay", "Hill Resort Stay in Munnar", "Daily Breakfast & Houseboat All Meals", "Private AC Sedan Transfer"],
      inclusions: ["3 Nights Hotel & Houseboat", "Airport Transfers & Sightseeing", "All Entry & Toll Permits", "24/7 Helpline"],
    },
    {
      id: "pkg-munnar-thekkady",
      title: "5D/4N Hills, Wildlife & Spice Haven Circuit",
      duration: "5 Days / 4 Nights",
      price: 18499,
      originalPrice: 24500,
      discountPercent: 24,
      image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80",
      rating: 4.8,
      reviewsCount: 26,
      location: "Munnar · Thekkady · Kochi",
      badge: "Verified Partner",
      highlights: ["Periyar Boat Safari Tickets", "Jeep Safari in Tea Hills", "Spice Plantation Tour", "Kathakali & Martial Arts Show"],
      inclusions: ["4-Star Resorts Stay", "Daily Breakfast", "Private Innova Transfer", "Tour Guide Assistance"],
    },
    {
      id: "pkg-luxury-backwater",
      title: "3D/2N Royal Houseboat & Marari Beach Haven",
      duration: "3 Days / 2 Nights",
      price: 12499,
      originalPrice: 16999,
      discountPercent: 26,
      image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
      rating: 4.9,
      reviewsCount: 42,
      location: "Alleppey · Marari Beach",
      badge: "Luxury Exclusive",
      highlights: ["Luxury Glass Houseboat Suite", "Sunset Candlelight Dinner", "Village Canoe Safari", "Beachside Seafood Grill"],
      inclusions: ["Full-Board Houseboat Meals", "Pickup & Drop", "Evening Shikara Ride", "Taxes & Service Fees"],
    },
  ],
};

const newThread = (): PlannerThread => ({
  id: crypto.randomUUID(),
  title: "Classic Kerala Circuit (4 Days)",
  updatedAt: Date.now(),
  messages: [],
  destination: defaultKeralaDestination,
});

function loadThreads(): PlannerThread[] {
  if (typeof window === "undefined") return [newThread()];
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]") as PlannerThread[];
    if (Array.isArray(saved) && saved.length > 0) return saved;
  } catch {
    /* start fresh when storage is invalid */
  }
  const initial = [newThread()];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

export function usePlannerHistory() {
  const [threads, setThreads] = useState<PlannerThread[]>(loadThreads);

  const persist = useCallback((updater: (current: PlannerThread[]) => PlannerThread[]) => {
    setThreads((current) => {
      const next = updater(current);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const createThread = useCallback(() => {
    const thread = newThread();
    persist((current) => [thread, ...current]);
    return thread;
  }, [persist]);

  const updateThread = useCallback((id: string, patch: Partial<Omit<PlannerThread, "id">>) => {
    persist((current) =>
      current
        .map((thread) => (thread.id === id ? { ...thread, ...patch, updatedAt: Date.now() } : thread))
        .sort((a, b) => b.updatedAt - a.updatedAt)
    );
  }, [persist]);

  const deleteThread = useCallback((id: string) => {
    let nextId = "";
    persist((current) => {
      const remaining = current.filter((thread) => thread.id !== id);
      if (remaining.length > 0) {
        nextId = remaining[0].id;
        return remaining;
      }
      const replacement = newThread();
      nextId = replacement.id;
      return [replacement];
    });
    return nextId;
  }, [persist]);

  return { threads, createThread, updateThread, deleteThread };
}
