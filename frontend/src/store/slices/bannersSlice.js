import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  banners: [],
  loading: false,
  error: null,
};

const bannersSlice = createSlice({
  name: 'banners',
  initialState,
  reducers: {
    fetchBannersRequest: (state, action) => {
      state.loading = true;
      state.error = null;
    },
    fetchBannersSuccess: (state, action) => {
      state.loading = false;
      state.banners = action.payload;
    },
    fetchBannersFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addBannerRequest: (state) => {
      state.loading = true;
    },
    addBannerSuccess: (state, action) => {
      state.loading = false;
      state.banners = [action.payload, ...state.banners];
    },
    addBannerFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateBannerRequest: (state) => {
      state.loading = true;
    },
    updateBannerSuccess: (state, action) => {
      state.loading = false;
      state.banners = state.banners.map(b => 
        b._id === action.payload._id ? action.payload : b
      );
    },
    updateBannerFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteBannerRequest: (state) => {
      state.loading = true;
    },
    deleteBannerSuccess: (state, action) => {
      state.loading = false;
      state.banners = state.banners.filter(b => b._id !== action.payload);
    },
    deleteBannerFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    toggleBannerStatusRequest: (state) => {
      state.loading = true;
    },
    toggleBannerStatusSuccess: (state, action) => {
      state.loading = false;
      state.banners = state.banners.map(b => 
        b._id === action.payload._id ? action.payload : b
      );
    },
    toggleBannerStatusFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

export const { 
  fetchBannersRequest, fetchBannersSuccess, fetchBannersFailure,
  addBannerRequest, addBannerSuccess, addBannerFailure,
  updateBannerRequest, updateBannerSuccess, updateBannerFailure,
  deleteBannerRequest, deleteBannerSuccess, deleteBannerFailure,
  toggleBannerStatusRequest, toggleBannerStatusSuccess, toggleBannerStatusFailure
} = bannersSlice.actions;

export default bannersSlice.reducer;
