// Central API base URL — reads from VITE_API_URL env variable
// In dev:        http://localhost:5000
// In production: your Render backend URL
// Strip any accidental trailing slash to prevent double-slash URLs
const raw = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = raw.replace(/\/+$/, '');

export default API_URL;
