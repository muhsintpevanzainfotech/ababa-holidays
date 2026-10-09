import { call, put, takeLatest } from "redux-saga/effects";
import { getAboutDataApi } from "@/api/endpoints";
import {
  fetchAboutStart,
  fetchAboutSuccess,
  fetchAboutFailure,
} from "../slices/aboutSlice";

function* handleFetchAbout(): Generator<any, void, any> {
  try {
    const data = yield call(getAboutDataApi);
    yield put(fetchAboutSuccess(data));
  } catch (error: any) {
    yield put(fetchAboutFailure(error.message || "Failed to fetch about data"));
  }
}

export function* watchAboutSaga() {
  yield takeLatest(fetchAboutStart.type, handleFetchAbout);
}
