import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ReelItem {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  caption?: string;
  reelUrl?: string;
  video?: string;
  isActive?: boolean;
  category?: string;
  duration?: string;
  views?: string;
  rating?: number;
  quality?: string;
  highlights?: string[];
  thumbnail?: string;
  createdAt?: string;
}

export interface ReelsState {
  reels: ReelItem[];
  loading: boolean;
  error: string | null;
}

const initialState: ReelsState = {
  reels: [],
  loading: false,
  error: null,
};

const reelsSlice = createSlice({
  name: "reels",
  initialState,
  reducers: {
    fetchReelsRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchReelsSuccess(state, action: PayloadAction<ReelItem[]>) {
      state.loading = false;
      state.reels = action.payload;
    },
    fetchReelsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchReelsRequest,
  fetchReelsSuccess,
  fetchReelsFailure,
} = reelsSlice.actions;

export default reelsSlice.reducer;
