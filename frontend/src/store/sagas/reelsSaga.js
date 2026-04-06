import { call, put, takeLatest } from 'redux-saga/effects';
import api from '../../utils/api';
import { 
  fetchReelsRequest, fetchReelsSuccess, fetchReelsFailure,
  addReelRequest, addReelSuccess, addReelFailure,
  updateReelRequest, updateReelSuccess, updateReelFailure,
  deleteReelRequest, deleteReelSuccess, deleteReelFailure,
  toggleReelStatusRequest, toggleReelStatusSuccess
} from '../slices/reelsSlice';

function* fetchReelsSaga(action) {
  try {
    const role = action.payload || 'Admin';
    // If we need vendor specific filtering, we can add it here
    const url = '/instagram-reels';
    const response = yield call(api.get, url);
    yield put(fetchReelsSuccess(response.data.data));
  } catch (error) {
    yield put(fetchReelsFailure(error.response?.data?.message || 'Failed to fetch reels'));
  }
}

function* addReelSaga(action) {
  try {
    const response = yield call(api.post, '/instagram-reels', action.payload);
    yield put(addReelSuccess(response.data.data));
  } catch (error) {
    yield put(addReelFailure(error.response?.data?.message || 'Failed to add reel'));
  }
}

function* updateReelSaga(action) {
  const { id, data } = action.payload;
  try {
    const response = yield call(api.put, `/instagram-reels/${id}`, data);
    yield put(updateReelSuccess(response.data.data));
  } catch (error) {
    yield put(updateReelFailure(error.response?.data?.message || 'Failed to update reel'));
  }
}

function* deleteReelSaga(action) {
  try {
    yield call(api.delete, `/instagram-reels/${action.payload}`);
    yield put(deleteReelSuccess(action.payload));
  } catch (error) {
    yield put(deleteReelFailure(error.response?.data?.message || 'Failed to delete reel'));
  }
}

function* toggleReelStatusSaga(action) {
  try {
    const response = yield call(api.put, `/instagram-reels/${action.payload}`, { isActive: action.isActive });
    yield put(toggleReelStatusSuccess(response.data.data));
  } catch (error) {
    // Fallback or explicit failure action
    console.error('Failed to toggle reel status', error);
  }
}

export function* watchReelsSaga() {
  yield takeLatest(fetchReelsRequest.type, fetchReelsSaga);
  yield takeLatest(addReelRequest.type, addReelSaga);
  yield takeLatest(updateReelRequest.type, updateReelSaga);
  yield takeLatest(deleteReelRequest.type, deleteReelSaga);
  yield takeLatest(toggleReelStatusRequest.type, toggleReelStatusSaga);
}
