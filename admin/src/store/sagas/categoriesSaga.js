import { call, put, takeLatest } from 'redux-saga/effects';
import api from '../../utils/api';
import { 
  fetchCategoriesRequest, fetchCategoriesSuccess, fetchCategoriesFailure,
  addCategoryRequest, addCategorySuccess, addCategoryFailure,
  updateCategoryRequest, updateCategorySuccess, updateCategoryFailure,
  deleteCategoryRequest, deleteCategorySuccess, deleteCategoryFailure
} from '../slices/categoriesSlice';

function* fetchCategoriesSaga(action) {
  try {
    const { page = 1, limit = 10, search = '', status = 'all' } = action.payload || {};
    const response = yield call(api.get, `/categories?page=${page}&limit=${limit}&search=${search}&status=${status}`);
    yield put(fetchCategoriesSuccess(response.data));
  } catch (error) {
    yield put(fetchCategoriesFailure(error.response?.data?.message || 'Failed to fetch categories'));
  }
}

function* addCategorySaga(action) {
  try {
    const response = yield call(api.post, '/categories', action.payload);
    yield put(addCategorySuccess(response.data.data));
  } catch (error) {
    yield put(addCategoryFailure(error.response?.data?.message || 'Failed to add category'));
  }
}

function* updateCategorySaga(action) {
  const { id, data } = action.payload;
  try {
    const response = yield call(api.put, `/categories/${id}`, data);
    yield put(updateCategorySuccess(response.data.data));
  } catch (error) {
    yield put(updateCategoryFailure(error.response?.data?.message || 'Failed to update category'));
  }
}

function* deleteCategorySaga(action) {
  try {
    yield call(api.delete, `/categories/${action.payload}`);
    yield put(deleteCategorySuccess(action.payload));
  } catch (error) {
    yield put(deleteCategoryFailure(error.response?.data?.message || 'Failed to delete category'));
  }
}

export function* watchCategoriesSaga() {
  yield takeLatest(fetchCategoriesRequest.type, fetchCategoriesSaga);
  yield takeLatest(addCategoryRequest.type, addCategorySaga);
  yield takeLatest(updateCategoryRequest.type, updateCategorySaga);
  yield takeLatest(deleteCategoryRequest.type, deleteCategorySaga);
}
