import { call, put, takeLatest } from 'redux-saga/effects';
import api from '../../utils/api';
import { 
  fetchStaffRequest, fetchStaffSuccess, fetchStaffFailure,
  addStaffRequest, addStaffSuccess, addStaffFailure,
  updateStaffRequest, updateStaffSuccess, updateStaffFailure,
  deleteStaffRequest, deleteStaffSuccess, deleteStaffFailure
} from '../slices/staffSlice';

function* fetchStaffSaga() {
  try {
    const response = yield call(api.get, '/users');
    // Filter for Admin and Sub-Admin roles only
    const staffOnly = response.data.data.filter(u => ['Admin', 'Sub-Admin'].includes(u.role));
    yield put(fetchStaffSuccess(staffOnly));
  } catch (error) {
    yield put(fetchStaffFailure(error.response?.data?.message || 'Failed to fetch staff'));
  }
}

function* addStaffSaga(action) {
  const { data, onSuccess, onError } = action.payload.data ? action.payload : { data: action.payload };
  try {
    const response = yield call(api.post, '/users', data);
    yield put(addStaffSuccess(response.data.data));
    if (onSuccess) onSuccess();
  } catch (error) {
    const errorMsg = error.response?.data?.message || 'Failed to add staff';
    yield put(addStaffFailure(errorMsg));
    if (onError) onError(errorMsg);
  }
}

function* updateStaffSaga(action) {
  const { id, data, onSuccess, onError } = action.payload;
  try {
    const response = yield call(api.put, `/users/${id}`, data);
    yield put(updateStaffSuccess(response.data.data));
    if (onSuccess) onSuccess();
  } catch (error) {
    const errorMsg = error.response?.data?.message || 'Failed to update staff';
    yield put(updateStaffFailure(errorMsg));
    if (onError) onError(errorMsg);
  }
}

function* deleteStaffSaga(action) {
  try {
    yield call(api.delete, `/users/${action.payload}`);
    yield put(deleteStaffSuccess(action.payload));
  } catch (error) {
    yield put(deleteStaffFailure(error.response?.data?.message || 'Failed to delete staff'));
  }
}

export function* watchStaffSaga() {
  yield takeLatest(fetchStaffRequest.type, fetchStaffSaga);
  yield takeLatest(addStaffRequest.type, addStaffSaga);
  yield takeLatest(updateStaffRequest.type, updateStaffSaga);
  yield takeLatest(deleteStaffRequest.type, deleteStaffSaga);
}
