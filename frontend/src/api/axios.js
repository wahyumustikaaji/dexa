import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
})

api.interceptors.response.use(
    (res) => res,
    (error) => {
        const isLoginRequest = error.config?.url?.includes('auth/login');
        if (error.response?.status === 401 && !isLoginRequest) {
            localStorage.removeItem('accessToken');
            window.location.href = '/login'
        }

        return Promise.reject(error)
    }
);

export default api;