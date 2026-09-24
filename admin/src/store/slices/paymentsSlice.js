import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  payments: [],
  loading: false,
  error: null,
};

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    fetchPaymentsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPaymentsSuccess: (state, action) => {
      state.loading = false;
      state.payments = action.payload;
    },
    fetchPaymentsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

export const { 
  fetchPaymentsRequest, fetchPaymentsSuccess, fetchPaymentsFailure
} = paymentsSlice.actions;

export default paymentsSlice.reducer;
