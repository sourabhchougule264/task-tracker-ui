import axiosInstance from './axiosConfig';

const projectService = {
  createProject: async (projectData) => {
    const response = await axiosInstance.post('/projects', projectData);
    return response.data;
  },

  getAllProjects: async () => {
    const response = await axiosInstance.get('/projects');
    return response.data;
  },

  getProjectById: async (id) => {
    const response = await axiosInstance.get(`/projects/${id}`);
    return response.data;
  },

  getProjectsByOwner: async (username) => {
    const response = await axiosInstance.get(`/projects/owner/${username}`);
    return response.data;
  },

  getMyProjects: async () => {
    const response = await axiosInstance.get('/projects/my-projects');
    return response.data;
  },

  updateProject: async (id, projectData) => {
    const response = await axiosInstance.put(`/projects/${id}`, projectData);
    return response.data;
  },

  deleteProject: async (id) => {
    const response = await axiosInstance.delete(`/projects/${id}`);
    return response.data;
  },
};

export default projectService;

