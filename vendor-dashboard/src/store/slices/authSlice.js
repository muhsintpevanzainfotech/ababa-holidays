import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,
  needsOTP: false,
  email: null,
  isUnlocked: false,
  unlockedUntil: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUnlocked: (state, action) => {
      state.isUnlocked = action.payload.isUnlocked;
      state.unlockedUntil = action.payload.unlockedUntil;
    },
    lockSession: (state) => {
      state.isUnlocked = false;
      state.unlockedUntil = null;
    },
    loginRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.needsOTP = false;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      if (action.payload.needsOTP) {
        state.needsOTP = true;
        state.email = action.payload.email;
      } else {
        state.user = action.payload;
        state.token = action.payload.accessToken;
        localStorage.setItem('token', action.payload.accessToken);
      }
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    registerRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.needsOTP = false;
    },
    registerSuccess: (state, action) => {
      state.loading = false;
      state.needsOTP = true;
      state.email = action.payload.email || action.payload.user?.email || action.payload._id;
    },
    registerFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    verifyOTPRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    verifyOTPSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.token = action.payload.accessToken;
      state.needsOTP = false;
      localStorage.setItem('token', action.payload.accessToken);
    },
    verifyOTPFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.needsOTP = false;
      state.email = null;
      localStorage.removeItem('token');
    },
  },
});

export const { 
  setUnlocked, lockSession,
  loginRequest, loginSuccess, loginFailure, 
  registerRequest, registerSuccess, registerFailure,
  verifyOTPRequest, verifyOTPSuccess, verifyOTPFailure,
  logout 
} = authSlice.actions;
export default authSlice.reducer;
