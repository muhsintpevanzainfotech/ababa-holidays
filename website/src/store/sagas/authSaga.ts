import { call, put, takeLatest } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import { loginApi, registerApi, getProfileApi } from "@/api/endpoints";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  fetchProfileStart,
  fetchProfileSuccess,
  fetchProfileFailure,
} from "../slices/authSlice";

function* handleLogin(action: PayloadAction<{ email: string; pass: string }>): Generator<any, void, any> {
  try {
    const data = yield call(loginApi, action.payload);
    yield put(loginSuccess(data));
  } catch (error: any) {
    yield put(loginFailure(error.message || "Invalid credentials"));
  }
}

function* handleRegister(action: PayloadAction<{ name: string; email: string; phone: string; pass: string }>): Generator<any, void, any> {
  try {
    const data = yield call(registerApi, action.payload);
    yield put(registerSuccess(data));
  } catch (error: any) {
    yield put(registerFailure(error.message || "Registration failed"));
  }
}

function* handleFetchProfile(): Generator<any, void, any> {
  try {
    const user = yield call(getProfileApi);
    yield put(fetchProfileSuccess(user));
  } catch (error: any) {
    yield put(fetchProfileFailure(error.message || "Failed to load user profile"));
  }
}

export function* watchAuthSaga() {
  yield takeLatest(loginStart.type, handleLogin);
  yield takeLatest(registerStart.type, handleRegister);
  yield takeLatest(fetchProfileStart.type, handleFetchProfile);
}
