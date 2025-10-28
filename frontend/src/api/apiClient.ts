import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || "https://api.prashn.swastify.life/api/";
console.log(baseURL);


export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
