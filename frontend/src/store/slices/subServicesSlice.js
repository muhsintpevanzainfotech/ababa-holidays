import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  subServices: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  },
  loading: false,
  error: null,
};

const subServicesSlice = createSlice({
  name: 'subServices',
  initialState,
  reducers: {
    fetchSubServicesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchSubServicesSuccess: (state, action) => {
      state.loading = false;
      state.subServices = action.payload.data;
      state.pagination = action.payload.pagination;
    },
    fetchSubServicesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addSubServiceRequest: (state) => {
      state.loading = true;
    },
    addSubServiceSuccess: (state, action) => {
      state.loading = false;
      state.subServices = [action.payload, ...state.subServices];
    },
    addSubServiceFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateSubServiceRequest: (state) => {
      state.loading = true;
    },
    updateSubServiceSuccess: (state, action) => {
      state.loading = false;
      state.subServices = state.subServices.map(s => 
        s._id === action.payload._id ? action.payload : s
      );
    },
    updateSubServiceFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteSubServiceRequest: (state) => {
      state.loading = true;
    },
    deleteSubServiceSuccess: (state, action) => {
      state.loading = false;
      state.subServices = state.subServices.filter(s => s._id !== action.payload);
    },
    deleteSubServiceFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

export const { 
  fetchSubServicesRequest, fetchSubServicesSuccess, fetchSubServicesFailure,
  addSubServiceRequest, addSubServiceSuccess, addSubServiceFailure,
  updateSubServiceRequest, updateSubServiceSuccess, updateSubServiceFailure,
  deleteSubServiceRequest, deleteSubServiceSuccess, deleteSubServiceFailure
} = subServicesSlice.actions;

export default subServicesSlice.reducer;
