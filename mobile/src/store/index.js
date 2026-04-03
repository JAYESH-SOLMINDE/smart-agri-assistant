// store/index.js — Central data store for the app
import { configureStore, createSlice } from '@reduxjs/toolkit';

// ── AUTH SLICE ────────────────────────────────────────
// Stores who is logged in
const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        token: null,
        isLoggedIn: false,
        loading: false,
        error: null,
    },
    reducers: {
        setLoading: (state, action) => { state.loading = action.payload; },
        setUser: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isLoggedIn = true;
            state.error = null;
        },
        setError: (state, action) => { state.error = action.payload; },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isLoggedIn = false;
        },
    },
});

// ── DISEASE SLICE ─────────────────────────────────────
// Stores the latest disease detection result
const diseaseSlice = createSlice({
    name: 'disease',
    initialState: {
        result: null,
        history: [],
        loading: false,
        error: null,
    },
    reducers: {
        setLoading: (state, action) => { state.loading = action.payload; },
        setResult: (state, action) => {
            state.result = action.payload;
            state.loading = false;
            state.error = null;
        },
        setHistory: (state, action) => { state.history = action.payload; },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        clearResult: (state) => { state.result = null; },
    },
});

// ── WEATHER SLICE ─────────────────────────────────────
const weatherSlice = createSlice({
    name: 'weather',
    initialState: {
        current: null,
        forecast: [],
        loading: false,
        error: null,
    },
    reducers: {
        setLoading: (state, action) => { state.loading = action.payload; },
        setCurrent: (state, action) => { state.current = action.payload; state.loading = false; },
        setForecast: (state, action) => { state.forecast = action.payload; },
        setError: (state, action) => { state.error = action.payload; state.loading = false; },
    },
});

// ── IRRIGATION SLICE ──────────────────────────────────
const irrigationSlice = createSlice({
    name: 'irrigation',
    initialState: {
        recommendation: null,
        history: [],
        loading: false,
        error: null,
    },
    reducers: {
        setLoading: (state, action) => { state.loading = action.payload; },
        setRecommendation: (state, action) => {
            state.recommendation = action.payload;
            state.loading = false;
        },
        setHistory: (state, action) => { state.history = action.payload; },
        setError: (state, action) => { state.error = action.payload; state.loading = false; },
    },
});

// Export all actions
export const authActions = authSlice.actions;
export const diseaseActions = diseaseSlice.actions;
export const weatherActions = weatherSlice.actions;
export const irrigationActions = irrigationSlice.actions;

// Create the main store
const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
        disease: diseaseSlice.reducer,
        weather: weatherSlice.reducer,
        irrigation: irrigationSlice.reducer,
    },
});

export default store;