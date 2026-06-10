import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4100/api/bus';

export async function fetchPrediction(params) {
  const { data } = await axios.get(`${API_BASE_URL}/predict`, { params });
  return data;
}

export async function fetchHourly(params) {
  const { data } = await axios.get(`${API_BASE_URL}/hourly`, { params });
  return data;
}

export async function fetchOptions() {
  const { data } = await axios.get(`${API_BASE_URL}/options`);
  return data;
}
