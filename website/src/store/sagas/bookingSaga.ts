import { call, put, takeLatest } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import { createBookingApi, getUserBookingsApi } from "@/api/endpoints";
import {
  createBookingStart,
  createBookingSuccess,
  createBookingFailure,
  fetchUserBookingsStart,
  fetchUserBookingsSuccess,
  fetchUserBookingsFailure,
} from "../slices/bookingSlice";

function* handleCreateBooking(action: PayloadAction<Record<string, unknown>>): Generator<any, void, any> {
  try {
    const res = yield call(createBookingApi, action.payload);
    yield put(
      createBookingSuccess({
        bookingId: res.bookingId || "BK-" + Math.floor(100000 + Math.random() * 900000),
        message: res.message || "Booking created successfully",
      })
    );
  } catch (error: any) {
    yield put(createBookingFailure(error.message || "Failed to create booking"));
  }
}

function* handleFetchUserBookings(): Generator<any, void, any> {
  try {
    const data = yield call(getUserBookingsApi);
    yield put(fetchUserBookingsSuccess(data));
  } catch (error: any) {
    yield put(fetchUserBookingsFailure(error.message || "Failed to fetch user bookings"));
  }
}

export function* watchBookingSaga() {
  yield takeLatest(createBookingStart.type, handleCreateBooking);
  yield takeLatest(fetchUserBookingsStart.type, handleFetchUserBookings);
}
