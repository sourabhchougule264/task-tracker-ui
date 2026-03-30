import React, { useState, useEffect } from 'react';
import projectService from '../api/projectService';
import { useAuth } from '../context/AuthContext';
import './ProjectList.css';

const ProjectList = ({ onRefresh, onProjectSelect }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingProject, setEditingProject] = useState(null);
  const { canCreateTasks, isAdmin } = useAuth();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getAllProjects();
      setProjects(data);
      setError('');
    } catch (err) {
      setError('Failed to load projects');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      await projectService.deleteProject(id);
      setProjects(projects.filter((p) => p.id !== id));
    } catch (err) {
      alert('Failed to delete project: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
  };

  const handleUpdate = async (id, updatedData) => {
    try {
      const updated = await projectService.updateProject(id, updatedData);
      setProjects(projects.map((p) => (p.id === id ? updated : p)));
      setEditingProject(null);
    } catch (err) {
      alert('Failed to update project: ' + (err.response?.data?.message || err.message));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <div className="loading">Loading projects...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="project-list">
      {projects.length === 0 ? (
        <div className="empty-state">
          <p>No projects found</p>
          {canCreateTasks() && <p>Create your first project to get started!</p>}
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => (
            <div
              key={project.id}
              className="project-card"
              onClick={() => onProjectSelect && onProjectSelect(project)}
              style={{ cursor: 'pointer' }}
            >
              {editingProject?.id === project.id ? (
                <EditProjectForm
                  project={editingProject}
                  onSave={(data) => handleUpdate(project.id, data)}
                  onCancel={() => setEditingProject(null)}
                />
              ) : (
                <>
                  <div className="project-header">
                    <h3>{project.name}</h3>
                    {(isAdmin() || canCreateTasks()) && (
                      <div className="project-actions">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(project);
                          }}
                          className="btn-edit"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(project.id);
                          }}
                          className="btn-delete"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="project-description">{project.description}</p>

                  <div className="project-info">
                    <div className="info-item">
                      <span className="label">Owner:</span>
                      <span className="value">{project.ownerUsername}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Start Date:</span>
                      <span className="value">{formatDate(project.startDate)}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">End Date:</span>
                      <span className="value">{formatDate(project.endDate)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const EditProjectForm = ({ project, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description,
    startDate: project.startDate,
    endDate: project.endDate,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="edit-form">
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Project Name"
        required
      />
      <textarea
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder="Description"
        rows="3"
      />
      <input
        type="date"
        value={formData.startDate}
        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
      />
      <input
        type="date"
        value={formData.endDate}
        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
      />
      <div className="form-actions">
        <button type="submit" className="btn-save">
          Save
        </button>
        <button type="button" onClick={onCancel} className="btn-cancel">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ProjectList;

