import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isUnlocked: false,
  unlockedUntil: null,
};

export const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    setUnlocked: (state, action) => {
      state.isUnlocked = action.payload.isUnlocked;
      state.unlockedUntil = action.payload.unlockedUntil; // ISO string 
    },
    lockSession: (state) => {
      state.isUnlocked = false;
      state.unlockedUntil = null;
    }
  }
});

export const { setUnlocked, lockSession } = globalSlice.actions;
export default globalSlice.reducer;
