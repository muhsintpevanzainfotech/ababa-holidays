import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface WishlistState {
  items: string[];
  loading: boolean;
  error: string | null;
}

const initialItems: string[] = JSON.parse(localStorage.getItem("ababa_wishlist") || "[]");

const initialState: WishlistState = {
  items: initialItems,
  loading: false,
  error: null,
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    toggleWishlistItem(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (state.items.includes(id)) {
        state.items = state.items.filter((item) => item !== id);
      } else {
        state.items.push(id);
      }
      localStorage.setItem("ababa_wishlist", JSON.stringify(state.items));
    },
    fetchWishlistStart(state) {
      state.loading = true;
    },
    fetchWishlistSuccess(state, action: PayloadAction<string[]>) {
      state.loading = false;
      state.items = action.payload;
      localStorage.setItem("ababa_wishlist", JSON.stringify(state.items));
    },
    fetchWishlistFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { toggleWishlistItem, fetchWishlistStart, fetchWishlistSuccess, fetchWishlistFailure } = wishlistSlice.actions;
export default wishlistSlice.reducer;
