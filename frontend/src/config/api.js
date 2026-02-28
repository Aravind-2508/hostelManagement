// Central API base URL — reads from VITE_API_URL env variable
// In dev:        ${API_URL}
// In production: your Render backend URL
const API_URL = import.meta.env.VITE_API_URL || '${API_URL}';

export default API_URL;
