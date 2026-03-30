import axiosInstance from './axiosConfig';

const taskService = {
  createTask: async (taskData) => {
    const response = await axiosInstance.post('/tasks', taskData);
    return response.data;
  },

  getAllTasks: async () => {
    const response = await axiosInstance.get('/tasks');
    return response.data;
  },

  getTaskById: async (id) => {
    const response = await axiosInstance.get(`/tasks/${id}`);
    return response.data;
  },

  getTasksByProject: async (projectId) => {
    const response = await axiosInstance.get(`/tasks/project/${projectId}`);
    return response.data;
  },

  getTasksByAssignedUser: async (username) => {
    const response = await axiosInstance.get(`/tasks/assigned/${username}`);
    return response.data;
  },

  getMyTasks: async () => {
    const response = await axiosInstance.get('/tasks/my-tasks');
    return response.data;
  },

  getTasksByStatus: async (status) => {
    const response = await axiosInstance.get(`/tasks/status/${status}`);
    return response.data;
  },

  updateTask: async (id, taskData) => {
    const response = await axiosInstance.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  assignTask: async (taskId, username) => {
    const response = await axiosInstance.patch(`/tasks/${taskId}/assign/${username}`);
    return response.data;
  },

  updateTaskStatus: async (taskId, status) => {
    const response = await axiosInstance.patch(`/tasks/${taskId}/status/${status}`);
    return response.data;
  },

  deleteTask: async (id) => {
    const response = await axiosInstance.delete(`/tasks/${id}`);
    return response.data;
  },
};

export default taskService;

