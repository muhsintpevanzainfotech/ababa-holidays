import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface BookingState {
  currentBooking: any | null;
  userBookings: any[];
  bookingId: string | null;
  loading: boolean;
  submitting: boolean;
  success: boolean;
  error: string | null;
}

const initialState: BookingState = {
  currentBooking: null,
  userBookings: [],
  bookingId: null,
  loading: false,
  submitting: false,
  success: false,
  error: null,
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    createBookingStart(state, _action: PayloadAction<Record<string, unknown>>) {
      state.submitting = true;
      state.success = false;
      state.error = null;
    },
    createBookingSuccess(state, action: PayloadAction<{ bookingId: string; message: string }>) {
      state.submitting = false;
      state.success = true;
      state.bookingId = action.payload.bookingId;
    },
    createBookingFailure(state, action: PayloadAction<string>) {
      state.submitting = false;
      state.error = action.payload;
    },
    fetchUserBookingsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchUserBookingsSuccess(state, action: PayloadAction<any[]>) {
      state.loading = false;
      state.userBookings = action.payload;
    },
    fetchUserBookingsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    resetBookingState(state) {
      state.submitting = false;
      state.success = false;
      state.bookingId = null;
      state.error = null;
    },
  },
});

export const {
  createBookingStart,
  createBookingSuccess,
  createBookingFailure,
  fetchUserBookingsStart,
  fetchUserBookingsSuccess,
  fetchUserBookingsFailure,
  resetBookingState,
} = bookingSlice.actions;

export default bookingSlice.reducer;
