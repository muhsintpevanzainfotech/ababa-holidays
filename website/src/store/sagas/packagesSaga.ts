import { call, put, takeLatest } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import { getPackagesApi, getPackageByIdApi, submitPackageInquiryApi } from "@/api/endpoints";
import {
  fetchPackagesStart,
  fetchPackagesSuccess,
  fetchPackagesFailure,
  fetchPackageDetailsStart,
  fetchPackageDetailsSuccess,
  fetchPackageDetailsFailure,
  submitPackageInquiryStart,
  submitPackageInquirySuccess,
  submitPackageInquiryFailure,
} from "../slices/packagesSlice";

function* handleFetchPackages(action: PayloadAction<{ category?: string; search?: string; destination?: string } | undefined>): Generator<any, void, any> {
  try {
    const data = yield call(getPackagesApi, action.payload);
    yield put(fetchPackagesSuccess(data));
  } catch (error: any) {
    yield put(fetchPackagesFailure(error.message || "Failed to fetch packages"));
  }
}

function* handleFetchPackageDetails(action: PayloadAction<string>): Generator<any, void, any> {
  try {
    const data = yield call(getPackageByIdApi, action.payload);
    yield put(fetchPackageDetailsSuccess(data));
  } catch (error: any) {
    yield put(fetchPackageDetailsFailure(error.message || "Failed to fetch package details"));
  }
}

function* handleSubmitPackageInquiry(action: PayloadAction<Record<string, unknown>>): Generator<any, void, any> {
  try {
    yield call(submitPackageInquiryApi, action.payload);
    yield put(submitPackageInquirySuccess());
  } catch (error: any) {
    yield put(submitPackageInquiryFailure(error.message || "Failed to submit inquiry"));
  }
}

export function* watchPackagesSaga() {
  yield takeLatest(fetchPackagesStart.type, handleFetchPackages);
  yield takeLatest(fetchPackageDetailsStart.type, handleFetchPackageDetails);
  yield takeLatest(submitPackageInquiryStart.type, handleSubmitPackageInquiry);
}
