import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const state = useAuthStore.getState();
    const token = state.token;
    const activeBusinessId = state.activeBusinessId;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (activeBusinessId) {
      config.headers['x-business-id'] = activeBusinessId;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401 && !error.config.url?.includes('/auth/')) {
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    // Capture and extract diagnostics info!
    const status = error.response?.status;
    const method = error.config?.method?.toUpperCase() || 'UNKNOWN';
    const url = error.config?.url || 'unknown';
    const message = error.response?.data?.message || error.message || 'An unknown network error occurred';
    const rawResponse = error.response?.data;
    
    let requestPayload = null;
    if (error.config?.data) {
      try {
        requestPayload = typeof error.config.data === 'string' 
          ? JSON.parse(error.config.data) 
          : error.config.data;
      } catch (e) {
        requestPayload = error.config.data;
      }
    }

    // Determine why it happened
    let whyItHappened = 'An unexpected API error occurred.';
    if (status === 401) {
      whyItHappened = 'Your authentication session has expired or is invalid. Please log in again.';
    } else if (status === 403) {
      whyItHappened = 'Forbidden: You do not have permission to access this resource. If you are trying to view the vendor dashboard, make sure you are registered as a vendor and logged in as one.';
    } else if (status === 404) {
      whyItHappened = 'Not Found: The resource you are looking for does not exist on the server. Double check that the database was seeded properly and the ID is correct.';
    } else if (status === 400) {
      whyItHappened = 'Bad Request: The server could not understand the request due to invalid syntax. This is usually a client-side validation error or missing fields.';
    } else if (status === 409) {
      whyItHappened = 'Conflict: The resource you are trying to create already exists (e.g., duplicate registration number or email).';
    } else if (status === 500) {
      whyItHappened = 'Internal Server Error: The backend server encountered a crash or uncaught exception. Check the backend server logs for details.';
    } else if (error.code === 'ERR_NETWORK') {
      whyItHappened = 'Network Connection Error: Could not connect to the backend server. Make sure the backend server (typically on localhost:5001) is running and active.';
    }

    const debugDetails = {
      type: 'api' as const,
      url,
      method,
      status,
      statusText: error.response?.statusText,
      message,
      whyItHappened,
      rawResponse,
      requestPayload,
    };

    // Log clearly in developer console
    console.group('%c🚨 NearByBazar API Error Diagnostics', 'color: #ff3333; font-weight: bold; font-size: 14px;');
    console.log('%cMethod & URL:', 'font-weight: bold; color: #ff8800;', `${method} ${url}`);
    console.log('%cStatus Code:', 'font-weight: bold; color: #ff8800;', `${status || 'Network Error'}`);
    console.log('%cMessage:', 'font-weight: bold; color: #ff8800;', message);
    console.log('%cWhy This Happened:', 'font-weight: bold; color: #00cc66;', whyItHappened);
    console.log('%cRaw Response Data:', 'font-weight: bold; color: #aa44ff;', rawResponse);
    if (requestPayload) {
      console.log('%cRequest Payload:', 'font-weight: bold; color: #33aaff;', requestPayload);
    }
    console.groupEnd();

    // Only show dev diagnostics if we are NOT in production
    if (process.env.NODE_ENV !== 'production') {
      // Import store dynamically to set the diagnostic error state
      import('@/store/errorStore').then(({ useErrorStore }) => {
        useErrorStore.getState().setError(debugDetails);
      }).catch(err => {
        console.error('Failed to import useErrorStore inside interceptor:', err);
      });

      // Display a Sonner toast with a debug button
      import('sonner').then(({ toast }) => {
        toast.error(`API Error: ${message}`, {
          action: {
            label: 'Debug Info',
            onClick: () => {} // Modal automatically pops open when activeError in store is set
          },
          duration: 10000,
        });
      }).catch(err => {
        console.error('Failed to trigger toast inside interceptor:', err);
      });
    }

    return Promise.reject(error);
  }
);

export default apiClient;
