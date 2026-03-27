import { call, put, takeLatest } from 'redux-saga/effects';
import { loginRequest, loginSuccess, loginFailure } from '../slices/authSlice';

// Mock API login function (Replace with real API call)
async function loginApi(credentials) {
  const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }
  
  return await response.json();
}

function* workLogin(action) {
  try {
    const data = yield call(loginApi, action.payload);
    yield put(loginSuccess(data));
  } catch (error) {
    yield put(loginFailure(error.message));
  }
}

export function* authSaga() {
  yield takeLatest(loginRequest.type, workLogin);
}
