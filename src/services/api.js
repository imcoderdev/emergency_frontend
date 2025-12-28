import axios from 'axios';

// Initialize axios with base URL
const api = axios.create({
  baseURL: 'https://emergency-backend-e33i.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Get all incidents with optional filters
 * @param {Object} filters - Query parameters
 * @returns {Promise} - Array of incidents
 */
export const getIncidents = async (filters = {}) => {
  try {
    const response = await api.get('/incidents', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching incidents:', error);
    throw error;
  }
};

/**
 * Get incident statistics
 * @returns {Promise} - Stats object
 */
export const getIncidentStats = async () => {
  try {
    const response = await api.get('/incidents/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
};

/**
 * Get priority queue of incidents
 * @param {Object} params - { lat, lng, limit }
 * @returns {Promise} - Sorted incidents
 */
export const getPriorityQueue = async (params = {}) => {
  try {
    const response = await api.get('/incidents/priority-queue', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching priority queue:', error);
    throw error;
  }
};

/**
 * Get single incident by ID
 * @param {string} id - Incident ID
 * @returns {Promise} - Incident object
 */
export const getIncidentById = async (id) => {
  try {
    const response = await api.get(`/incidents/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching incident:', error);
    throw error;
  }
};

/**
 * Report a new incident
 * @param {Object} data - Incident data (type, description, location)
 * @returns {Promise} - Created or merged incident
 */
export const reportIncident = async (data) => {
  try {
    // Use FormData for multipart uploads
    if (data instanceof FormData) {
      const response = await api.post('/incidents/report', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    }
    const response = await api.post('/incidents/report', data);
    return response.data;
  } catch (error) {
    console.error('Error reporting incident:', error);
    throw error;
  }
};

/**
 * Upvote an incident
 * @param {string} id - Incident ID
 * @returns {Promise} - Updated upvote count
 */
export const upvoteIncident = async (id) => {
  try {
    const response = await api.patch(`/incidents/${id}/upvote`);
    return response.data;
  } catch (error) {
    console.error('Error upvoting incident:', error);
    throw error;
  }
};

/**
 * Verify an incident (admin only)
 * @param {string} id - Incident ID
 * @returns {Promise} - Updated incident
 */
export const verifyIncident = async (id) => {
  try {
    const response = await api.patch(`/incidents/${id}/verify`);
    return response.data;
  } catch (error) {
    console.error('Error verifying incident:', error);
    throw error;
  }
};

/**
 * Update incident status
 * @param {string} id - Incident ID
 * @param {string} status - New status
 * @param {string} notes - Optional responder notes
 * @returns {Promise} - Updated incident
 */
export const updateIncidentStatus = async (id, status, notes = '') => {
  try {
    const response = await api.patch(`/incidents/${id}/status`, {
      status,
      responderNotes: notes
    });
    return response.data;
  } catch (error) {
    console.error('Error updating incident status:', error);
    throw error;
  }
};

/**
 * Delete an incident (admin only)
 * @param {string} id - Incident ID
 * @returns {Promise} - Success message
 */
export const deleteIncident = async (id) => {
  try {
    const response = await api.delete(`/incidents/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting incident:', error);
    throw error;
  }
};

export default api;
