import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface BlogsState {
  blogs: any[];
  selectedBlog: any | null;
  categoryFilter: string;
  loading: boolean;
  detailsLoading: boolean;
  error: string | null;
}

const initialState: BlogsState = {
  blogs: [],
  selectedBlog: null,
  categoryFilter: "All",
  loading: false,
  detailsLoading: false,
  error: null,
};

const blogsSlice = createSlice({
  name: "blogs",
  initialState,
  reducers: {
    fetchBlogsStart(state, _action: PayloadAction<string | undefined>) {
      state.loading = true;
      state.error = null;
    },
    fetchBlogsSuccess(state, action: PayloadAction<any[]>) {
      state.loading = false;
      state.blogs = action.payload;
    },
    fetchBlogsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    fetchBlogDetailsStart(state, _action: PayloadAction<string>) {
      state.detailsLoading = true;
      state.error = null;
    },
    fetchBlogDetailsSuccess(state, action: PayloadAction<any>) {
      state.detailsLoading = false;
      state.selectedBlog = action.payload;
    },
    fetchBlogDetailsFailure(state, action: PayloadAction<string>) {
      state.detailsLoading = false;
      state.error = action.payload;
    },
    setCategoryFilter(state, action: PayloadAction<string>) {
      state.categoryFilter = action.payload;
    },
  },
});

export const {
  fetchBlogsStart,
  fetchBlogsSuccess,
  fetchBlogsFailure,
  fetchBlogDetailsStart,
  fetchBlogDetailsSuccess,
  fetchBlogDetailsFailure,
  setCategoryFilter,
} = blogsSlice.actions;

export default blogsSlice.reducer;
