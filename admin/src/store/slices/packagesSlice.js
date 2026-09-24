import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  packages: [],
  loading: false,
  error: null,
};

const packagesSlice = createSlice({
  name: 'packages',
  initialState,
  reducers: {
    fetchPackagesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPackagesSuccess: (state, action) => {
      state.loading = false;
      state.packages = action.payload;
    },
    fetchPackagesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addPackageRequest: (state) => {
      state.loading = true;
    },
    addPackageSuccess: (state, action) => {
      state.loading = false;
      state.packages = [action.payload, ...state.packages];
    },
    addPackageFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updatePackageRequest: (state) => {
      state.loading = true;
    },
    updatePackageSuccess: (state, action) => {
      state.loading = false;
      state.packages = state.packages.map(p => 
        p._id === action.payload._id ? action.payload : p
      );
    },
    updatePackageFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deletePackageRequest: (state) => {
      state.loading = true;
    },
    deletePackageSuccess: (state, action) => {
      state.loading = false;
      state.packages = state.packages.filter(p => p._id !== action.payload);
    },
    deletePackageFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

export const { 
  fetchPackagesRequest, fetchPackagesSuccess, fetchPackagesFailure,
  addPackageRequest, addPackageSuccess, addPackageFailure,
  updatePackageRequest, updatePackageSuccess, updatePackageFailure,
  deletePackageRequest, deletePackageSuccess, deletePackageFailure
} = packagesSlice.actions;

export default packagesSlice.reducer;
