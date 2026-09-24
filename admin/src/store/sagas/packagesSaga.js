import { call, put, takeLatest } from 'redux-saga/effects';
import api from '../../utils/api';
import { 
  fetchPackagesRequest, fetchPackagesSuccess, fetchPackagesFailure,
  addPackageRequest, addPackageSuccess, addPackageFailure,
  updatePackageRequest, updatePackageSuccess, updatePackageFailure,
  deletePackageRequest, deletePackageSuccess, deletePackageFailure
} from '../slices/packagesSlice';

function* fetchPackagesSaga() {
  try {
    const response = yield call(api.get, '/packages');
    yield put(fetchPackagesSuccess(response.data.data));
  } catch (error) {
    yield put(fetchPackagesFailure(error.response?.data?.message || 'Failed to fetch packages'));
  }
}

function* addPackageSaga(action) {
  try {
    const response = yield call(api.post, '/packages', action.payload);
    yield put(addPackageSuccess(response.data.data));
  } catch (error) {
    yield put(addPackageFailure(error.response?.data?.message || 'Failed to add package'));
  }
}

function* updatePackageSaga(action) {
  const { id, data } = action.payload;
  try {
    const response = yield call(api.put, `/packages/${id}`, data);
    yield put(updatePackageSuccess(response.data.data));
  } catch (error) {
    yield put(updatePackageFailure(error.response?.data?.message || 'Failed to update package'));
  }
}

function* deletePackageSaga(action) {
  try {
    yield call(api.delete, `/packages/${action.payload}`);
    yield put(deletePackageSuccess(action.payload));
  } catch (error) {
    yield put(deletePackageFailure(error.response?.data?.message || 'Failed to delete package'));
  }
}

export function* watchPackagesSaga() {
  yield takeLatest(fetchPackagesRequest.type, fetchPackagesSaga);
  yield takeLatest(addPackageRequest.type, addPackageSaga);
  yield takeLatest(updatePackageRequest.type, updatePackageSaga);
  yield takeLatest(deletePackageRequest.type, deletePackageSaga);
}
