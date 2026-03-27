import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  services: [],
  loading: false,
  error: null,
};

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    fetchServicesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchServicesSuccess: (state, action) => {
      state.loading = false;
      state.services = action.payload;
    },
    fetchServicesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addServiceRequest: (state) => {
      state.loading = true;
    },
    addServiceSuccess: (state, action) => {
      state.loading = false;
      state.services = [action.payload, ...state.services];
    },
    addServiceFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateServiceRequest: (state) => {
      state.loading = true;
    },
    updateServiceSuccess: (state, action) => {
      state.loading = false;
      state.services = state.services.map(s => 
        s._id === action.payload._id ? action.payload : s
      );
    },
    updateServiceFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteServiceRequest: (state) => {
      state.loading = true;
    },
    deleteServiceSuccess: (state, action) => {
      state.loading = false;
      state.services = state.services.filter(s => s._id !== action.payload);
    },
    deleteServiceFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

export const { 
  fetchServicesRequest, fetchServicesSuccess, fetchServicesFailure,
  addServiceRequest, addServiceSuccess, addServiceFailure,
  updateServiceRequest, updateServiceSuccess, updateServiceFailure,
  deleteServiceRequest, deleteServiceSuccess, deleteServiceFailure
} = servicesSlice.actions;

export default servicesSlice.reducer;
