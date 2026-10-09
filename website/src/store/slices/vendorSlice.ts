import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface VendorState {
  vendors: any[];
  vendorDetails: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: VendorState = {
  vendors: [],
  vendorDetails: null,
  loading: false,
  error: null,
};

const vendorSlice = createSlice({
  name: "vendor",
  initialState,
  reducers: {
    fetchVendorsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchVendorsSuccess(state, action: PayloadAction<any[]>) {
      state.loading = false;
      state.vendors = action.payload;
    },
    fetchVendorsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    fetchVendorStart(state, _action: PayloadAction<string>) {
      state.loading = true;
      state.error = null;
    },
    fetchVendorSuccess(state, action: PayloadAction<any>) {
      state.loading = false;
      state.vendorDetails = action.payload;
    },
    fetchVendorFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchVendorsStart,
  fetchVendorsSuccess,
  fetchVendorsFailure,
  fetchVendorStart,
  fetchVendorSuccess,
  fetchVendorFailure,
} = vendorSlice.actions;

export default vendorSlice.reducer;
