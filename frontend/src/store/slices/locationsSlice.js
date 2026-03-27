import { createSlice } from '@reduxjs/toolkit';

// Countries Slice
const countriesInitialState = {
  countries: [],
  loading: false,
  error: null,
};

const countriesSlice = createSlice({
  name: 'countries',
  initialState: countriesInitialState,
  reducers: {
    fetchCountriesRequest: (state) => { state.loading = true; state.error = null; },
    fetchCountriesSuccess: (state, action) => { state.loading = false; state.countries = action.payload; },
    fetchCountriesFailure: (state, action) => { state.loading = false; state.error = action.payload; },
    addCountryRequest: (state) => { state.loading = true; },
    addCountrySuccess: (state, action) => { state.loading = false; state.countries = [action.payload, ...state.countries]; },
    addCountryFailure: (state, action) => { state.loading = false; state.error = action.payload; },
    updateCountryRequest: (state) => { state.loading = true; },
    updateCountrySuccess: (state, action) => {
      state.loading = false;
      state.countries = state.countries.map(c => c._id === action.payload._id ? action.payload : c);
    },
    updateCountryFailure: (state, action) => { state.loading = false; state.error = action.payload; },
    deleteCountryRequest: (state) => { state.loading = true; },
    deleteCountrySuccess: (state, action) => {
      state.loading = false;
      state.countries = state.countries.filter(c => c._id !== action.payload);
    },
    deleteCountryFailure: (state, action) => { state.loading = false; state.error = action.payload; }
  }
});

// States Slice
const statesInitialState = {
  states: [],
  loading: false,
  error: null,
};

const statesSlice = createSlice({
  name: 'states',
  initialState: statesInitialState,
  reducers: {
    fetchStatesRequest: (state) => { state.loading = true; state.error = null; },
    fetchStatesSuccess: (state, action) => { state.loading = false; state.states = action.payload; },
    fetchStatesFailure: (state, action) => { state.loading = false; state.error = action.payload; },
    addStateRequest: (state) => { state.loading = true; },
    addStateSuccess: (state, action) => { state.loading = false; state.states = [action.payload, ...state.states]; },
    addStateFailure: (state, action) => { state.loading = false; state.error = action.payload; },
    updateStateRequest: (state) => { state.loading = true; },
    updateStateSuccess: (state, action) => {
      state.loading = false;
      state.states = state.states.map(s => s._id === action.payload._id ? action.payload : s);
    },
    updateStateFailure: (state, action) => { state.loading = false; state.error = action.payload; },
    deleteStateRequest: (state) => { state.loading = true; },
    deleteStateSuccess: (state, action) => {
      state.loading = false;
      state.states = state.states.filter(s => s._id !== action.payload);
    },
    deleteStateFailure: (state, action) => { state.loading = false; state.error = action.payload; }
  }
});

// Destinations Slice
const destinationsInitialState = {
  destinations: [],
  loading: false,
  error: null,
};

const destinationsSlice = createSlice({
  name: 'destinations',
  initialState: destinationsInitialState,
  reducers: {
    fetchDestinationsRequest: (state) => { state.loading = true; state.error = null; },
    fetchDestinationsSuccess: (state, action) => { state.loading = false; state.destinations = action.payload; },
    fetchDestinationsFailure: (state, action) => { state.loading = false; state.error = action.payload; },
    addDestinationRequest: (state) => { state.loading = true; },
    addDestinationSuccess: (state, action) => { state.loading = false; state.destinations = [action.payload, ...state.destinations]; },
    addDestinationFailure: (state, action) => { state.loading = false; state.error = action.payload; },
    updateDestinationRequest: (state) => { state.loading = true; },
    updateDestinationSuccess: (state, action) => {
      state.loading = false;
      state.destinations = state.destinations.map(d => d._id === action.payload._id ? action.payload : d);
    },
    updateDestinationFailure: (state, action) => { state.loading = false; state.error = action.payload; },
    deleteDestinationRequest: (state) => { state.loading = true; },
    deleteDestinationSuccess: (state, action) => {
      state.loading = false;
      state.destinations = state.destinations.filter(d => d._id !== action.payload);
    },
    deleteDestinationFailure: (state, action) => { state.loading = false; state.error = action.payload; }
  }
});

export const {
  fetchCountriesRequest, fetchCountriesSuccess, fetchCountriesFailure,
  addCountryRequest, addCountrySuccess, addCountryFailure,
  updateCountryRequest, updateCountrySuccess, updateCountryFailure,
  deleteCountryRequest, deleteCountrySuccess, deleteCountryFailure
} = countriesSlice.actions;

export const {
  fetchStatesRequest, fetchStatesSuccess, fetchStatesFailure,
  addStateRequest, addStateSuccess, addStateFailure,
  updateStateRequest, updateStateSuccess, updateStateFailure,
  deleteStateRequest, deleteStateSuccess, deleteStateFailure
} = statesSlice.actions;

export const {
  fetchDestinationsRequest, fetchDestinationsSuccess, fetchDestinationsFailure,
  addDestinationRequest, addDestinationSuccess, addDestinationFailure,
  updateDestinationRequest, updateDestinationSuccess, updateDestinationFailure,
  deleteDestinationRequest, deleteDestinationSuccess, deleteDestinationFailure
} = destinationsSlice.actions;

export const countriesReducer = countriesSlice.reducer;
export const statesReducer = statesSlice.reducer;
export const destinationsReducer = destinationsSlice.reducer;
