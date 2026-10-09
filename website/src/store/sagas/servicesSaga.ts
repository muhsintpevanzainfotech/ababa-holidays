import { call, put, takeLatest } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import { getServicesApi, getSubServicesApi, getSubServiceByIdApi } from "@/api/endpoints";
import {
  fetchServicesStart,
  fetchServicesSuccess,
  fetchServicesFailure,
  fetchSubServicesStart,
  fetchSubServicesSuccess,
  fetchSubServicesFailure,
  fetchSubServiceStart,
  fetchSubServiceSuccess,
  fetchSubServiceFailure,
} from "../slices/servicesSlice";

function* handleFetchServices(): Generator<any, void, any> {
  try {
    const data = yield call(getServicesApi);
    yield put(fetchServicesSuccess(data));
  } catch (error: any) {
    yield put(fetchServicesFailure(error.message || "Failed to fetch services"));
  }
}

function* handleFetchSubServices(action: PayloadAction<string | undefined>): Generator<any, void, any> {
  try {
    const data = yield call(getSubServicesApi, action.payload);
    yield put(fetchSubServicesSuccess(data));
  } catch (error: any) {
    yield put(fetchSubServicesFailure(error.message || "Failed to fetch sub-services"));
  }
}

function* handleFetchSubService(action: PayloadAction<string>): Generator<any, void, any> {
  try {
    const data = yield call(getSubServiceByIdApi, action.payload);
    yield put(fetchSubServiceSuccess(data));
  } catch (error: any) {
    yield put(fetchSubServiceFailure(error.message || "Failed to fetch sub-service"));
  }
}

export function* watchServicesSaga() {
  yield takeLatest(fetchServicesStart.type, handleFetchServices);
  yield takeLatest(fetchSubServicesStart.type, handleFetchSubServices);
  yield takeLatest(fetchSubServiceStart.type, handleFetchSubService);
}
