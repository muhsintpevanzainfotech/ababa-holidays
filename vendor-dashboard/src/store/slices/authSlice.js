import { createSlice } from '@reduxjs/toolkit';

const getStoredUser = () => {
  try {
    const item = localStorage.getItem('user');
    return item && item !== 'undefined' ? JSON.parse(item) : null;
  } catch (e) {
    return null;
  }
};

const getStoredToken = () => {
  return localStorage.getItem('token') || localStorage.getItem('accessToken') || null;
};

const initialState = {
  user: getStoredUser(),
  token: getStoredToken(),
  loading: false,
  error: null,
  needsOTP: false,
  email: null,
  approvalPending: false,
  infoMessage: null,
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
    resetAuthError: (state) => {
      state.error = null;
      state.infoMessage = null;
      state.approvalPending = false;
    },
    loginRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.needsOTP = false;
      state.approvalPending = false;
      state.infoMessage = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      if (action.payload.needsOTP) {
        state.needsOTP = true;
        state.email = action.payload.email;
      } else {
        const token = action.payload.accessToken || action.payload.token;
        state.user = action.payload;
        state.token = token || null;
        if (token) {
          localStorage.setItem('token', token);
          localStorage.setItem('accessToken', token);
        }
        localStorage.setItem('user', JSON.stringify(action.payload));
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
      state.approvalPending = false;
      state.infoMessage = null;
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
      if (action.payload.isApproved === false) {
        state.needsOTP = false;
        state.approvalPending = true;
        state.infoMessage = action.payload.message;
        state.token = null;
        state.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      } else {
        const token = action.payload.accessToken || action.payload.token;
        state.user = action.payload;
        state.token = token || null;
        state.needsOTP = false;
        state.approvalPending = false;
        state.infoMessage = null;
        if (token) {
          localStorage.setItem('token', token);
          localStorage.setItem('accessToken', token);
        }
        localStorage.setItem('user', JSON.stringify(action.payload));
      }
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
      state.approvalPending = false;
      state.infoMessage = null;
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    },
  },
});

export const { 
  setUnlocked, lockSession, resetAuthError,
  loginRequest, loginSuccess, loginFailure, 
  registerRequest, registerSuccess, registerFailure,
  verifyOTPRequest, verifyOTPSuccess, verifyOTPFailure,
  logout 
} = authSlice.actions;
export default authSlice.reducer;

