import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  categories: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  },
  loading: false,
  error: null,
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    fetchCategoriesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchCategoriesSuccess: (state, action) => {
      state.loading = false;
      state.categories = action.payload.data || [];
      state.pagination = action.payload.pagination;
    },
    fetchCategoriesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addCategoryRequest: (state) => {
      state.loading = true;
    },
    addCategorySuccess: (state, action) => {
      state.loading = false;
      state.categories = [action.payload, ...state.categories];
    },
    addCategoryFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateCategoryRequest: (state) => {
      state.loading = true;
    },
    updateCategorySuccess: (state, action) => {
      state.loading = false;
      state.categories = state.categories.map(c => 
        c._id === action.payload._id ? action.payload : c
      );
    },
    updateCategoryFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteCategoryRequest: (state) => {
      state.loading = true;
    },
    deleteCategorySuccess: (state, action) => {
      state.loading = false;
      state.categories = state.categories.filter(c => c._id !== action.payload);
    },
    deleteCategoryFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

export const { 
  fetchCategoriesRequest, fetchCategoriesSuccess, fetchCategoriesFailure,
  addCategoryRequest, addCategorySuccess, addCategoryFailure,
  updateCategoryRequest, updateCategorySuccess, updateCategoryFailure,
  deleteCategoryRequest, deleteCategorySuccess, deleteCategoryFailure
} = categoriesSlice.actions;

export default categoriesSlice.reducer;
