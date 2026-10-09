import { call, put, takeLatest } from "redux-saga/effects";
import { getReelsApi } from "@/api/endpoints";
import {
  fetchReelsRequest,
  fetchReelsSuccess,
  fetchReelsFailure,
} from "../slices/reelsSlice";

function* handleFetchReels(): Generator<any, void, any> {
  try {
    const data = yield call(getReelsApi);
    yield put(fetchReelsSuccess(data));
  } catch (error: any) {
    yield put(fetchReelsFailure(error.message || "Failed to fetch web show reels"));
  }
}

export function* watchReelsSaga() {
  yield takeLatest(fetchReelsRequest.type, handleFetchReels);
}
