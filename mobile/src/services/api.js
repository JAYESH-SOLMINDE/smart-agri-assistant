// api.js — All API calls to our backend in one place
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create an axios instance with our backend URL
const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL,
    timeout: 30000, // 30 seconds
});

// Before every request, attach the user's token automatically
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── AUTH ──────────────────────────────────────────────
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getProfile: () => api.get('/auth/profile'),
    updateFcmToken: (token) => api.put('/auth/fcm-token', { fcmToken: token }),
};

// ── DISEASE DETECTION ─────────────────────────────────
export const diseaseAPI = {
    // imageUri = path to the photo on the phone
    detect: (imageUri, cropType) => {
        const formData = new FormData();
        formData.append('image', {
            uri: imageUri,
            type: 'image/jpeg',
            name: 'leaf.jpg',
        });
        formData.append('cropType', cropType);
        return api.post('/disease/detect', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    getHistory: () => api.get('/disease/history'),
    getTreatment: (name) => api.get(`/disease/treatments/${name}`),
};

// ── IRRIGATION ────────────────────────────────────────
export const irrigationAPI = {
    getRecommendation: (data) => api.post('/irrigation/recommend', data),
    getHistory: () => api.get('/irrigation/history'),
};

// ── WEATHER ───────────────────────────────────────────
export const weatherAPI = {
    getCurrent: (lat, lon) => api.get(`/weather/current?lat=${lat}&lon=${lon}`),
    getForecast: (lat, lon) => api.get(`/weather/forecast?lat=${lat}&lon=${lon}`),
};

export default api;