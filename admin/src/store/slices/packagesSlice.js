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
      const raw = Array.isArray(action.payload) ? action.payload : (action.payload?.data || []);
      const map = new Map();
      raw.forEach(p => {
        const key = (p._id || p.customId || '').toString();
        if (key && !map.has(key)) {
          map.set(key, p);
        }
      });
      state.packages = Array.from(map.values());
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
      const newPkg = action.payload;
      const newId = (newPkg._id || newPkg.customId || '').toString();
      const existingFiltered = state.packages.filter(p => (p._id || p.customId || '').toString() !== newId);
      state.packages = [newPkg, ...existingFiltered];
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
