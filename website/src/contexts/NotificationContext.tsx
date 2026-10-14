import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import axiosInstance from "@/api/axiosInstance";

export interface NotificationItem {
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

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id?: string | number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id?: string | number) => Promise<void>;
  clearAll: () => Promise<void>;
}

const defaultPromotions: NotificationItem[] = [
  {
    id: "promo-1",
    title: "Kerala Monsoon Offer Unlocked",
    message: "Save up to 18% on Munnar, Wayanad, and Alleppey departures this week.",
    time: "Just now",
    createdAt: new Date().toISOString(),
    isRead: false,
    category: "Promo",
    type: "success",
    link: "/packages",
  },
  {
    id: "promo-2",
    title: "Flight Fare Price Drop",
    message: "Kochi to Dubai non-stop flights dropped for selected travel dates.",
    time: "1 hour ago",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    isRead: false,
    category: "Fare Alert",
    type: "info",
    link: "/packages",
  },
  {
    id: "promo-3",
    title: "Verified Travel Partners Added",
    message: "Discover handpicked houseboats and certified tourist buses across Kerala.",
    time: "Today",
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    isRead: false,
    category: "Featured",
    type: "info",
    link: "/services",
  },
];

const LOCAL_STORAGE_READ_KEY = "ababa_read_notification_ids";
const LOCAL_STORAGE_CLEARED_AT_KEY = "ababa_cleared_notifications_at";
const LOCAL_STORAGE_DELETED_KEY = "ababa_deleted_notification_ids";

const getReadIdsFromStorage = (): Set<string> => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_READ_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr.map(String));
    }
  } catch {
    // ignore
  }
  return new Set();
};

const getDeletedIdsFromStorage = (): Set<string> => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_DELETED_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr.map(String));
    }
  } catch {
    // ignore
  }
  return new Set();
};

const saveReadIdToStorage = (id: string | number) => {
  try {
    const set = getReadIdsFromStorage();
    set.add(String(id));
    localStorage.setItem(LOCAL_STORAGE_READ_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // ignore
  }
};

const saveAllReadIdsToStorage = (ids: (string | number)[]) => {
  try {
    const set = getReadIdsFromStorage();
    ids.forEach((id) => set.add(String(id)));
    localStorage.setItem(LOCAL_STORAGE_READ_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // ignore
  }
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const readSet = getReadIdsFromStorage();
      const deletedSet = getDeletedIdsFromStorage();
      const clearedAt = Number(localStorage.getItem(LOCAL_STORAGE_CLEARED_AT_KEY) || 0);

      const res = await axiosInstance.get("/notifications");
      const list = res.data?.data || res.data || [];

      let rawItems: any[] = [];
      if (Array.isArray(list) && list.length > 0) {
        rawItems = list;
      } else if (clearedAt === 0) {
        // Fallback to initial system promotions if database has none and user hasn't cleared
        rawItems = defaultPromotions;
      }

      // Filter deleted items, cleared-before items, and non-customer notifications
      let validItems = rawItems.filter((item: any) => {
        const notifId = String(item._id || item.id || "");
        if (deletedSet.has(notifId)) return false;
        if (clearedAt > 0 && item.createdAt) {
          const itemTime = new Date(item.createdAt).getTime();
          if (itemTime <= clearedAt) return false;
        }
        // Exclude admin/vendor internal notifications on public website
        const role = String(item.recipientRole || "").trim().toLowerCase();
        if (role === "admin" || role === "sub-admin" || role === "vendor" || role === "vendor-staff" || role === "staff") {
          return false;
        }
        return true;
      });

      // If no customer items and user hasn't cleared, fallback to default promotions
      if (validItems.length === 0 && clearedAt === 0) {
        validItems = defaultPromotions.filter((p) => !deletedSet.has(String(p.id)));
      }

      const merged: NotificationItem[] = validItems.map((item: any) => {
        const notifId = String(item._id || item.id || "");
        const isMarkedRead = item.isRead || readSet.has(notifId);
        return {
          ...item,
          id: notifId,
          isRead: isMarkedRead,
          unread: !isMarkedRead,
        };
      });

      setNotifications(merged);
    } catch {
      // Offline fallback
      const readSet = getReadIdsFromStorage();
      const deletedSet = getDeletedIdsFromStorage();
      const clearedAt = Number(localStorage.getItem(LOCAL_STORAGE_CLEARED_AT_KEY) || 0);

      if (clearedAt === 0) {
        const validPromos = defaultPromotions.filter((p) => !deletedSet.has(String(p.id)));
        setNotifications(
          validPromos.map((p) => {
            const isMarkedRead = readSet.has(String(p.id));
            return { ...p, isRead: isMarkedRead, unread: !isMarkedRead };
          })
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Auto refresh periodically every 60 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 60000);

    // Refresh when user returns to window tab
    const handleFocus = () => {
      fetchNotifications();
    };
    window.addEventListener("focus", handleFocus);

    // Sync across tabs
    const handleStorage = (e: StorageEvent) => {
      if (
        e.key === LOCAL_STORAGE_READ_KEY ||
        e.key === LOCAL_STORAGE_CLEARED_AT_KEY ||
        e.key === LOCAL_STORAGE_DELETED_KEY
      ) {
        fetchNotifications();
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleStorage);
    };
  }, [fetchNotifications]);

  const markAsRead = async (id?: string | number) => {
    if (!id) return;
    const strId = String(id);
    saveReadIdToStorage(strId);

    try {
      await axiosInstance.put(`/notifications/${strId}/read`);
    } catch {
      // Handled gracefully in offline or guest mode
    }

    setNotifications((prev) =>
      prev.map((item) => {
        const itemId = String(item._id || item.id);
        if (itemId === strId) {
          return { ...item, isRead: true, unread: false };
        }
        return item;
      })
    );
  };

  const markAllAsRead = async () => {
    const allIds = notifications.map((n) => n._id || n.id).filter(Boolean) as (string | number)[];
    saveAllReadIdsToStorage(allIds);

    try {
      await axiosInstance.put("/notifications/mark-all-read");
    } catch {
      // Handled gracefully
    }

    setNotifications((prev) =>
      prev.map((item) => ({ ...item, isRead: true, unread: false }))
    );
  };

  const deleteNotification = async (id?: string | number) => {
    if (!id) return;
    const strId = String(id);
    try {
      const deleted = getDeletedIdsFromStorage();
      deleted.add(strId);
      localStorage.setItem(LOCAL_STORAGE_DELETED_KEY, JSON.stringify(Array.from(deleted)));
    } catch {
      // ignore
    }

    setNotifications((prev) => prev.filter((item) => String(item._id || item.id) !== strId));
  };

  const clearAll = async () => {
    try {
      await axiosInstance.delete("/notifications");
    } catch {
      // Handled gracefully
    }
    localStorage.setItem(LOCAL_STORAGE_CLEARED_AT_KEY, Date.now().toString());
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.isRead && n.unread !== false).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
};

export default NotificationContext;
