import axios from 'axios';
// import { useUserPresistStore } from 'lib/store';

// const { setShowProgress } = useUserPresistStore.getState();

axios.interceptors.request.use(
  (config) => {
    // setShowProgress(true);

    if (!config.headers.get('Content-Type')) {
      config.headers.set('Content-Type', 'application/json; charset=utf-8');
    }

    if (!config.headers.get('Accept')) {
      config.headers.set('Accept', 'application/json');
    }

    // auth

    config.timeout = 50000;
    return config;
  },
  (error) => {
    // setShowProgress(false);
    return Promise.reject(error);
  },
);

axios.interceptors.response.use(
  (response) => {
    // setShowProgress(false);

    if (response && response.status === 200) {
      return Promise.resolve(response.data);
    }
    return Promise.reject(response);
  },
  (error) => {
    // setShowProgress(false);

    if (error.response && error.response.status === 401) {
      window.location.href = '/';
    } else {
      return Promise.reject(error);
    }
  },
);

export default axios;
