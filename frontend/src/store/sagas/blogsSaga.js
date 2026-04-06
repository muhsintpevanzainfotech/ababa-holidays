import { call, put, takeLatest } from 'redux-saga/effects';
import api from '../../utils/api';
import {
  fetchBlogsRequest, fetchBlogsSuccess, fetchBlogsFailure,
  addBlogRequest, addBlogSuccess, addBlogFailure,
  updateBlogRequest, updateBlogSuccess, updateBlogFailure,
  deleteBlogRequest, deleteBlogSuccess, deleteBlogFailure,
  toggleBlogStatusRequest
} from '../slices/blogsSlice';

function* fetchBlogs(action) {
  try {
    const role = action.payload || 'Admin';
    const url = role === 'Vendor' ? '/blogs/vendor' : '/blogs/admin';
    const response = yield call(api.get, url);
    yield put(fetchBlogsSuccess(response.data.data));
  } catch (error) {
    yield put(fetchBlogsFailure(error.response?.data?.message || 'Failed to fetch blogs'));
  }
}

function* addBlog(action) {
  try {
    const response = yield call(api.post, '/blogs', action.payload, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    yield put(addBlogSuccess(response.data.data));
  } catch (error) {
    yield put(addBlogFailure(error.response?.data?.message || 'Failed to add blog'));
  }
}

function* updateBlog(action) {
  try {
    const { id, data } = action.payload;
    const response = yield call(api.put, `/blogs/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    yield put(updateBlogSuccess(response.data.data));
  } catch (error) {
    yield put(updateBlogFailure(error.response?.data?.message || 'Failed to update blog'));
  }
}

function* deleteBlog(action) {
  try {
    yield call(api.delete, `/blogs/${action.payload}`);
    yield put(deleteBlogSuccess(action.payload));
  } catch (error) {
    yield put(deleteBlogFailure(error.response?.data?.message || 'Failed to delete blog'));
  }
}

function* toggleBlogStatus(action) {
  try {
    const { id, status } = action.payload;
    const response = yield call(api.put, `/blogs/${id}`, { status });
    yield put(updateBlogSuccess(response.data.data));
  } catch (error) {
    console.error('Failed to toggle blog status', error);
  }
}

export function* watchBlogsSaga() {
  yield takeLatest(fetchBlogsRequest.type, fetchBlogs);
  yield takeLatest(addBlogRequest.type, addBlog);
  yield takeLatest(updateBlogRequest.type, updateBlog);
  yield takeLatest(deleteBlogRequest.type, deleteBlog);
  yield takeLatest(toggleBlogStatusRequest.type, toggleBlogStatus);
}
