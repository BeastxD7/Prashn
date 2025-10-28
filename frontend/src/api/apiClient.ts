import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const baseURL = process.env.VITE_API_BASE_URL || "https://api.prashn.swastify.life";
export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
