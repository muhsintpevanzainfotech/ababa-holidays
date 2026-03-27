import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const storedUser = localStorage.getItem('user');
const initialState = {
  user: storedUser && storedUser !== 'undefined' ? JSON.parse(storedUser) : null,
  token: localStorage.getItem('accessToken') || null,
  isLoading: false,
  isError: false,
  message: '',
};

import api from '../../utils/api';

// Login user
export const login = createAsyncThunk('auth/login', async (userData, thunkAPI) => {
  try {
    const response = await api.post('/auth/login', userData);
    if (response.data && response.data.accessToken) {
      localStorage.setItem('user', JSON.stringify(response.data));
      localStorage.setItem('accessToken', response.data.accessToken);
    }
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Get user profile
export const getProfile = createAsyncThunk('auth/getProfile', async (_, thunkAPI) => {
  try {
    const response = await api.get('/users/profile');
    if (response.data && response.data.data) {
      const userData = { ...JSON.parse(localStorage.getItem('user')), ...response.data.data };
      localStorage.setItem('user', JSON.stringify(userData));
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    },
    logout: (state) => {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      state.user = null;
      state.token = null;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.token = action.payload.accessToken;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
      });
  },
});

export const { reset, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
