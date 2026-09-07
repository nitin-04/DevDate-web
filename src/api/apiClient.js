import axios from 'axios';
import { BASE_URL } from '../utils/constants';

const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  withCredentials: true,
});

// Automatically catch 401 unauthenticated errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      window.location.pathname !== '/login' &&
      window.location.pathname !== '/signup'
    ) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
