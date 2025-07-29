import axios from 'axios';

const api = axios.create({
  baseURL: 'https://syncmeet-back.onrender.com', 
});

export default api;