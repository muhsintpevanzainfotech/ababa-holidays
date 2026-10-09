import { call, put, takeLatest } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import { searchApi, submitPlannerApi } from "@/api/endpoints";
import {
  performSearchStart,
  performSearchSuccess,
  performSearchFailure,
  submitPlannerStart,
  submitPlannerSuccess,
  submitPlannerFailure,
} from "../slices/searchSlice";

function* handlePerformSearch(action: PayloadAction<string>): Generator<any, void, any> {
  try {
    const data = yield call(searchApi, action.payload);
    yield put(performSearchSuccess(data));
  } catch (error: any) {
    yield put(performSearchFailure(error.message || "Failed to execute search"));
  }
}

function* handleSubmitPlanner(action: PayloadAction<Record<string, unknown>>): Generator<any, void, any> {
  try {
    const res = yield call(submitPlannerApi, action.payload);
    yield put(submitPlannerSuccess(res.message || "Planner itinerary submitted successfully!"));
  } catch (error: any) {
    yield put(submitPlannerFailure(error.message || "Failed to submit planner"));
  }
}

export function* watchSearchSaga() {
  yield takeLatest(performSearchStart.type, handlePerformSearch);
  yield takeLatest(submitPlannerStart.type, handleSubmitPlanner);
}
