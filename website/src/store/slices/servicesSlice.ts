import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ServicesState {
  services: any[];
  subServices: any[];
  selectedService: any | null;
  selectedSubService: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: ServicesState = {
  services: [],
  subServices: [],
  selectedService: null,
  selectedSubService: null,
  loading: false,
  error: null,
};

const servicesSlice = createSlice({
  name: "services",
  initialState,
  reducers: {
    fetchServicesStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchServicesSuccess(state, action: PayloadAction<any[]>) {
      state.loading = false;
      state.services = action.payload;
    },
    fetchServicesFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    fetchSubServicesStart(state, _action: PayloadAction<string | undefined>) {
      state.loading = true;
      state.error = null;
    },
    fetchSubServicesSuccess(state, action: PayloadAction<any[]>) {
      state.loading = false;
      state.subServices = action.payload;
    },
    fetchSubServicesFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    fetchSubServiceStart(state, _action: PayloadAction<string>) {
      state.loading = true;
      state.error = null;
    },
    fetchSubServiceSuccess(state, action: PayloadAction<any>) {
      state.loading = false;
      state.selectedSubService = action.payload;
    },
    fetchSubServiceFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchServicesStart,
  fetchServicesSuccess,
  fetchServicesFailure,
  fetchSubServicesStart,
  fetchSubServicesSuccess,
  fetchSubServicesFailure,
  fetchSubServiceStart,
  fetchSubServiceSuccess,
  fetchSubServiceFailure,
} = servicesSlice.actions;

export default servicesSlice.reducer;
