import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  testimonials: [],
  loading: false,
  error: null,
};

const testimonialsSlice = createSlice({
  name: 'testimonials',
  initialState,
  reducers: {
    fetchTestimonialsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchTestimonialsSuccess: (state, action) => {
      state.loading = false;
      state.testimonials = action.payload;
    },
    fetchTestimonialsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addTestimonialRequest: (state) => {
      state.loading = true;
    },
    addTestimonialSuccess: (state, action) => {
      state.loading = false;
      state.testimonials.unshift(action.payload);
    },
    addTestimonialFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateTestimonialRequest: (state) => {
      state.loading = true;
    },
    updateTestimonialSuccess: (state, action) => {
      state.loading = false;
      const index = state.testimonials.findIndex((t) => t._id === action.payload._id);
      if (index !== -1) {
        state.testimonials[index] = action.payload;
      }
    },
    updateTestimonialFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteTestimonialRequest: (state) => {
      state.loading = true;
    },
    deleteTestimonialSuccess: (state, action) => {
      state.loading = false;
      state.testimonials = state.testimonials.filter((t) => t._id !== action.payload);
    },
    deleteTestimonialFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchTestimonialsRequest,
  fetchTestimonialsSuccess,
  fetchTestimonialsFailure,
  addTestimonialRequest,
  addTestimonialSuccess,
  addTestimonialFailure,
  updateTestimonialRequest,
  updateTestimonialSuccess,
  updateTestimonialFailure,
  deleteTestimonialRequest,
  deleteTestimonialSuccess,
  deleteTestimonialFailure,
} = testimonialsSlice.actions;

export default testimonialsSlice.reducer;
