import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  blogs: [],
  loading: false,
  error: null,
};

const blogsSlice = createSlice({
  name: 'blogs',
  initialState,
  reducers: {
    fetchBlogsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchBlogsSuccess: (state, action) => {
      state.loading = false;
      state.blogs = action.payload;
    },
    fetchBlogsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addBlogRequest: (state) => {
      state.loading = true;
    },
    addBlogSuccess: (state, action) => {
      state.loading = false;
      state.blogs = [action.payload, ...state.blogs];
    },
    addBlogFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateBlogRequest: (state) => {
      state.loading = true;
    },
    updateBlogSuccess: (state, action) => {
      state.loading = false;
      state.blogs = state.blogs.map(b => 
        b._id === action.payload._id ? action.payload : b
      );
    },
    updateBlogFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteBlogRequest: (state) => {
      state.loading = true;
    },
    deleteBlogSuccess: (state, action) => {
      state.loading = false;
      state.blogs = state.blogs.filter(b => b._id !== action.payload);
    },
    deleteBlogFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

export const { 
  fetchBlogsRequest, fetchBlogsSuccess, fetchBlogsFailure,
  addBlogRequest, addBlogSuccess, addBlogFailure,
  updateBlogRequest, updateBlogSuccess, updateBlogFailure,
  deleteBlogRequest, deleteBlogSuccess, deleteBlogFailure
} = blogsSlice.actions;

export default blogsSlice.reducer;
