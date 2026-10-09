import { combineReducers } from "@reduxjs/toolkit";
import homeReducer from "./slices/homeSlice";
import packagesReducer from "./slices/packagesSlice";
import servicesReducer from "./slices/servicesSlice";
import blogsReducer from "./slices/blogsSlice";
import contactReducer from "./slices/contactSlice";
import bookingReducer from "./slices/bookingSlice";
import authReducer from "./slices/authSlice";
import wishlistReducer from "./slices/wishlistSlice";
import aboutReducer from "./slices/aboutSlice";
import searchReducer from "./slices/searchSlice";
import vendorReducer from "./slices/vendorSlice";
import reelsReducer from "./slices/reelsSlice";

export const rootReducer = combineReducers({
  home: homeReducer,
  packages: packagesReducer,
  services: servicesReducer,
  blogs: blogsReducer,
  contact: contactReducer,
  booking: bookingReducer,
  auth: authReducer,
  wishlist: wishlistReducer,
  about: aboutReducer,
  search: searchReducer,
  vendor: vendorReducer,
  reels: reelsReducer,
});


export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
