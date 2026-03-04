import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
});

export function setAuthToken(token: string | null) {
    if (token) {
        API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete API.defaults.headers.common['Authorization'];
    }
}

// Optional: intercept 401 to auto logout
export const attach401Interceptor = (logout: () => void) => {
    API.interceptors.response.use(
        response => response,
        error => {
            return Promise.reject(error);
        }
    );
};

export default API;
