import { call, put, takeLatest } from 'redux-saga/effects';
import api from '../../utils/api';
import { 
  fetchBrandsRequest, fetchBrandsSuccess, fetchBrandsFailure,
  addBrandRequest, addBrandSuccess, addBrandFailure,
  updateBrandRequest, updateBrandSuccess, updateBrandFailure,
  deleteBrandRequest, deleteBrandSuccess, deleteBrandFailure
} from '../slices/brandsSlice';

function* fetchBrandsSaga() {
  try {
    const response = yield call(api.get, '/brands');
    yield put(fetchBrandsSuccess(response.data.data));
  } catch (error) {
    yield put(fetchBrandsFailure(error.response?.data?.message || 'Failed to fetch brands'));
  }
}

function* addBrandSaga(action) {
  try {
    const response = yield call(api.post, '/brands', action.payload);
    yield put(addBrandSuccess(response.data.data));
  } catch (error) {
    yield put(addBrandFailure(error.response?.data?.message || 'Failed to add brand'));
  }
}

function* updateBrandSaga(action) {
  const { id, data } = action.payload;
  try {
    const response = yield call(api.put, `/brands/${id}`, data);
    yield put(updateBrandSuccess(response.data.data));
  } catch (error) {
    yield put(updateBrandFailure(error.response?.data?.message || 'Failed to update brand'));
  }
}

function* deleteBrandSaga(action) {
  try {
    yield call(api.delete, `/brands/${action.payload}`);
    yield put(deleteBrandSuccess(action.payload));
  } catch (error) {
    yield put(deleteBrandFailure(error.response?.data?.message || 'Failed to delete brand'));
  }
}

export function* watchBrandsSaga() {
  yield takeLatest(fetchBrandsRequest.type, fetchBrandsSaga);
  yield takeLatest(addBrandRequest.type, addBrandSaga);
  yield takeLatest(updateBrandRequest.type, updateBrandSaga);
  yield takeLatest(deleteBrandRequest.type, deleteBrandSaga);
}
