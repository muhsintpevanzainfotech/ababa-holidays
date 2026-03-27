import { call, put, takeLatest } from 'redux-saga/effects';
import api from '../../utils/api';
import { 
  fetchServicesRequest, fetchServicesSuccess, fetchServicesFailure,
  addServiceRequest, addServiceSuccess, addServiceFailure,
  updateServiceRequest, updateServiceSuccess, updateServiceFailure,
  deleteServiceRequest, deleteServiceSuccess, deleteServiceFailure
} from '../slices/servicesSlice';

function* fetchServicesSaga() {
  try {
    const response = yield call(api.get, '/services');
    yield put(fetchServicesSuccess(response.data.data));
  } catch (error) {
    yield put(fetchServicesFailure(error.response?.data?.message || 'Failed to fetch services'));
  }
}

function* addServiceSaga(action) {
  try {
    const response = yield call(api.post, '/services', action.payload);
    yield put(addServiceSuccess(response.data.data));
  } catch (error) {
    yield put(addServiceFailure(error.response?.data?.message || 'Failed to add service'));
  }
}

function* updateServiceSaga(action) {
  const { id, data } = action.payload;
  try {
    const response = yield call(api.put, `/services/${id}`, data);
    yield put(updateServiceSuccess(response.data.data));
  } catch (error) {
    yield put(updateServiceFailure(error.response?.data?.message || 'Failed to update service'));
  }
}

function* deleteServiceSaga(action) {
  try {
    yield call(api.delete, `/services/${action.payload}`);
    yield put(deleteServiceSuccess(action.payload));
  } catch (error) {
    yield put(deleteServiceFailure(error.response?.data?.message || 'Failed to delete service'));
  }
}

export function* watchServicesSaga() {
  yield takeLatest(fetchServicesRequest.type, fetchServicesSaga);
  yield takeLatest(addServiceRequest.type, addServiceSaga);
  yield takeLatest(updateServiceRequest.type, updateServiceSaga);
  yield takeLatest(deleteServiceRequest.type, deleteServiceSaga);
}
