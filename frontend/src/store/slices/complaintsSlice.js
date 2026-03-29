import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

const initialState = {
  complaints: [],
  loading: false,
  error: null,
};

// Fetch complaints
export const fetchComplaints = createAsyncThunk('complaints/fetchComplaints', async (_, thunkAPI) => {
  try {
    const response = await api.get('/complaints');
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

// Create complaint (with images)
export const createComplaint = createAsyncThunk('complaints/createComplaint', async (complaintData, thunkAPI) => {
  try {
    const response = await api.post('/complaints', complaintData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

// Update complaint status/resolution
export const updateComplaint = createAsyncThunk('complaints/updateComplaint', async ({ id, status, resolution }, thunkAPI) => {
  try {
    const response = await api.put(`/complaints/${id}`, { status, resolution });
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

// Delete complaint
export const deleteComplaint = createAsyncThunk('complaints/deleteComplaint', async (id, thunkAPI) => {
  try {
    await api.delete(`/complaints/${id}`);
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

const complaintsSlice = createSlice({
  name: 'complaints',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetching
      .addCase(fetchComplaints.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchComplaints.fulfilled, (state, action) => {
        state.loading = false;
        state.complaints = action.payload;
      })
      .addCase(fetchComplaints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Creating
      .addCase(createComplaint.fulfilled, (state, action) => {
        state.complaints.unshift(action.payload);
      })
      // Updating
      .addCase(updateComplaint.fulfilled, (state, action) => {
        state.complaints = state.complaints.map((c) => 
          c._id === action.payload._id ? { ...c, ...action.payload } : c
        );
      })
      // Deleting
      .addCase(deleteComplaint.fulfilled, (state, action) => {
        state.complaints = state.complaints.filter((c) => c._id !== action.payload);
      });
  },
});

export default complaintsSlice.reducer;
