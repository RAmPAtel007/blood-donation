// config.js - API Configuration for BloodDB

// Automatically detect the API URL based on environment
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000'  // Local development
    : window.location.origin;  // Production - uses same domain

// Configuration object
const API_CONFIG = {
    BASE_URL: API_BASE_URL,
    ENDPOINTS: {
        // Auth endpoints
        REGISTER: `${API_BASE_URL}/api/auth/register`,
        LOGIN: `${API_BASE_URL}/api/auth/login`,
        LOGOUT: `${API_BASE_URL}/api/auth/logout`,
        
        // User endpoints
        PROFILE: `${API_BASE_URL}/api/user/profile`,
        UPDATE_PROFILE: `${API_BASE_URL}/api/user/update`,
        
        // Blood donation endpoints
        REQUEST_BLOOD: `${API_BASE_URL}/request-blood`,
        SEARCH_DONORS: `${API_BASE_URL}/search`,
        REGISTER_DONOR: `${API_BASE_URL}/register`,
        
        // Add other endpoints as needed
    }
};

// Log the current environment (for debugging)
console.log('API Base URL:', API_BASE_URL);