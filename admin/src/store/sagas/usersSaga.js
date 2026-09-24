import { call, put, takeLatest } from 'redux-saga/effects';
import api from '../../utils/api';
import { 
  fetchUsersRequest, fetchUsersSuccess, fetchUsersFailure,
  addUserRequest, addUserSuccess, addUserFailure,
  updateUserRequest, updateUserSuccess, updateUserFailure,
  deleteUserRequest, deleteUserSuccess, deleteUserFailure,
  updateUserStatusRequest, updateUserStatusSuccess, updateUserStatusFailure
} from '../slices/usersSlice';

function* fetchUsersSaga() {
  try {
    const response = yield call(api.get, '/users');
    yield put(fetchUsersSuccess(response.data.data)); // The API returns wrapped in .data
  } catch (error) {
    yield put(fetchUsersFailure(error.response?.data?.message || 'Failed to fetch users'));
  }
}

function* addUserSaga(action) {
  try {
    const response = yield call(api.post, '/users', action.payload);
    yield put(addUserSuccess(response.data.data));
  } catch (error) {
    yield put(addUserFailure(error.response?.data?.message || 'Failed to add user'));
  }
}

function* updateUserSaga(action) {
  const { id, data } = action.payload;
  try {
    const response = yield call(api.put, `/users/${id}`, data);
    yield put(updateUserSuccess(response.data.data));
  } catch (error) {
    yield put(updateUserFailure(error.response?.data?.message || 'Failed to update user'));
  }
}

function* deleteUserSaga(action) {
  try {
    yield call(api.delete, `/users/${action.payload}`);
    yield put(deleteUserSuccess(action.payload));
  } catch (error) {
    yield put(deleteUserFailure(error.response?.data?.message || 'Failed to delete user'));
  }
}

function* updateUserStatusSaga(action) {
  const { id, isSuspended } = action.payload;
  try {
    const response = yield call(api.put, `/users/${id}/suspend`, { isSuspended });
    yield put(updateUserStatusSuccess({ _id: id, isSuspended }));
  } catch (error) {
    yield put(updateUserStatusFailure(error.response?.data?.message || 'Failed to update user status'));
  }
}

export function* watchUsersSaga() {
  yield takeLatest(fetchUsersRequest.type, fetchUsersSaga);
  yield takeLatest(addUserRequest.type, addUserSaga);
  yield takeLatest(updateUserRequest.type, updateUserSaga);
  yield takeLatest(deleteUserRequest.type, deleteUserSaga);
  yield takeLatest(updateUserStatusRequest.type, updateUserStatusSaga);
}
