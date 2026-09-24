import { createSlice } from '@reduxjs/toolkit';

const contactUsSlice = createSlice({
  name: 'contactUs',
  initialState: {
    messages: [],
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    fetchContactMessagesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchContactMessagesSuccess: (state, action) => {
      state.loading = false;
      state.messages = action.payload;
    },
    fetchContactMessagesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteContactMessageRequest: (state) => {
      state.loading = true;
    },
    deleteContactMessageSuccess: (state, action) => {
      state.loading = false;
      state.messages = state.messages.filter((m) => m._id !== action.payload);
    },
    deleteContactMessageFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateContactMessageStatusRequest: (state) => {
      state.loading = true;
    },
    updateContactMessageStatusSuccess: (state, action) => {
      state.loading = false;
      const index = state.messages.findIndex((m) => m._id === action.payload._id);
      if (index !== -1) {
        state.messages[index] = action.payload;
      }
    },
    updateContactMessageStatusFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  },
});

export const {
  fetchContactMessagesRequest,
  fetchContactMessagesSuccess,
  fetchContactMessagesFailure,
  deleteContactMessageRequest,
  deleteContactMessageSuccess,
  deleteContactMessageFailure,
  updateContactMessageStatusRequest,
  updateContactMessageStatusSuccess,
  updateContactMessageStatusFailure
} = contactUsSlice.actions;

export default contactUsSlice.reducer;
