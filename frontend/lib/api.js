import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const fetchFeeds = async () => {
  const response = await api.get('/feed');
  return response.data.data;
};

export const createFeed = async (payload) => {
  const response = await api.post('/feed', payload);
  return response.data.data;
};
