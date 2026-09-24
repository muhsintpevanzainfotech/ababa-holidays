import { createSlice } from '@reduxjs/toolkit';

const enquiriesSlice = createSlice({
  name: 'enquiries',
  initialState: {
    enquiries: [],
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    fetchEnquiriesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchEnquiriesSuccess: (state, action) => {
      state.loading = false;
      state.enquiries = action.payload;
    },
    fetchEnquiriesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteEnquiryRequest: (state) => {
      state.loading = true;
    },
    deleteEnquirySuccess: (state, action) => {
      state.loading = false;
      state.enquiries = state.enquiries.filter((e) => e._id !== action.payload);
    },
    deleteEnquiryFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateEnquiryStatusRequest: (state) => {
      state.loading = true;
    },
    updateEnquiryStatusSuccess: (state, action) => {
      state.loading = false;
      const index = state.enquiries.findIndex((e) => e._id === action.payload._id);
      if (index !== -1) {
        state.enquiries[index] = action.payload;
      }
    },
    updateEnquiryStatusFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addFollowUpRequest: (state) => {
        state.loading = true;
    },
    addFollowUpSuccess: (state, action) => {
        state.loading = false;
        const index = state.enquiries.findIndex((e) => e._id === action.payload._id);
        if (index !== -1) {
            state.enquiries[index] = action.payload;
        }
    },
    addFollowUpFailure: (state, action) => {
        state.loading = false;
        state.error = action.payload;
    }
  },
});

export const {
  fetchEnquiriesRequest,
  fetchEnquiriesSuccess,
  fetchEnquiriesFailure,
  deleteEnquiryRequest,
  deleteEnquirySuccess,
  deleteEnquiryFailure,
  updateEnquiryStatusRequest,
  updateEnquiryStatusSuccess,
  updateEnquiryStatusFailure,
  addFollowUpRequest,
  addFollowUpSuccess,
  addFollowUpFailure
} = enquiriesSlice.actions;

export default enquiriesSlice.reducer;
