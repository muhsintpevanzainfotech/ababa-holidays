import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  subscriptions: [],
  loading: false,
  error: null,
};

const subscriptionsSlice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {
    fetchSubscriptionsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchSubscriptionsSuccess: (state, action) => {
      state.loading = false;
      state.subscriptions = action.payload;
    },
    fetchSubscriptionsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addSubscriptionRequest: (state) => {
      state.loading = true;
    },
    addSubscriptionSuccess: (state, action) => {
      state.loading = false;
      state.subscriptions = [action.payload, ...state.subscriptions];
    },
    addSubscriptionFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateSubscriptionRequest: (state) => {
      state.loading = true;
    },
    updateSubscriptionSuccess: (state, action) => {
      state.loading = false;
      state.subscriptions = state.subscriptions.map(s => 
        s._id === action.payload._id ? action.payload : s
      );
    },
    updateSubscriptionFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteSubscriptionRequest: (state) => {
      state.loading = true;
    },
    deleteSubscriptionSuccess: (state, action) => {
      state.loading = false;
      state.subscriptions = state.subscriptions.filter(s => s._id !== action.payload);
    },
    deleteSubscriptionFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

export const { 
  fetchSubscriptionsRequest, fetchSubscriptionsSuccess, fetchSubscriptionsFailure,
  addSubscriptionRequest, addSubscriptionSuccess, addSubscriptionFailure,
  updateSubscriptionRequest, updateSubscriptionSuccess, updateSubscriptionFailure,
  deleteSubscriptionRequest, deleteSubscriptionSuccess, deleteSubscriptionFailure
} = subscriptionsSlice.actions;

export default subscriptionsSlice.reducer;
