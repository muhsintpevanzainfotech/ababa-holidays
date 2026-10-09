import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AboutState {
  aboutData: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: AboutState = {
  aboutData: null,
  loading: false,
  error: null,
};

const aboutSlice = createSlice({
  name: "about",
  initialState,
  reducers: {
    fetchAboutStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchAboutSuccess(state, action: PayloadAction<any>) {
      state.loading = false;
      state.aboutData = action.payload;
    },
    fetchAboutFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchAboutStart, fetchAboutSuccess, fetchAboutFailure } = aboutSlice.actions;
export default aboutSlice.reducer;
