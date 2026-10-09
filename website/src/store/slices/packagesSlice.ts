import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface PackagesState {
  packages: any[];
  selectedPackage: any | null;
  filters: {
    category: string;
    destination: string;
    searchQuery: string;
  };
  loading: boolean;
  detailsLoading: boolean;
  inquiryLoading: boolean;
  inquirySuccess: boolean;
  error: string | null;
}

const initialState: PackagesState = {
  packages: [],
  selectedPackage: null,
  filters: {
    category: "all",
    destination: "all",
    searchQuery: "",
  },
  loading: false,
  detailsLoading: false,
  inquiryLoading: false,
  inquirySuccess: false,
  error: null,
};

const packagesSlice = createSlice({
  name: "packages",
  initialState,
  reducers: {
    fetchPackagesStart(state, _action: PayloadAction<{ category?: string; search?: string; destination?: string } | undefined | void>) {
      state.loading = true;
      state.error = null;
    },
    fetchPackagesSuccess(state, action: PayloadAction<any[]>) {
      state.loading = false;
      state.packages = action.payload;
    },
    fetchPackagesFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    fetchPackageDetailsStart(state, _action: PayloadAction<string>) {
      state.detailsLoading = true;
      state.error = null;
    },
    fetchPackageDetailsSuccess(state, action: PayloadAction<any>) {
      state.detailsLoading = false;
      state.selectedPackage = action.payload;
    },
    fetchPackageDetailsFailure(state, action: PayloadAction<string>) {
      state.detailsLoading = false;
      state.error = action.payload;
    },
    setFilterCategory(state, action: PayloadAction<string>) {
      state.filters.category = action.payload;
    },
    setFilterSearchQuery(state, action: PayloadAction<string>) {
      state.filters.searchQuery = action.payload;
    },
    submitPackageInquiryStart(state, _action: PayloadAction<Record<string, unknown>>) {
      state.inquiryLoading = true;
      state.inquirySuccess = false;
      state.error = null;
    },
    submitPackageInquirySuccess(state) {
      state.inquiryLoading = false;
      state.inquirySuccess = true;
    },
    submitPackageInquiryFailure(state, action: PayloadAction<string>) {
      state.inquiryLoading = false;
      state.error = action.payload;
    },
    resetInquiryStatus(state) {
      state.inquirySuccess = false;
      state.error = null;
    },
  },
});

export const {
  fetchPackagesStart,
  fetchPackagesSuccess,
  fetchPackagesFailure,
  fetchPackageDetailsStart,
  fetchPackageDetailsSuccess,
  fetchPackageDetailsFailure,
  setFilterCategory,
  setFilterSearchQuery,
  submitPackageInquiryStart,
  submitPackageInquirySuccess,
  submitPackageInquiryFailure,
  resetInquiryStatus,
} = packagesSlice.actions;

export default packagesSlice.reducer;
