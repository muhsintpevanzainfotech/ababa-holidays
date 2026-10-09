import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface HomeState {
  featuredPackages: any[];
  popularDestinations: any[];
  offerBanners: any[];
  testimonials: any[];
  loading: boolean;
  error: string | null;
}

const initialState: HomeState = {
  featuredPackages: [],
  popularDestinations: [],
  offerBanners: [],
  testimonials: [],
  loading: false,
  error: null,
};

const homeSlice = createSlice({
  name: "home",
  initialState,
  reducers: {
    fetchHomeDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchHomeDataSuccess(
      state,
      action: PayloadAction<{
        featuredPackages: any[];
        popularDestinations: any[];
        offerBanners: any[];
        testimonials: any[];
      }>
    ) {
      state.loading = false;
      state.featuredPackages = action.payload.featuredPackages;
      state.popularDestinations = action.payload.popularDestinations;
      state.offerBanners = action.payload.offerBanners;
      state.testimonials = action.payload.testimonials || [];
    },
    fetchHomeDataFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchHomeDataStart, fetchHomeDataSuccess, fetchHomeDataFailure } = homeSlice.actions;
export default homeSlice.reducer;
