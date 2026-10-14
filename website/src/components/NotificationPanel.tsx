import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Clock3,
  Calendar,
  PlaneTakeoff,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  MessageSquarePlus,
  Mail,
  CreditCard,
  Star,
  Trash2,
  Check,
  CheckCheck,
  ChevronRight,
  RefreshCw,
  Inbox,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNotifications, NotificationItem } from "@/contexts/NotificationContext";

interface NotificationPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const resolveWebsiteNotificationPath = (item: NotificationItem): string => {
  if (item.link) {
    if (
      item.link.startsWith("/dashboard") ||
      item.link.startsWith("/booking") ||
      item.link.startsWith("/contact") ||
      item.link.startsWith("/packages") ||
      item.link.startsWith("/blog") ||
      item.link.startsWith("/wishlist") ||
      item.link.startsWith("/services") ||
      item.link.startsWith("/about")
    ) {
      return item.link;
    }
    if (item.link.includes("booking")) return "/dashboard";
    if (item.link.includes("enquir") || item.link.includes("contact")) return "/contact";
    if (item.link.includes("testimonial") || item.link.includes("review") || item.link.includes("package")) return "/packages";
    if (item.link.includes("service")) return "/services";
  }
  const cat = (item.category || "").toLowerCase();
  if (cat.includes("booking")) return "/dashboard";
  if (cat.includes("enquiry") || cat.includes("contact")) return "/contact";
  if (cat.includes("review") || cat.includes("package") || cat.includes("promo") || cat.includes("fare") || cat.includes("featured")) return "/packages";
  if (cat.includes("service") || cat.includes("vendor")) return "/services";
  return "/dashboard";
};

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
  if (isNaN(date.getTime())) return fallback;
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
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    fetchNotifications,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, fetchNotifications]);

  const handleNotificationClick = async (item: NotificationItem) => {
    const notifId = item._id || item.id;
    await markAsRead(notifId);
    const targetPath = resolveWebsiteNotificationPath(item);
    onOpenChange(false);
    navigate(targetPath);
  };

  const displayedNotifications =
    activeTab === "unread"
      ? notifications.filter((item) => !item.isRead && item.unread !== false)
      : notifications;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg overflow-hidden rounded-3xl border border-border/80 bg-card p-0 shadow-2xl backdrop-blur-2xl text-foreground sm:max-w-xl">
        {/* Header Strip */}
        <div className="relative border-b border-border/60 bg-gradient-to-r from-slate-900 via-navy-dark to-slate-900 p-5 sm:p-6 text-white overflow-hidden">
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-accent/20 blur-2xl pointer-events-none" />
          <DialogHeader className="space-y-3 text-left relative z-10">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/15 border border-accent/30 text-accent shrink-0">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="font-display text-xl font-bold text-white tracking-tight">
                    Notifications
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-300 mt-0.5">
                    {unreadCount > 0
                      ? `${unreadCount} unread update${unreadCount > 1 ? "s" : ""} on bookings, deals & alerts`
                      : "You are all caught up"}
                  </DialogDescription>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => fetchNotifications()}
                  title="Refresh notifications"
                  className="h-8 w-8 rounded-full text-slate-300 hover:text-white hover:bg-white/10"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  activeTab === "all"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "bg-white/10 text-white/80 hover:bg-white/15"
                }`}
              >
                <span>All</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    activeTab === "all" ? "bg-slate-200 text-slate-900" : "bg-white/20 text-white"
                  }`}
                >
                  {notifications.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("unread")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  activeTab === "unread"
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "bg-white/10 text-white/80 hover:bg-white/15"
                }`}
              >
                <span>Unread</span>
                {unreadCount > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      activeTab === "unread" ? "bg-accent-foreground/20 text-accent-foreground" : "bg-accent text-accent-foreground"
                    }`}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </DialogHeader>
        </div>

        {/* Notifications List */}
        <div className="max-h-[58vh] space-y-2.5 overflow-y-auto p-4 sm:p-5">
          {loading && notifications.length === 0 ? (
            <div className="py-14 text-center space-y-2">
              <RefreshCw className="h-6 w-6 animate-spin text-accent mx-auto" />
              <p className="text-xs text-muted-foreground">Checking for new alerts...</p>
            </div>
          ) : displayedNotifications.length === 0 ? (
            <div className="py-14 text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground border border-border/40">
                {activeTab === "unread" ? (
                  <CheckCheck className="h-7 w-7 text-accent" />
                ) : (
                  <Inbox className="h-7 w-7" />
                )}
              </div>
              <div>
                <p className="font-display text-sm font-bold text-foreground">
                  {activeTab === "unread" ? "All Caught Up!" : "No Notifications"}
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                  {activeTab === "unread"
                    ? "You have read all current alerts and updates."
                    : "No new activity or announcements at the moment."}
                </p>
              </div>
            </div>
          ) : (
            displayedNotifications.map((item) => {
              const notifId = item._id || item.id;
              const isUnread = !item.isRead && item.unread !== false;
              const Icon = getCategoryIcon(item.category, item.type);
              const timeDisplay = formatTimeAgo(item.createdAt, item.time);
              const messageText = item.message || item.description || "";

              return (
                <div
                  key={String(notifId)}
                  onClick={() => handleNotificationClick(item)}
                  className={`group relative rounded-2xl border p-3.5 sm:p-4 transition-all duration-200 cursor-pointer ${
                    isUnread
                      ? "border-accent/40 bg-accent/5 hover:bg-accent/10 shadow-sm"
                      : "border-border/60 bg-muted/20 hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                        isUnread
                          ? "bg-accent/15 text-accent border border-accent/30 shadow-sm"
                          : "bg-muted text-muted-foreground border border-border/40"
                      }`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
                            {item.category || "System"}
                          </span>
                          {isUnread && (
                            <span className="inline-block h-2 w-2 rounded-full bg-accent ring-2 ring-accent/30 animate-pulse" />
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock3 className="h-3 w-3" />
                          <span>{timeDisplay}</span>
                        </div>
                      </div>

                      <div className="flex items-start justify-between gap-2">
                        <h4
                          className={`font-display text-xs sm:text-sm font-semibold leading-snug ${
                            isUnread ? "text-foreground font-bold" : "text-foreground/90"
                          }`}
                        >
                          {item.title}
                        </h4>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
                      </div>

                      {messageText && (
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                          {messageText}
                        </p>
                      )}

                      {/* Quick Item Actions */}
                      <div className="mt-2.5 flex items-center justify-end gap-2 pt-1 border-t border-border/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isUnread && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notifId);
                            }}
                            className="flex items-center gap-1 text-[11px] font-medium text-accent hover:underline"
                          >
                            <Check className="h-3 w-3" />
                            <span>Mark read</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notifId);
                          }}
                          title="Dismiss notification"
                          className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-destructive transition-colors ml-2"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Dismiss</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-border/60 bg-muted/40 p-3.5 sm:p-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={unreadCount === 0}
              onClick={() => markAllAsRead()}
              className="text-xs font-semibold gap-1.5 text-muted-foreground hover:text-foreground disabled:opacity-40"
            >
              <CheckCheck className="h-3.5 w-3.5 text-accent" />
              <span>Mark all read</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              disabled={notifications.length === 0}
              onClick={() => clearAll()}
              className="text-xs font-semibold gap-1.5 text-muted-foreground hover:text-destructive disabled:opacity-40"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear all</span>
            </Button>
          </div>

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
