import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SearchState {
  searchResults: any[];
  query: string;
  plannerStatus: {
    submitting: boolean;
    submitted: boolean;
    message: string | null;
  };
  loading: boolean;
  error: string | null;
}

const initialState: SearchState = {
  searchResults: [],
  query: "",
  plannerStatus: {
    submitting: false,
    submitted: false,
    message: null,
  },
  loading: false,
  error: null,
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    performSearchStart(state, action: PayloadAction<string>) {
      state.loading = true;
      state.query = action.payload;
      state.error = null;
    },
    performSearchSuccess(state, action: PayloadAction<any[]>) {
      state.loading = false;
      state.searchResults = action.payload;
    },
    performSearchFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    submitPlannerStart(state, _action: PayloadAction<Record<string, unknown>>) {
      state.plannerStatus.submitting = true;
      state.plannerStatus.submitted = false;
      state.error = null;
    },
    submitPlannerSuccess(state, action: PayloadAction<string>) {
      state.plannerStatus.submitting = false;
      state.plannerStatus.submitted = true;
      state.plannerStatus.message = action.payload;
    },
    submitPlannerFailure(state, action: PayloadAction<string>) {
      state.plannerStatus.submitting = false;
      state.error = action.payload;
    },
    resetPlannerStatus(state) {
      state.plannerStatus.submitting = false;
      state.plannerStatus.submitted = false;
      state.plannerStatus.message = null;
      state.error = null;
    },
  },
});

export const {
  performSearchStart,
  performSearchSuccess,
  performSearchFailure,
  submitPlannerStart,
  submitPlannerSuccess,
  submitPlannerFailure,
  resetPlannerStatus,
} = searchSlice.actions;

export default searchSlice.reducer;
