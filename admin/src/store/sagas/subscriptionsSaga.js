import { call, put, takeLatest } from 'redux-saga/effects';
import api from '../../utils/api';
import { 
  fetchSubscriptionsRequest, fetchSubscriptionsSuccess, fetchSubscriptionsFailure,
  addSubscriptionRequest, addSubscriptionSuccess, addSubscriptionFailure,
  updateSubscriptionRequest, updateSubscriptionSuccess, updateSubscriptionFailure,
  deleteSubscriptionRequest, deleteSubscriptionSuccess, deleteSubscriptionFailure
} from '../slices/subscriptionsSlice';

function* fetchSubscriptionsSaga() {
  try {
    const response = yield call(api.get, '/subscriptions');
    yield put(fetchSubscriptionsSuccess(response.data.data));
  } catch (error) {
    yield put(fetchSubscriptionsFailure(error.response?.data?.message || 'Failed to fetch subscriptions'));
  }
}

function* addSubscriptionSaga(action) {
  try {
    const response = yield call(api.post, '/subscriptions', action.payload);
    yield put(addSubscriptionSuccess(response.data.data));
  } catch (error) {
    yield put(addSubscriptionFailure(error.response?.data?.message || 'Failed to add subscription'));
  }
}

function* updateSubscriptionSaga(action) {
  const { id, data } = action.payload;
  try {
    const response = yield call(api.put, `/subscriptions/${id}`, data);
    yield put(updateSubscriptionSuccess(response.data.data));
  } catch (error) {
    yield put(updateSubscriptionFailure(error.response?.data?.message || 'Failed to update subscription'));
  }
}

function* deleteSubscriptionSaga(action) {
  try {
    yield call(api.delete, `/subscriptions/${action.payload}`);
    yield put(deleteSubscriptionSuccess(action.payload));
  } catch (error) {
    yield put(deleteSubscriptionFailure(error.response?.data?.message || 'Failed to delete subscription'));
  }
}

export function* watchSubscriptionsSaga() {
  yield takeLatest(fetchSubscriptionsRequest.type, fetchSubscriptionsSaga);
  yield takeLatest(addSubscriptionRequest.type, addSubscriptionSaga);
  yield takeLatest(updateSubscriptionRequest.type, updateSubscriptionSaga);
  yield takeLatest(deleteSubscriptionRequest.type, deleteSubscriptionSaga);
}
