// API Configuration
export const API_BASE_URL = 'http://localhost:5000';

// API Endpoints
export const API_ENDPOINTS = {
    LOGIN: `${API_BASE_URL}/login`,
    REGISTER: `${API_BASE_URL}/register`,
    DASHBOARD_STATS: `${API_BASE_URL}/api/dashboard/stats`,
    PARKING_SLOTS: `${API_BASE_URL}/parking-slots`,
    PARKING_SLOTS_AVAILABLE: `${API_BASE_URL}/parking-slots/available`,
    CARS: `${API_BASE_URL}/cars`,
    PARKING_RECORDS: `${API_BASE_URL}/parking-records`,
    ACTIVE_PARKING: `${API_BASE_URL}/api/parking-records/active`,
    PAYMENTS: `${API_BASE_URL}/payments`,
    REPORTS: `${API_BASE_URL}/api/reports`,
    REPORTS_DAILY: `${API_BASE_URL}/reports/daily`
};