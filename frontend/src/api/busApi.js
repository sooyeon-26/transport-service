import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/bus';

export async function fetchHourly(params) {
  const { data } = await axios.get(`${API_BASE_URL}/hourly`, { params });
  return data;
}

export async function fetchOptions() {
  const { data } = await axios.get(`${API_BASE_URL}/options`);
  return data;
}

export async function fetchStations(route, month) {
  const { data } = await axios.get(`${API_BASE_URL}/stations`, { params: { route, month } });
  return data;
}
