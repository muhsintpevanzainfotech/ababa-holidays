import { call, put, takeLatest } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import { getBlogsApi, getBlogBySlugApi } from "@/api/endpoints";
import {
  fetchBlogsStart,
  fetchBlogsSuccess,
  fetchBlogsFailure,
  fetchBlogDetailsStart,
  fetchBlogDetailsSuccess,
  fetchBlogDetailsFailure,
} from "../slices/blogsSlice";

function* handleFetchBlogs(action: PayloadAction<string | undefined>): Generator<any, void, any> {
  try {
    const data = yield call(getBlogsApi, action.payload);
    yield put(fetchBlogsSuccess(data));
  } catch (error: any) {
    yield put(fetchBlogsFailure(error.message || "Failed to fetch blogs"));
  }
}

function* handleFetchBlogDetails(action: PayloadAction<string>): Generator<any, void, any> {
  try {
    const data = yield call(getBlogBySlugApi, action.payload);
    yield put(fetchBlogDetailsSuccess(data));
  } catch (error: any) {
    yield put(fetchBlogDetailsFailure(error.message || "Failed to fetch blog details"));
  }
}

export function* watchBlogsSaga() {
  yield takeLatest(fetchBlogsStart.type, handleFetchBlogs);
  yield takeLatest(fetchBlogDetailsStart.type, handleFetchBlogDetails);
}
