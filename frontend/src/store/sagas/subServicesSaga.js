import { call, put, takeLatest } from 'redux-saga/effects';
import api from '../../utils/api';
import { 
  fetchSubServicesRequest, fetchSubServicesSuccess, fetchSubServicesFailure,
  addSubServiceRequest, addSubServiceSuccess, addSubServiceFailure,
  updateSubServiceRequest, updateSubServiceSuccess, updateSubServiceFailure,
  deleteSubServiceRequest, deleteSubServiceSuccess, deleteSubServiceFailure
} from '../slices/subServicesSlice';

function* fetchSubServicesSaga() {
  try {
    const response = yield call(api.get, '/sub-services');
    yield put(fetchSubServicesSuccess(response.data.data));
  } catch (error) {
    yield put(fetchSubServicesFailure(error.response?.data?.message || 'Failed to fetch sub-services'));
  }
}

function* addSubServiceSaga(action) {
  try {
    const response = yield call(api.post, '/sub-services', action.payload);
    yield put(addSubServiceSuccess(response.data.data));
  } catch (error) {
    yield put(addSubServiceFailure(error.response?.data?.message || 'Failed to add sub-service'));
  }
}

function* updateSubServiceSaga(action) {
  const { id, data } = action.payload;
  try {
    const response = yield call(api.put, `/sub-services/${id}`, data);
    yield put(updateSubServiceSuccess(response.data.data));
  } catch (error) {
    yield put(updateSubServiceFailure(error.response?.data?.message || 'Failed to update sub-service'));
  }
}

function* deleteSubServiceSaga(action) {
  try {
    yield call(api.delete, `/sub-services/${action.payload}`);
    yield put(deleteSubServiceSuccess(action.payload));
  } catch (error) {
    yield put(deleteSubServiceFailure(error.response?.data?.message || 'Failed to delete sub-service'));
  }
}

export function* watchSubServicesSaga() {
  yield takeLatest(fetchSubServicesRequest.type, fetchSubServicesSaga);
  yield takeLatest(addSubServiceRequest.type, addSubServiceSaga);
  yield takeLatest(updateSubServiceRequest.type, updateSubServiceSaga);
  yield takeLatest(deleteSubServiceRequest.type, deleteSubServiceSaga);
}
