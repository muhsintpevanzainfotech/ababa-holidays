import { call, put, takeLatest } from 'redux-saga/effects';
import api from '../../utils/api';
import { 
  fetchBannersRequest, fetchBannersSuccess, fetchBannersFailure,
  addBannerRequest, addBannerSuccess, addBannerFailure,
  updateBannerRequest, updateBannerSuccess, updateBannerFailure,
  deleteBannerRequest, deleteBannerSuccess, deleteBannerFailure,
  toggleBannerStatusRequest, toggleBannerStatusSuccess, toggleBannerStatusFailure
} from '../slices/bannersSlice';

function* fetchBannersSaga(action) {
  try {
    const role = action.payload || 'Admin';
    const url = role === 'Vendor' ? '/banners/vendor' : '/banners/admin';
    const response = yield call(api.get, url);
    yield put(fetchBannersSuccess(response.data.data));
  } catch (error) {
    yield put(fetchBannersFailure(error.response?.data?.message || 'Failed to fetch banners'));
  }
}

function* addBannerSaga(action) {
  try {
    const response = yield call(api.post, '/banners', action.payload);
    yield put(addBannerSuccess(response.data.data));
  } catch (error) {
    yield put(addBannerFailure(error.response?.data?.message || 'Failed to add banner'));
  }
}

function* updateBannerSaga(action) {
  const { id, data } = action.payload;
  try {
    const response = yield call(api.put, `/banners/${id}`, data);
    yield put(updateBannerSuccess(response.data.data));
  } catch (error) {
    yield put(updateBannerFailure(error.response?.data?.message || 'Failed to update banner'));
  }
}

function* deleteBannerSaga(action) {
  try {
    yield call(api.delete, `/banners/${action.payload}`);
    yield put(deleteBannerSuccess(action.payload));
  } catch (error) {
    yield put(deleteBannerFailure(error.response?.data?.message || 'Failed to delete banner'));
  }
}

function* toggleBannerStatusSaga(action) {
  try {
    const response = yield call(api.put, `/banners/${action.payload}/toggle`, {});
    yield put(toggleBannerStatusSuccess(response.data.data));
  } catch (error) {
    yield put(toggleBannerStatusFailure(error.response?.data?.message || 'Failed to toggle banner status'));
  }
}

export function* watchBannersSaga() {
  yield takeLatest(fetchBannersRequest.type, fetchBannersSaga);
  yield takeLatest(addBannerRequest.type, addBannerSaga);
  yield takeLatest(updateBannerRequest.type, updateBannerSaga);
  yield takeLatest(deleteBannerRequest.type, deleteBannerSaga);
  yield takeLatest(toggleBannerStatusRequest.type, toggleBannerStatusSaga);
}
