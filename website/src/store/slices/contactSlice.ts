import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ContactState {
  submitting: boolean;
  submitted: boolean;
  successMessage: string | null;
  error: string | null;
}

const initialState: ContactState = {
  submitting: false,
  submitted: false,
  successMessage: null,
  error: null,
};

const contactSlice = createSlice({
  name: "contact",
  initialState,
  reducers: {
    submitContactStart(state, _action: PayloadAction<Record<string, unknown>>) {
      state.submitting = true;
      state.submitted = false;
      state.error = null;
    },
    submitContactSuccess(state, action: PayloadAction<string>) {
      state.submitting = false;
      state.submitted = true;
      state.successMessage = action.payload;
    },
    submitContactFailure(state, action: PayloadAction<string>) {
      state.submitting = false;
      state.error = action.payload;
    },
    resetContactState(state) {
      state.submitting = false;
      state.submitted = false;
      state.successMessage = null;
      state.error = null;
    },
  },
});

export const {
  submitContactStart,
  submitContactSuccess,
  submitContactFailure,
  resetContactState,
} = contactSlice.actions;

export default contactSlice.reducer;
