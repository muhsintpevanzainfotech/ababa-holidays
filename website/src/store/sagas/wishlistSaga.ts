import { call, put, takeLatest } from "redux-saga/effects";
import { getWishlistApi } from "@/api/endpoints";
import {
  fetchWishlistStart,
  fetchWishlistSuccess,
  fetchWishlistFailure,
} from "../slices/wishlistSlice";

function* handleFetchWishlist(): Generator<any, void, any> {
  try {
    const data = yield call(getWishlistApi);
    const ids = Array.isArray(data)
      ? data.map((item: any) => (typeof item === "string" ? item : item._id || item.id)).filter(Boolean)
      : [];
    yield put(fetchWishlistSuccess(ids));
  } catch (error: any) {
    yield put(fetchWishlistFailure(error.message || "Failed to fetch wishlist"));
  }
}

export function* watchWishlistSaga() {
  yield takeLatest(fetchWishlistStart.type, handleFetchWishlist);
}
