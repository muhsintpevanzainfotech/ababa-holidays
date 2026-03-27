import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  users: [],
  loading: false,
  error: null,
  stats: {
    total: 0,
    vendors: 0,
    admins: 0,
    active: 0
  }
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    fetchUsersRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchUsersSuccess: (state, action) => {
      state.loading = false;
      state.users = action.payload;
    },
    fetchUsersFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setStats: (state, action) => {
      state.stats = action.payload;
    },
    addUserRequest: (state) => {
      state.loading = true;
    },
    addUserSuccess: (state, action) => {
      state.loading = false;
      state.users = [action.payload, ...state.users];
    },
    addUserFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateUserRequest: (state) => {
      state.loading = true;
    },
    updateUserSuccess: (state, action) => {
      state.loading = false;
      state.users = state.users.map(user => 
        user._id === action.payload._id ? action.payload : user
      );
    },
    updateUserFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteUserRequest: (state) => {
      state.loading = true;
    },
    deleteUserSuccess: (state, action) => {
      state.loading = false;
      state.users = state.users.filter(user => user._id !== action.payload);
    },
    deleteUserFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateUserStatusRequest: (state) => {
      state.loading = true;
    },
    updateUserStatusSuccess: (state, action) => {
      state.loading = false;
      state.users = state.users.map(user => 
        user._id === action.payload._id ? { ...user, isSuspended: action.payload.isSuspended } : user
      );
    },
    updateUserStatusFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

export const { 
  fetchUsersRequest, fetchUsersSuccess, fetchUsersFailure,
  addUserRequest, addUserSuccess, addUserFailure,
  updateUserRequest, updateUserSuccess, updateUserFailure,
  deleteUserRequest, deleteUserSuccess, deleteUserFailure,
  updateUserStatusRequest, updateUserStatusSuccess, updateUserStatusFailure,
  setStats
} = usersSlice.actions;

export default usersSlice.reducer;
