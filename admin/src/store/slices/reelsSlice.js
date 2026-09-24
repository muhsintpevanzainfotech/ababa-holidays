import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  reels: [],
  loading: false,
  error: null
};

const reelsSlice = createSlice({
  name: 'reels',
  initialState,
  reducers: {
    fetchReelsRequest: (state) => {
      state.loading = true;
    },
    fetchReelsSuccess: (state, action) => {
      state.loading = false;
      state.reels = action.payload;
    },
    fetchReelsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addReelRequest: (state) => {
      state.loading = true;
    },
    addReelSuccess: (state, action) => {
      state.loading = false;
      state.reels.unshift(action.payload);
    },
    addReelFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateReelRequest: (state) => {
      state.loading = true;
    },
    updateReelSuccess: (state, action) => {
      state.loading = false;
      state.reels = state.reels.map(reel => 
        reel._id === action.payload._id ? action.payload : reel
      );
    },
    updateReelFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteReelRequest: (state) => {
      state.loading = true;
    },
    deleteReelSuccess: (state, action) => {
      state.loading = false;
      state.reels = state.reels.filter(reel => reel._id !== action.payload);
    },
    deleteReelFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    toggleReelStatusRequest: (state) => {
      state.loading = true;
    },
    toggleReelStatusSuccess: (state, action) => {
      state.loading = false;
      state.reels = state.reels.map(reel => 
        reel._id === action.payload._id ? action.payload : reel
      );
    }
  }
});

export const {
  fetchReelsRequest,
  fetchReelsSuccess,
  fetchReelsFailure,
  addReelRequest,
  addReelSuccess,
  addReelFailure,
  updateReelRequest,
  updateReelSuccess,
  updateReelFailure,
  deleteReelRequest,
  deleteReelSuccess,
  deleteReelFailure,
  toggleReelStatusRequest,
  toggleReelStatusSuccess
} = reelsSlice.actions;

export default reelsSlice.reducer;
