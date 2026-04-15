import { call, put, takeLatest } from 'redux-saga/effects';
import api from '../../utils/api';
import {
  fetchContactMessagesRequest, fetchContactMessagesSuccess, fetchContactMessagesFailure,
  deleteContactMessageRequest, deleteContactMessageSuccess, deleteContactMessageFailure,
  updateContactMessageStatusRequest, updateContactMessageStatusSuccess, updateContactMessageStatusFailure
} from '../slices/contactUsSlice';

function* fetchContactMessagesSaga() {
  try {
    const response = yield call(api.get, '/contact-us');
    yield put(fetchContactMessagesSuccess(response.data.data));
  } catch (error) {
    yield put(fetchContactMessagesFailure(error.response?.data?.message || 'Failed to fetch contact messages'));
  }
}

function* deleteContactMessageSaga(action) {
  try {
    yield call(api.delete, `/contact-us/${action.payload}`);
    yield put(deleteContactMessageSuccess(action.payload));
  } catch (error) {
    yield put(deleteContactMessageFailure(error.response?.data?.message || 'Failed to delete contact message'));
  }
}

function* updateContactMessageStatusSaga(action) {
  const { id, status } = action.payload;
  try {
    const response = yield call(api.put, `/contact-us/${id}`, { status });
    yield put(updateContactMessageStatusSuccess(response.data.data));
  } catch (error) {
    yield put(updateContactMessageStatusFailure(error.response?.data?.message || 'Failed to update message status'));
  }
}

export function* watchContactUsSaga() {
  yield takeLatest(fetchContactMessagesRequest.type, fetchContactMessagesSaga);
  yield takeLatest(deleteContactMessageRequest.type, deleteContactMessageSaga);
  yield takeLatest(updateContactMessageStatusRequest.type, updateContactMessageStatusSaga);
}
