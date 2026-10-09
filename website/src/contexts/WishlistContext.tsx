import { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "sonner";

interface WishlistItem {
  id: string;
  title: string;
  image: string;
  price: number;
  location: string;
  originalPrice?: number;
  duration?: string;
  rating?: number;
  category?: string;
  featured?: boolean;
}

interface WishlistContextType {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  toggleItem: (item: WishlistItem) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);

  const addItem = (item: WishlistItem) => {
    setItems((prev) => [...prev, item]);
    toast.success(`${item.title} added to wishlist`);
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) toast.info(`${item.title} removed from wishlist`);
      return prev.filter((i) => i.id !== id);
    });
  };

  const isInWishlist = (id: string) => items.some((i) => i.id === id);

  const toggleItem = (item: WishlistItem) => {
    if (isInWishlist(item.id)) {
      removeItem(item.id);
    } else {
      addItem(item);
    }
  };

  return (
    <WishlistContext.Provider value={{ items, addItem, removeItem, isInWishlist, toggleItem }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
};
