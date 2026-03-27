import { all, fork } from 'redux-saga/effects';
import { watchUsersSaga } from './sagas/usersSaga';
import { watchStaffSaga } from './sagas/staffSaga';
import { watchVendorsSaga } from './sagas/vendorsSaga';
import { watchCategoriesSaga } from './sagas/categoriesSaga';
import { watchServicesSaga } from './sagas/servicesSaga';
import { watchSubServicesSaga } from './sagas/subServicesSaga';
import { watchPackagesSaga } from './sagas/packagesSaga';
import { watchLocationsSaga } from './sagas/locationsSaga';
import { watchSubscriptionsSaga } from './sagas/subscriptionsSaga';
import { watchBannersSaga } from './sagas/bannersSaga';
import { watchBlogsSaga } from './sagas/blogsSaga';
import { watchTestimonialsSaga } from './sagas/testimonialsSaga';
import { watchBookingsSaga } from './sagas/bookingsSaga';
import { watchPaymentsSaga } from './sagas/paymentsSaga';

export default function* rootSaga() {
  yield all([
    fork(watchUsersSaga),
    fork(watchStaffSaga),
    fork(watchVendorsSaga),
    fork(watchCategoriesSaga),
    fork(watchServicesSaga),
    fork(watchSubServicesSaga),
    fork(watchPackagesSaga),
    fork(watchLocationsSaga),
    fork(watchSubscriptionsSaga),
    fork(watchBannersSaga),
    fork(watchBlogsSaga),
    fork(watchTestimonialsSaga),
    fork(watchBookingsSaga),
    fork(watchPaymentsSaga),
  ]);
}
