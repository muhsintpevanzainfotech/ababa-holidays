import { call, put, takeLatest } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import { submitContactFormApi } from "@/api/endpoints";
import {
  submitContactStart,
  submitContactSuccess,
  submitContactFailure,
} from "../slices/contactSlice";

function* handleSubmitContact(action: PayloadAction<Record<string, unknown>>): Generator<any, void, any> {
  try {
    const res = yield call(submitContactFormApi, action.payload);
    yield put(submitContactSuccess(res.message || "Message sent successfully!"));
  } catch (error: any) {
    yield put(submitContactFailure(error.message || "Failed to submit contact form"));
  }
}

export function* watchContactSaga() {
  yield takeLatest(submitContactStart.type, handleSubmitContact);
}
