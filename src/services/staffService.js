import api from './api';

export const staffService = {
  // Get all staff
  getAllStaff: async () => {
    const response = await api.get('/staff');
    return response.data;
  },

  // Add new staff
  addStaff: async (staffData) => {
    const response = await api.post('/staff', staffData);
    return response.data;
  },

  // Update staff
  updateStaff: async (id, staffData) => {
    const response = await api.put(`/staff/${id}`, staffData);
    return response.data;
  },

  // Delete staff
  deleteStaff: async (id) => {
    const response = await api.delete(`/staff/${id}`);
    return response.data;
  },

  // Activate staff
activateStaff: async (id) => {
  const response = await api.patch(`/staff/${id}/activate`);
  return response.data;
},

// Deactivate staff
deactivateStaff: async (id) => {
  const response = await api.patch(`/staff/${id}/deactivate`);
  return response.data;
},

};
