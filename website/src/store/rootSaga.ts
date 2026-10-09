import { all, fork } from "redux-saga/effects";
import { watchHomeSaga } from "./sagas/homeSaga";
import { watchPackagesSaga } from "./sagas/packagesSaga";
import { watchServicesSaga } from "./sagas/servicesSaga";
import { watchBlogsSaga } from "./sagas/blogsSaga";
import { watchContactSaga } from "./sagas/contactSaga";
import { watchBookingSaga } from "./sagas/bookingSaga";
import { watchAuthSaga } from "./sagas/authSaga";
import { watchWishlistSaga } from "./sagas/wishlistSaga";
import { watchAboutSaga } from "./sagas/aboutSaga";
import { watchSearchSaga } from "./sagas/searchSaga";
import { watchVendorSaga } from "./sagas/vendorSaga";
import { watchReelsSaga } from "./sagas/reelsSaga";

export function* rootSaga() {
  yield all([
    fork(watchHomeSaga),
    fork(watchPackagesSaga),
    fork(watchServicesSaga),
    fork(watchBlogsSaga),
    fork(watchContactSaga),
    fork(watchBookingSaga),
    fork(watchAuthSaga),
    fork(watchWishlistSaga),
    fork(watchAboutSaga),
    fork(watchSearchSaga),
    fork(watchVendorSaga),
    fork(watchReelsSaga),
  ]);
}


export default rootSaga;
