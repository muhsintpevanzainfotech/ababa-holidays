import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Clock3,
  Gift,
  PlaneTakeoff,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  MessageSquarePlus,
  Mail,
  Calendar,
  CreditCard,
  Star,
  Trash2,
  Check,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import axiosInstance from "@/api/axiosInstance";

interface NotificationPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface NotificationItem {
  _id?: string;
  id?: string | number;
  title: string;
  message?: string;
  description?: string;
  category?: string;
  type?: "info" | "success" | "warning" | "error";
  isRead?: boolean;
  unread?: boolean;
  createdAt?: string;
  time?: string;
  link?: string;
}

const resolveWebsiteNotificationPath = (item: NotificationItem): string => {
  if (item.link) {
    if (
      item.link.startsWith("/dashboard") ||
      item.link.startsWith("/booking") ||
      item.link.startsWith("/contact") ||
      item.link.startsWith("/packages") ||
      item.link.startsWith("/blog") ||
      item.link.startsWith("/wishlist")
    ) {
      return item.link;
    }
    if (item.link.includes("booking")) return "/dashboard";
    if (item.link.includes("enquir") || item.link.includes("contact")) return "/contact";
    if (item.link.includes("testimonial") || item.link.includes("review") || item.link.includes("package")) return "/packages";
  }
  const cat = (item.category || "").toLowerCase();
  if (cat.includes("booking")) return "/dashboard";
  if (cat.includes("enquiry") || cat.includes("contact")) return "/contact";
  if (cat.includes("review") || cat.includes("package") || cat.includes("promo") || cat.includes("fare") || cat.includes("featured")) return "/packages";
  return "/dashboard";
};

const defaultMockNotifications: NotificationItem[] = [
  {
    id: "m1",
    title: "Kerala Monsoon Offer Unlocked",
    description: "Save up to 18% on Munnar, Wayanad, and Alleppey departures this week.",
    time: "2 min ago",
    unread: true,
    category: "Promo",
    type: "success",
  },
  {
    id: "m2",
    title: "Flight Fare Price Drop",
    description: "Kochi to Dubai non-stop flights dropped for selected travel dates.",
    time: "1 hour ago",
    unread: true,
    category: "Fare Alert",
    type: "info",
  },
  {
    id: "m3",
    title: "UAE Visa Guidelines Updated",
    description: "Simplified 48-hour expedited visa processing is now active for Kerala travelers.",
    time: "Today",
    unread: false,
    category: "Visa Update",
    type: "info",
  },
  {
    id: "m4",
    title: "Top-Rated Packages Refreshed",
    description: "Check out our newest verified luxury resort and backwater tour itineraries.",
    time: "Yesterday",
    unread: false,
    category: "Featured",
    type: "info",
  },
];

const getCategoryIcon = (category?: string, type?: string) => {
  const cat = (category || "").toLowerCase();
  if (cat.includes("booking")) return Calendar;
  if (cat.includes("enquiry")) return MessageSquarePlus;
  if (cat.includes("contact")) return Mail;
  if (cat.includes("request") || cat.includes("complaint")) return AlertTriangle;
  if (cat.includes("review")) return Star;
  if (cat.includes("payment")) return CreditCard;
  if (cat.includes("fare") || cat.includes("flight")) return PlaneTakeoff;
  if (cat.includes("visa")) return ShieldCheck;
  if (type === "success") return CheckCircle2;
  return Sparkles;
};

const formatTimeAgo = (dateStr?: string, fallback = "Recently") => {
  if (!dateStr) return fallback;
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const NotificationPanel = ({ open, onOpenChange }: NotificationPanelProps) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(defaultMockNotifications);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/notifications");
      const list = res.data?.data || res.data || [];
      if (Array.isArray(list) && list.length > 0) {
        setNotifications(list);
      }
    } catch {
      // Fallback to initial mock if unauthenticated or offline
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axiosInstance.put("/notifications/mark-all-read");
    } catch {
      // ignore
    }
    setNotifications((prev) =>
      prev.map((item) => ({ ...item, isRead: true, unread: false }))
    );
  };

  const markSingleAsRead = async (id?: string | number) => {
    if (!id) return;
    try {
      await axiosInstance.put(`/notifications/${id}/read`);
    } catch {
      // ignore
    }
    setNotifications((prev) =>
      prev.map((item) => ((item._id === id || item.id === id) ? { ...item, isRead: true, unread: false } : item))
    );
  };

  const handleNotificationClick = async (item: NotificationItem) => {
    const notifId = item._id || item.id;
    await markSingleAsRead(notifId);
    const targetPath = resolveWebsiteNotificationPath(item);
    onOpenChange(false);
    navigate(targetPath);
  };

  const unreadCount = notifications.filter((item) => !item.isRead && item.unread !== false).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg overflow-hidden rounded-3xl border border-border/80 bg-card p-0 shadow-2xl backdrop-blur-2xl text-foreground">
        {/* Header Strip */}
        <div className="relative border-b border-border/60 bg-gradient-to-r from-slate-900 via-navy-dark to-slate-900 p-6 text-white overflow-hidden">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent/20 blur-2xl" />
          <DialogHeader className="space-y-2 text-left relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/15 border border-accent/30 text-accent">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="font-display text-xl font-bold text-white tracking-tight">
                    System Notifications
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-300">
                    {unreadCount > 0
                      ? `${unreadCount} new alerts on bookings, enquiries & updates`
                      : "All notifications are up to date"}
                  </DialogDescription>
                </div>
              </div>
              {unreadCount > 0 && (
                <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-accent-foreground shadow-sm">
                  {unreadCount} New
                </span>
              )}
            </div>
          </DialogHeader>
        </div>

        {/* Notifications List */}
        <div className="max-h-[60vh] space-y-2.5 overflow-y-auto p-4 sm:p-5">
          {loading ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              Loading alerts...
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Bell className="h-8 w-8 text-muted-foreground/40 mx-auto" />
              <p className="font-display text-sm font-bold text-foreground">No Notifications</p>
              <p className="text-xs text-muted-foreground">Your alert history is clear.</p>
            </div>
          ) : (
            notifications.map((item) => {
              const notifId = item._id || item.id;
              const isUnread = !item.isRead && item.unread !== false;
              const Icon = getCategoryIcon(item.category, item.type);
              const timeDisplay = formatTimeAgo(item.createdAt, item.time);
              const messageText = item.message || item.description || "";

              return (
                <div
                  key={notifId}
                  onClick={() => handleNotificationClick(item)}
                  className={`group relative rounded-2xl border p-3.5 transition-all duration-200 cursor-pointer hover:shadow-md ${
                    isUnread
                      ? "border-accent/40 bg-accent/5 hover:bg-accent/10"
                      : "border-border/60 bg-muted/20 hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                        isUnread
                          ? "bg-accent/15 text-accent border border-accent/30 shadow-sm"
                          : "bg-muted text-muted-foreground border border-border/40"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-1 mb-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
                          {item.category || "System"}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock3 className="h-3 w-3" />
                          <span>{timeDisplay}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-display text-xs sm:text-sm font-semibold text-foreground leading-snug">
                          {item.title}
                        </h4>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </div>
                      {messageText && (
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                          {messageText}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-border/60 bg-muted/40 p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="text-xs font-semibold gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Mark all read</span>
          </Button>

          <Button
            size="sm"
            onClick={() => onOpenChange(false)}
            className="rounded-full border-0 bg-accent text-accent-foreground hover:bg-accent/90 text-xs font-semibold px-4"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationPanel;
