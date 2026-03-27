import { call, put, takeLatest, all } from 'redux-saga/effects';
import api from '../../utils/api';
import {
  fetchCountriesRequest, fetchCountriesSuccess, fetchCountriesFailure,
  addCountryRequest, addCountrySuccess, addCountryFailure,
  updateCountryRequest, updateCountrySuccess, updateCountryFailure,
  deleteCountryRequest, deleteCountrySuccess, deleteCountryFailure,
  fetchStatesRequest, fetchStatesSuccess, fetchStatesFailure,
  addStateRequest, addStateSuccess, addStateFailure,
  updateStateRequest, updateStateSuccess, updateStateFailure,
  deleteStateRequest, deleteStateSuccess, deleteStateFailure,
  fetchDestinationsRequest, fetchDestinationsSuccess, fetchDestinationsFailure,
  addDestinationRequest, addDestinationSuccess, addDestinationFailure,
  updateDestinationRequest, updateDestinationSuccess, updateDestinationFailure,
  deleteDestinationRequest, deleteDestinationSuccess, deleteDestinationFailure
} from '../slices/locationsSlice';

// Countries Sagas
function* fetchCountriesSaga() {
  try {
    const response = yield call(api.get, '/countries');
    yield put(fetchCountriesSuccess(response.data.data));
  } catch (error) {
    yield put(fetchCountriesFailure(error.response?.data?.message || 'Failed to fetch countries'));
  }
}

function* addCountrySaga(action) {
  try {
    const response = yield call(api.post, '/countries', action.payload);
    yield put(addCountrySuccess(response.data.data));
  } catch (error) {
    yield put(addCountryFailure(error.response?.data?.message || 'Failed to add country'));
  }
}

function* updateCountrySaga(action) {
  const { id, data } = action.payload;
  try {
    const response = yield call(api.put, `/countries/${id}`, data);
    yield put(updateCountrySuccess(response.data.data));
  } catch (error) {
    yield put(updateCountryFailure(error.response?.data?.message || 'Failed to update country'));
  }
}

function* deleteCountrySaga(action) {
  try {
    yield call(api.delete, `/countries/${action.payload}`);
    yield put(deleteCountrySuccess(action.payload));
  } catch (error) {
    yield put(deleteCountryFailure(error.response?.data?.message || 'Failed to delete country'));
  }
}

// States Sagas
function* fetchStatesSaga() {
  try {
    const response = yield call(api.get, '/states');
    yield put(fetchStatesSuccess(response.data.data));
  } catch (error) {
    yield put(fetchStatesFailure(error.response?.data?.message || 'Failed to fetch states'));
  }
}

function* addStateSaga(action) {
  try {
    const response = yield call(api.post, '/states', action.payload);
    yield put(addStateSuccess(response.data.data));
  } catch (error) {
    yield put(addStateFailure(error.response?.data?.message || 'Failed to add state'));
  }
}

function* updateStateSaga(action) {
  const { id, data } = action.payload;
  try {
    const response = yield call(api.put, `/states/${id}`, data);
    yield put(updateStateSuccess(response.data.data));
  } catch (error) {
    yield put(updateStateFailure(error.response?.data?.message || 'Failed to update state'));
  }
}

function* deleteStateSaga(action) {
  try {
    yield call(api.delete, `/states/${action.payload}`);
    yield put(deleteStateSuccess(action.payload));
  } catch (error) {
    yield put(deleteStateFailure(error.response?.data?.message || 'Failed to delete state'));
  }
}

// Destinations Sagas
function* fetchDestinationsSaga() {
  try {
    const response = yield call(api.get, '/destinations');
    yield put(fetchDestinationsSuccess(response.data.data));
  } catch (error) {
    yield put(fetchDestinationsFailure(error.response?.data?.message || 'Failed to fetch destinations'));
  }
}

function* addDestinationSaga(action) {
  try {
    const response = yield call(api.post, '/destinations', action.payload);
    yield put(addDestinationSuccess(response.data.data));
  } catch (error) {
    yield put(addDestinationFailure(error.response?.data?.message || 'Failed to add destination'));
  }
}

function* updateDestinationSaga(action) {
  const { id, data } = action.payload;
  try {
    const response = yield call(api.put, `/destinations/${id}`, data);
    yield put(updateDestinationSuccess(response.data.data));
  } catch (error) {
    yield put(updateDestinationFailure(error.response?.data?.message || 'Failed to update destination'));
  }
}

function* deleteDestinationSaga(action) {
  try {
    yield call(api.delete, `/destinations/${action.payload}`);
    yield put(deleteDestinationSuccess(action.payload));
  } catch (error) {
    yield put(deleteDestinationFailure(error.response?.data?.message || 'Failed to delete destination'));
  }
}

export function* watchLocationsSaga() {
  yield all([
    takeLatest(fetchCountriesRequest.type, fetchCountriesSaga),
    takeLatest(addCountryRequest.type, addCountrySaga),
    takeLatest(updateCountryRequest.type, updateCountrySaga),
    takeLatest(deleteCountryRequest.type, deleteCountrySaga),
    
    takeLatest(fetchStatesRequest.type, fetchStatesSaga),
    takeLatest(addStateRequest.type, addStateSaga),
    takeLatest(updateStateRequest.type, updateStateSaga),
    takeLatest(deleteStateRequest.type, deleteStateSaga),
    
    takeLatest(fetchDestinationsRequest.type, fetchDestinationsSaga),
    takeLatest(addDestinationRequest.type, addDestinationSaga),
    takeLatest(updateDestinationRequest.type, updateDestinationSaga),
    takeLatest(deleteDestinationRequest.type, deleteDestinationSaga),
  ]);
}
