import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  vendors: [],
  loading: false,
  error: null,
};

const vendorsSlice = createSlice({
  name: 'vendors',
  initialState,
  reducers: {
    fetchVendorsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchVendorsSuccess: (state, action) => {
      state.loading = false;
      state.vendors = action.payload;
    },
    fetchVendorsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addVendorRequest: (state) => {
      state.loading = true;
    },
    addVendorSuccess: (state, action) => {
      state.loading = false;
      state.vendors = [action.payload, ...state.vendors];
    },
    addVendorFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateVendorRequest: (state) => {
      state.loading = true;
    },
    updateVendorSuccess: (state, action) => {
      state.loading = false;
      state.vendors = state.vendors.map(v => 
        v._id === action.payload._id ? action.payload : v
      );
    },
    updateVendorFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteVendorRequest: (state) => {
      state.loading = true;
    },
    deleteVendorSuccess: (state, action) => {
      state.loading = false;
      state.vendors = state.vendors.filter(v => v._id !== action.payload);
    },
    deleteVendorFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

export const { 
  fetchVendorsRequest, fetchVendorsSuccess, fetchVendorsFailure,
  addVendorRequest, addVendorSuccess, addVendorFailure,
  updateVendorRequest, updateVendorSuccess, updateVendorFailure,
  deleteVendorRequest, deleteVendorSuccess, deleteVendorFailure
} = vendorsSlice.actions;

export default vendorsSlice.reducer;
