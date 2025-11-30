// src/utils/apiConfig.js

// This constant dynamically determines the correct backend base URL.
// It checks for the VITE_API_URL environment variable (used in production/Render)
// and falls back to the local port 5000 for development.

export const API_BASE_URL = import.meta.env.VITE_API_URL 
    ? `${import.meta.env.VITE_API_URL}/api` // Use the public URL from Render/Vite Env
    : 'http://localhost:5000/api';          // Fallback for local dev (Vite running on 5173, backend on 5000)

// Example: API_BASE_URL will be "https://your-api.onrender.com/api" in production.