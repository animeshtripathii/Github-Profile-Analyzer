import axios from 'axios';

const API_BASE = import.meta.env.DEV ? 'http://localhost:3000' : '';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function checkHealth() {
  const { data } = await api.get('/health');
  return data;
}

export async function analyzeProfile(username) {
  const { data } = await api.post(`/api/profiles/analyze/${username}`);
  return data;
}

export async function refreshProfile(username) {
  const { data } = await api.post(`/api/profiles/analyze/${username}/refresh`);
  return data;
}

export async function getProfiles({ page = 1, limit = 20, sort = 'total_stars', order = 'desc' } = {}) {
  const { data } = await api.get('/api/profiles', {
    params: { page, limit, sort, order },
  });
  return data;
}

export async function getProfile(username) {
  const { data } = await api.get(`/api/profiles/${username}`);
  return data;
}

export async function deleteProfile(username) {
  const { data } = await api.delete(`/api/profiles/${username}`);
  return data;
}

export function formatNumber(num) {
  if (num == null) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
}

export function formatDate(dateString) {
  if (!dateString) return 'Unknown';
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}


const LANG_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Lua: '#000080',
  Scala: '#c22d40',
  R: '#198CE7',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  OpenSCAD: '#e5cd45',
};

export function getLangColor(lang) {
  return LANG_COLORS[lang] || '#8b949e';
}
