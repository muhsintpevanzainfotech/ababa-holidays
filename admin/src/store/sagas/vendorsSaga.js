import { call, put, takeLatest } from 'redux-saga/effects';
import api from '../../utils/api';
import { 
  fetchVendorsRequest, fetchVendorsSuccess, fetchVendorsFailure,
  addVendorRequest, addVendorSuccess, addVendorFailure,
  updateVendorRequest, updateVendorSuccess, updateVendorFailure,
  deleteVendorRequest, deleteVendorSuccess, deleteVendorFailure
} from '../slices/vendorsSlice';

function* fetchVendorsSaga() {
  try {
    const response = yield call(api.get, '/vendors');
    yield put(fetchVendorsSuccess(response.data.data));
  } catch (error) {
    try {
      const fallback = yield call(api.get, '/users');
      const vendorOnly = fallback.data.data.filter(u => ['Vendor', 'Vendor-Staff'].includes(u.role));
      yield put(fetchVendorsSuccess(vendorOnly));
    } catch (e) {
      yield put(fetchVendorsFailure(error.response?.data?.message || 'Failed to fetch vendors'));
    }
  }
}

function* addVendorSaga(action) {
  try {
    const response = yield call(api.post, '/vendors', action.payload);
    yield put(addVendorSuccess(response.data.data));
  } catch (error) {
    try {
      const fallback = yield call(api.post, '/users', action.payload);
      yield put(addVendorSuccess(fallback.data.data));
    } catch (e) {
      yield put(addVendorFailure(error.response?.data?.message || 'Failed to add vendor'));
    }
  }
}

function* updateVendorSaga(action) {
  const { id, data, isApproveAction } = action.payload;
  try {
    let response;
    if (isApproveAction) {
      response = yield call(api.put, `/vendors/${id}/approve`);
    } else {
      response = yield call(api.put, `/vendors/${id}`, data);
    }
    yield put(updateVendorSuccess(response.data.data));
  } catch (error) {
    try {
      const fallback = yield call(api.put, `/users/${id}`, data);
      yield put(updateVendorSuccess(fallback.data.data));
    } catch (e) {
      yield put(updateVendorFailure(error.response?.data?.message || 'Failed to update vendor'));
    }
  }
}

function* deleteVendorSaga(action) {
  try {
    yield call(api.delete, `/vendors/${action.payload}`);
    yield put(deleteVendorSuccess(action.payload));
  } catch (error) {
    try {
      yield call(api.delete, `/users/${action.payload}`);
      yield put(deleteVendorSuccess(action.payload));
    } catch (e) {
      yield put(deleteVendorFailure(error.response?.data?.message || 'Failed to delete vendor'));
    }
  }
}

export function* watchVendorsSaga() {
  yield takeLatest(fetchVendorsRequest.type, fetchVendorsSaga);
  yield takeLatest(addVendorRequest.type, addVendorSaga);
  yield takeLatest(updateVendorRequest.type, updateVendorSaga);
  yield takeLatest(deleteVendorRequest.type, deleteVendorSaga);
}
