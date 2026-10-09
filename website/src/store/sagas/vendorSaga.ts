import { call, put, takeLatest } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import { getVendorDataApi, getVendorsApi } from "@/api/endpoints";
import {
  fetchVendorsStart,
  fetchVendorsSuccess,
  fetchVendorsFailure,
  fetchVendorStart,
  fetchVendorSuccess,
  fetchVendorFailure,
} from "../slices/vendorSlice";

function* handleFetchVendors(): Generator<any, void, any> {
  try {
    const data = yield call(getVendorsApi);
    yield put(fetchVendorsSuccess(data));
  } catch (error: any) {
    yield put(fetchVendorsFailure(error.message || "Failed to fetch vendors"));
  }
}

function* handleFetchVendor(action: PayloadAction<string>): Generator<any, void, any> {
  try {
    const data = yield call(getVendorDataApi, action.payload);
    yield put(fetchVendorSuccess(data));
  } catch (error: any) {
    yield put(fetchVendorFailure(error.message || "Failed to fetch vendor details"));
  }
}

export function* watchVendorSaga() {
  yield takeLatest(fetchVendorsStart.type, handleFetchVendors);
  yield takeLatest(fetchVendorStart.type, handleFetchVendor);
}
