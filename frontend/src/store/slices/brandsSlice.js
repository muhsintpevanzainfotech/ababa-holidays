import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  brands: [],
  loading: false,
  error: null,
};

const brandsSlice = createSlice({
  name: 'brands',
  initialState,
  reducers: {
    fetchBrandsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchBrandsSuccess: (state, action) => {
      state.loading = false;
      state.brands = action.payload;
    },
    fetchBrandsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addBrandRequest: (state) => {
      state.loading = true;
    },
    addBrandSuccess: (state, action) => {
      state.loading = false;
      state.brands = [action.payload, ...state.brands];
    },
    addBrandFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateBrandRequest: (state) => {
      state.loading = true;
    },
    updateBrandSuccess: (state, action) => {
      state.loading = false;
      state.brands = state.brands.map(b => 
        b._id === action.payload._id ? action.payload : b
      );
    },
    updateBrandFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteBrandRequest: (state) => {
      state.loading = true;
    },
    deleteBrandSuccess: (state, action) => {
      state.loading = false;
      state.brands = state.brands.filter(b => b._id !== action.payload);
    },
    deleteBrandFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

export const { 
  fetchBrandsRequest, fetchBrandsSuccess, fetchBrandsFailure,
  addBrandRequest, addBrandSuccess, addBrandFailure,
  updateBrandRequest, updateBrandSuccess, updateBrandFailure,
  deleteBrandRequest, deleteBrandSuccess, deleteBrandFailure
} = brandsSlice.actions;

export default brandsSlice.reducer;
