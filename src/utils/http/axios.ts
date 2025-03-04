import axios from 'axios';

axios.interceptors.request.use(
  (config) => {
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
    return Promise.reject(error);
  },
);

axios.interceptors.response.use(
  (response) => {
    if (response && response.status === 200) {
      return Promise.resolve(response.data);
    }
    return Promise.reject(response);
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      window.location.href = '/';
    } else {
      return Promise.reject(error);
    }
  },
);

export default axios;
