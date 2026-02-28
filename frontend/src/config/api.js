// Central API base URL — reads from VITE_API_URL env variable
// In dev:        http://localhost:5000
// In production: your Render backend URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default API_URL;
