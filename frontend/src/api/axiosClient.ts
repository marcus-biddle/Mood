import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'https://mood-q5ju.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosClient;
