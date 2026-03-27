import { call, put, takeLatest } from 'redux-saga/effects';
import api from '../../utils/api';
import {
  fetchTestimonialsRequest,
  fetchTestimonialsSuccess,
  fetchTestimonialsFailure,
  addTestimonialRequest,
  addTestimonialSuccess,
  addTestimonialFailure,
  updateTestimonialRequest,
  updateTestimonialSuccess,
  updateTestimonialFailure,
  deleteTestimonialRequest,
  deleteTestimonialSuccess,
  deleteTestimonialFailure,
} from '../slices/testimonialsSlice';

function* fetchTestimonialsSaga() {
  try {
    const response = yield call(api.get, '/testimonials');
    yield put(fetchTestimonialsSuccess(response.data.data));
  } catch (error) {
    yield put(fetchTestimonialsFailure(error.response?.data?.message || error.message));
  }
}

function* addTestimonialSaga(action) {
  try {
    const response = yield call(api.post, '/testimonials', action.payload);
    yield put(addTestimonialSuccess(response.data.data));
  } catch (error) {
    yield put(addTestimonialFailure(error.response?.data?.message || error.message));
  }
}

function* updateTestimonialSaga(action) {
  try {
    const { id, data } = action.payload;
    const response = yield call(api.put, `/testimonials/${id}`, data);
    yield put(updateTestimonialSuccess(response.data.data));
  } catch (error) {
    yield put(updateTestimonialFailure(error.response?.data?.message || error.message));
  }
}

function* deleteTestimonialSaga(action) {
  try {
    yield call(api.delete, `/testimonials/${action.payload}`);
    yield put(deleteTestimonialSuccess(action.payload));
  } catch (error) {
    yield put(deleteTestimonialFailure(error.response?.data?.message || error.message));
  }
}

export function* watchTestimonialsSaga() {
  yield takeLatest(fetchTestimonialsRequest.type, fetchTestimonialsSaga);
  yield takeLatest(addTestimonialRequest.type, addTestimonialSaga);
  yield takeLatest(updateTestimonialRequest.type, updateTestimonialSaga);
  yield takeLatest(deleteTestimonialRequest.type, deleteTestimonialSaga);
}
