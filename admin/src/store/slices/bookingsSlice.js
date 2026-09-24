import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  bookings: [],
  loading: false,
  error: null,
};

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    fetchBookingsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchBookingsSuccess: (state, action) => {
      state.loading = false;
      state.bookings = action.payload;
    },
    fetchBookingsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateBookingStatusRequest: (state) => {
      state.loading = true;
    },
    updateBookingStatusSuccess: (state, action) => {
      state.loading = false;
      state.bookings = state.bookings.map(b => 
        b._id === action.payload._id ? action.payload : b
      );
    },
    updateBookingStatusFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteBookingRequest: (state) => {
      state.loading = true;
    },
    deleteBookingSuccess: (state, action) => {
      state.loading = false;
      state.bookings = state.bookings.filter(b => b._id !== action.payload);
    },
    deleteBookingFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

export const { 
  fetchBookingsRequest, fetchBookingsSuccess, fetchBookingsFailure,
  updateBookingStatusRequest, updateBookingStatusSuccess, updateBookingStatusFailure,
  deleteBookingRequest, deleteBookingSuccess, deleteBookingFailure
} = bookingsSlice.actions;

export default bookingsSlice.reducer;
