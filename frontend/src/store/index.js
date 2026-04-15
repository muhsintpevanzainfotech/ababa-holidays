import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import authReducer from './slices/authSlice';
import usersReducer from './slices/usersSlice';
import staffReducer from './slices/staffSlice';
import vendorsReducer from './slices/vendorsSlice';
import categoriesReducer from './slices/categoriesSlice';
import servicesReducer from './slices/servicesSlice';
import subServicesReducer from './slices/subServicesSlice';
import packagesReducer from './slices/packagesSlice';
import { countriesReducer, statesReducer, destinationsReducer } from './slices/locationsSlice';
import subscriptionsReducer from './slices/subscriptionsSlice';
import bannersReducer from './slices/bannersSlice';
import blogsReducer from './slices/blogsSlice';
import testimonialsReducer from './slices/testimonialsSlice';
import bookingsReducer from './slices/bookingsSlice';
import paymentsReducer from './slices/paymentsSlice';
import complaintsReducer from './slices/complaintsSlice';
import brandsReducer from './slices/brandsSlice';
import globalReducer from './slices/globalSlice';
import reelsReducer from './slices/reelsSlice';
import enquiriesReducer from './slices/enquiriesSlice';
import contactUsReducer from './slices/contactUsSlice';
import rootSaga from './rootSaga';

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    staff: staffReducer,
    vendors: vendorsReducer,
    categories: categoriesReducer,
    services: servicesReducer,
    subServices: subServicesReducer,
    packages: packagesReducer,
    countries: countriesReducer,
    states: statesReducer,
    destinations: destinationsReducer,
    subscriptions: subscriptionsReducer,
    banners: bannersReducer,
    blogs: blogsReducer,
    testimonials: testimonialsReducer,
    bookings: bookingsReducer,
    payments: paymentsReducer,
    complaints: complaintsReducer,
    brands: brandsReducer,
    global: globalReducer,
    reels: reelsReducer,
    enquiries: enquiriesReducer,
    contactUs: contactUsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: true, serializableCheck: false }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);
