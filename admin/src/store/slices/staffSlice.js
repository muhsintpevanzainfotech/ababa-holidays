import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  staff: [],
  loading: false,
  error: null,
};

const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {
    fetchStaffRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchStaffSuccess: (state, action) => {
      state.loading = false;
      state.staff = action.payload;
    },
    fetchStaffFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addStaffRequest: (state) => {
      state.loading = true;
    },
    addStaffSuccess: (state, action) => {
      state.loading = false;
      state.staff = [action.payload, ...state.staff];
    },
    addStaffFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateStaffRequest: (state) => {
      state.loading = true;
    },
    updateStaffSuccess: (state, action) => {
      state.loading = false;
      state.staff = state.staff.map(s => 
        s._id === action.payload._id ? action.payload : s
      );
    },
    updateStaffFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteStaffRequest: (state) => {
      state.loading = true;
    },
    deleteStaffSuccess: (state, action) => {
      state.loading = false;
      state.staff = state.staff.filter(s => s._id !== action.payload);
    },
    deleteStaffFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

export const { 
  fetchStaffRequest, fetchStaffSuccess, fetchStaffFailure,
  addStaffRequest, addStaffSuccess, addStaffFailure,
  updateStaffRequest, updateStaffSuccess, updateStaffFailure,
  deleteStaffRequest, deleteStaffSuccess, deleteStaffFailure
} = staffSlice.actions;

export default staffSlice.reducer;
