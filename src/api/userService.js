import axiosInstance from './axiosConfig';

const userService = {
  createUserProfile: async (userData) => {
    const response = await axiosInstance.post('/users', userData);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await axiosInstance.get('/users/me');
    return response.data;
  },

  getUserById: async (id) => {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data;
  },

  getUserByUsername: async (username) => {
    const response = await axiosInstance.get(`/users/username/${username}`);
    return response.data;
  },

  getAllUsers: async () => {
    const response = await axiosInstance.get('/users');
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await axiosInstance.put(`/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await axiosInstance.delete(`/users/${id}`);
    return response.data;
  },
};

export default userService;

