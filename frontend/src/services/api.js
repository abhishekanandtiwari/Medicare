const API_BASE = '/api';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('medicare_token');
  const headers = {
    ...(options.headers || {}),
  };

  // Do not set Content-Type for FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);

    if (response.status === 401) {
      // Clear token if expired or unauthorized
      if (endpoint !== '/auth/login' && endpoint !== '/auth/register') {
        localStorage.removeItem('medicare_token');
        localStorage.removeItem('medicare_user');
      }
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || data.message || 'An error occurred during request.');
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

export const api = {
  // Auth
  login: (email, password) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (userData) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => apiRequest('/auth/me'),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),

  // Patients
  getPatientDashboard: () => apiRequest('/patients/dashboard'),
  getPatientProfile: () => apiRequest('/patients/profile'),
  updatePatientProfile: (data) => apiRequest('/patients/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Doctors
  getDoctors: (params = '') => apiRequest(`/doctors?${params}`),
  getDoctorById: (id) => apiRequest(`/doctors/${id}`),
  getDoctorSlots: (id, date) => apiRequest(`/doctors/${id}/slots?date=${date}`),
  getDoctorDashboard: () => apiRequest('/doctors/dashboard/summary'),
  updateDoctorProfile: (data) => apiRequest('/doctors/profile', { method: 'PUT', body: JSON.stringify(data) }),
  setDoctorAvailability: (slots) => apiRequest('/doctors/availability', { method: 'POST', body: JSON.stringify(slots) }),

  // Appointments
  bookAppointment: (data) => apiRequest('/appointments', { method: 'POST', body: JSON.stringify(data) }),
  getAppointments: () => apiRequest('/appointments'),
  getAppointmentById: (id) => apiRequest(`/appointments/${id}`),
  updateAppointment: (id, data) => apiRequest(`/appointments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  verifyAppointmentQR: (code) => apiRequest(`/appointments/verify-qr?code=${code}`, { method: 'POST' }),

  // Medications
  getMedications: () => apiRequest('/medications'),
  addMedication: (data) => apiRequest('/medications', { method: 'POST', body: JSON.stringify(data) }),
  deleteMedication: (id) => apiRequest(`/medications/${id}`, { method: 'DELETE' }),
  logMedication: (id, status) => apiRequest(`/medications/${id}/log`, { method: 'POST', body: JSON.stringify({ medication_id: id, status }) }),

  // Health Metrics
  getHealthMetrics: (params = '') => apiRequest(`/health-metrics?${params}`),
  recordHealthMetric: (data) => apiRequest('/health-metrics', { method: 'POST', body: JSON.stringify(data) }),
  getMetricsSummary: () => apiRequest('/health-metrics/summary'),

  // Health Records & AI Summarizer
  getHealthRecords: (category = '') => apiRequest(`/health-records?category=${category}`),
  uploadHealthRecord: (formData) => apiRequest('/health-records/upload', { method: 'POST', body: formData }),
  deleteHealthRecord: (id) => apiRequest(`/health-records/${id}`, { method: 'DELETE' }),

  // Symptoms (Trie Autocomplete & Analyzer)
  autocompleteSymptoms: (q) => apiRequest(`/symptoms/autocomplete?q=${encodeURIComponent(q)}`),
  analyzeSymptoms: (data) => apiRequest('/symptoms/analyze', { method: 'POST', body: JSON.stringify(data) }),
  getSymptomHistory: () => apiRequest('/symptoms/history'),
  exploreSymptomGraph: (symptom) => apiRequest(`/symptoms/graph/explore?symptom=${encodeURIComponent(symptom)}`),

  // AI Chat & Wellness Insights
  sendChatMessage: (message, conversationId = null, voiceInput = false) =>
    apiRequest('/ai/chat', { method: 'POST', body: JSON.stringify({ message, conversation_id: conversationId, voice_input: voiceInput }) }),
  getConversations: () => apiRequest('/ai/conversations'),
  getConversationById: (id) => apiRequest(`/ai/conversations/${id}`),
  getWellnessInsights: () => apiRequest('/ai/wellness-insights'),

  // Emergency Mode
  getEmergencyProfile: () => apiRequest('/emergency/profile'),
  triggerEmergency: (notes) => apiRequest('/emergency/trigger', { method: 'POST', body: JSON.stringify({ notes }) }),

  // Notifications
  getNotifications: () => apiRequest('/notifications'),
  markNotificationRead: (id) => apiRequest(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => apiRequest('/notifications/read-all', { method: 'PUT' }),

  // Gamification
  getGamification: () => apiRequest('/gamification'),
  logGamificationAction: (activityType, points = 10) =>
    apiRequest('/gamification/action', { method: 'POST', body: JSON.stringify({ activity_type: activityType, points }) }),

  // Admin
  getAdminStats: () => apiRequest('/admin/stats'),
  getAdminUsers: () => apiRequest('/admin/users'),
  verifyDoctor: (doctorId, isVerified) => apiRequest('/admin/doctors/verify', { method: 'POST', body: JSON.stringify({ doctor_id: doctorId, is_verified: isVerified }) }),
  getAuditLogs: (limit = 50) => apiRequest(`/admin/audit-logs?limit=${limit}`),
  broadcastNotification: (data) => apiRequest('/admin/broadcast', { method: 'POST', body: JSON.stringify(data) }),

  // DSA Diagnostics
  getDsaStatus: () => apiRequest('/dsa/status'),
};
