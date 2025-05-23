// API Configuration
export const API_BASE_URL = 'http://localhost:3012';

// API Endpoints
export const API_ENDPOINTS = {
    LOGIN: `${API_BASE_URL}/login`,
    REGISTER: `${API_BASE_URL}/register`,
    DASHBOARD_STATS: `${API_BASE_URL}/api/dashboard/stats`,
    PARKING_SLOTS: `${API_BASE_URL}/api/parking-slots`,
    CARS: `${API_BASE_URL}/api/cars`,
    PARKING_RECORDS: `${API_BASE_URL}/api/parking-records`,
    ACTIVE_PARKING: `${API_BASE_URL}/api/parking-records/active`,
    PAYMENTS: `${API_BASE_URL}/api/payments`,
    REPORTS: `${API_BASE_URL}/api/reports`
};