import axiosInstance from './axiosConfig';

const authService = {
  login: async (username, password) => {
    const response = await axiosInstance.post('/auth/login', {
      username,
      password,
    });
    return response.data;
  },

  register: async (username, password, email) => {
    const response = await axiosInstance.post('/auth/register', {
      username,
      password,
      email,
    });
    return response.data;
  },

  confirm: async (username, confirmationCode) => {
    const response = await axiosInstance.post('/auth/confirm', {
      username,
      confirmationCode,
    });
    return response.data;
  },

  forgotPassword: async (username) => {
    const response = await axiosInstance.post('/auth/forgot-password', {
      username,
    });
    return response.data;
  },

  confirmForgotPassword: async (username, confirmationCode, newPassword) => {
    const response = await axiosInstance.post('/auth/confirm-forgot-password', {
      username,
      confirmationCode,
      newPassword,
    });
    return response.data;
  },

  refreshToken: async (refreshToken) => {
    const response = await axiosInstance.post('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },

  assignRole: async (username, role) => {
    const response = await axiosInstance.post('/auth/assign-role', {
      username,
      role,
    });
    return response.data;
  },

  removeRole: async (username, role) => {
    const response = await axiosInstance.post('/auth/remove-role', {
      username,
      role,
    });
    return response.data;
  },

  newPasswordChallenge: async (username, newPassword, session) => {
    const response = await axiosInstance.post('/auth/new-password-challenge', {
      username,
      newPassword,
      session,
    });
    return response.data;
  },

  health: async () => {
    const response = await axiosInstance.get('/auth/health');
    return response.data;
  },

  logout: () => {
    localStorage.clear();
  },
};

export default authService;

