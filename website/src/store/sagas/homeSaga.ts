import { call, put, takeLatest } from "redux-saga/effects";
import { getHomeDataApi } from "@/api/endpoints";
import {
  fetchHomeDataStart,
  fetchHomeDataSuccess,
  fetchHomeDataFailure,
} from "../slices/homeSlice";

function* handleFetchHomeData(): Generator<any, void, any> {
  try {
    const data = yield call(getHomeDataApi);
    yield put(fetchHomeDataSuccess(data));
  } catch (error: any) {
    yield put(fetchHomeDataFailure(error.message || "Failed to fetch home page data"));
  }
}

export function* watchHomeSaga() {
  yield takeLatest(fetchHomeDataStart.type, handleFetchHomeData);
}
