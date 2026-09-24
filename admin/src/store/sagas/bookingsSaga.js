import { call, put, takeLatest } from 'redux-saga/effects';
import api from '../../utils/api';
import { 
  fetchBookingsRequest, fetchBookingsSuccess, fetchBookingsFailure,
  updateBookingStatusRequest, updateBookingStatusSuccess, updateBookingStatusFailure,
  deleteBookingRequest, deleteBookingSuccess, deleteBookingFailure
} from '../slices/bookingsSlice';

function* fetchBookingsSaga() {
  try {
    const response = yield call(api.get, '/bookings');
    yield put(fetchBookingsSuccess(response.data.data));
  } catch (error) {
    yield put(fetchBookingsFailure(error.response?.data?.message || 'Failed to fetch bookings'));
  }
}

function* updateBookingStatusSaga(action) {
  const { id, status } = action.payload;
  try {
    const response = yield call(api.put, `/bookings/${id}`, { bookingStatus: status });
    yield put(updateBookingStatusSuccess(response.data.data));
  } catch (error) {
    yield put(updateBookingStatusFailure(error.response?.data?.message || 'Failed to update booking status'));
  }
}

function* deleteBookingSaga(action) {
  try {
    yield call(api.delete, `/bookings/${action.payload}`);
    yield put(deleteBookingSuccess(action.payload));
  } catch (error) {
    yield put(deleteBookingFailure(error.response?.data?.message || 'Failed to delete booking'));
  }
}

export function* watchBookingsSaga() {
  yield takeLatest(fetchBookingsRequest.type, fetchBookingsSaga);
  yield takeLatest(updateBookingStatusRequest.type, updateBookingStatusSaga);
  yield takeLatest(deleteBookingRequest.type, deleteBookingSaga);
}
