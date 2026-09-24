import { call, put, takeLatest } from 'redux-saga/effects';
import api from '../../utils/api';
import {
  fetchEnquiriesRequest, fetchEnquiriesSuccess, fetchEnquiriesFailure,
  deleteEnquiryRequest, deleteEnquirySuccess, deleteEnquiryFailure,
  updateEnquiryStatusRequest, updateEnquiryStatusSuccess, updateEnquiryStatusFailure,
  addFollowUpRequest, addFollowUpSuccess, addFollowUpFailure
} from '../slices/enquiriesSlice';

function* fetchEnquiriesSaga() {
  try {
    const response = yield call(api.get, '/enquiries');
    yield put(fetchEnquiriesSuccess(response.data.data));
  } catch (error) {
    yield put(fetchEnquiriesFailure(error.response?.data?.message || 'Failed to fetch enquiries'));
  }
}

function* deleteEnquirySaga(action) {
  try {
    yield call(api.delete, `/enquiries/${action.payload}`);
    yield put(deleteEnquirySuccess(action.payload));
  } catch (error) {
    yield put(deleteEnquiryFailure(error.response?.data?.message || 'Failed to delete enquiry'));
  }
}

function* updateEnquiryStatusSaga(action) {
  const { id, status } = action.payload;
  try {
    const response = yield call(api.put, `/enquiries/${id}`, { status });
    yield put(updateEnquiryStatusSuccess(response.data.data));
  } catch (error) {
    yield put(updateEnquiryStatusFailure(error.response?.data?.message || 'Failed to update enquiry status'));
  }
}

function* addFollowUpSaga(action) {
  const { id, note, status } = action.payload;
  try {
    const response = yield call(api.post, `/enquiries/${id}/follow-up`, { note, status });
    yield put(addFollowUpSuccess(response.data.data));
  } catch (error) {
    yield put(addFollowUpFailure(error.response?.data?.message || 'Failed to add follow up'));
  }
}

export function* watchEnquiriesSaga() {
  yield takeLatest(fetchEnquiriesRequest.type, fetchEnquiriesSaga);
  yield takeLatest(deleteEnquiryRequest.type, deleteEnquirySaga);
  yield takeLatest(updateEnquiryStatusRequest.type, updateEnquiryStatusSaga);
  yield takeLatest(addFollowUpRequest.type, addFollowUpSaga);
}
