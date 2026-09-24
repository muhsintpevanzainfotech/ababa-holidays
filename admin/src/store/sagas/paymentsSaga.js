import { call, put, takeLatest } from 'redux-saga/effects';
import api from '../../utils/api';
import { 
  fetchPaymentsRequest, fetchPaymentsSuccess, fetchPaymentsFailure 
} from '../slices/paymentsSlice';

function* fetchPaymentsSaga() {
  try {
    const response = yield call(api.get, '/payments');
    yield put(fetchPaymentsSuccess(response.data.data));
  } catch (error) {
    yield put(fetchPaymentsFailure(error.response?.data?.message || 'Failed to fetch payments'));
  }
}

export function* watchPaymentsSaga() {
  yield takeLatest(fetchPaymentsRequest.type, fetchPaymentsSaga);
}
