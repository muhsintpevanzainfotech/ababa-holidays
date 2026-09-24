import { call, put, takeLatest } from 'redux-saga/effects';
import { 
  loginRequest, loginSuccess, loginFailure, 
  registerRequest, registerSuccess, registerFailure,
  verifyOTPRequest, verifyOTPSuccess, verifyOTPFailure 
} from '../slices/authSlice';

// API functions
async function loginApi(credentials) {
  const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...credentials, appType: 'vendor' }), // Enforce vendor appType
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }
  return data;
}

async function verifyOTPApi(otpData) {
  const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(otpData),
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'OTP verification failed');
  }
  return data;
}

async function registerApi(userData) {
  const isFormData = userData instanceof FormData;
  
  if (isFormData && !userData.has('role')) {
    userData.append('role', 'Vendor');
  }

  const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/auth/register`, {
    method: 'POST',
    headers: isFormData ? {} : { 'Content-Type': 'application/json' },
    body: isFormData ? userData : JSON.stringify({ ...userData, role: 'Vendor' }),
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Registration failed');
  }
  return data;
}

function* workLogin(action) {
  try {
    const data = yield call(loginApi, action.payload);
    yield put(loginSuccess(data));
  } catch (error) {
    yield put(loginFailure(error.message));
  }
}

function* workRegister(action) {
  try {
    const data = yield call(registerApi, action.payload);
    yield put(registerSuccess(data));
  } catch (error) {
    yield put(registerFailure(error.message));
  }
}

function* workVerifyOTP(action) {
  try {
    const data = yield call(verifyOTPApi, action.payload);
    yield put(verifyOTPSuccess(data));
  } catch (error) {
    yield put(verifyOTPFailure(error.message));
  }
}

export function* authSaga() {
  yield takeLatest(loginRequest.type, workLogin);
  yield takeLatest(registerRequest.type, workRegister);
  yield takeLatest(verifyOTPRequest.type, workVerifyOTP);
}
