import React, { useState, useEffect } from 'react';
import taskService from '../api/taskService';
import projectService from '../api/projectService';
import { useAuth } from '../context/AuthContext';
import UserSelector from './UserSelector';
import './TaskList.css';

const TASK_STATUSES = ['NEW', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED', 'NOT_STARTED'];

const TaskList = ({ showMyTasks, projectId, onRefresh }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const { canCreateTasks, isAdmin } = useAuth();

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMyTasks, projectId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      let data;
      if (projectId) {
        data = await taskService.getTasksByProject(projectId);
      } else if (showMyTasks) {
        data = await taskService.getMyTasks();
      } else {
        data = await taskService.getAllTasks();
      }
      setTasks(data);
      setError('');
    } catch (err) {
      setError('Failed to load tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await taskService.deleteTask(id);
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (err) {
      alert('Failed to delete task: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
  };

  const handleUpdate = async (id, updatedData) => {
    try {
      const updated = await taskService.updateTask(id, updatedData);
      setTasks(tasks.map((t) => (t.id === id ? updated : t)));
      setEditingTask(null);
    } catch (err) {
      alert('Failed to update task: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const updated = await taskService.updateTaskStatus(taskId, newStatus);
      setTasks(tasks.map((t) => (t.id === taskId ? updated : t)));
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.message || err.message));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return '#4caf50';
      case 'IN_PROGRESS':
        return '#2196f3';
      case 'BLOCKED':
        return '#f44336';
      case 'NEW':
        return '#ff9800';
      case 'NOT_STARTED':
        return '#9e9e9e';
      default:
        return '#666';
    }
  };

  if (loading) {
    return <div className="loading">Loading tasks...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="task-list">
      {tasks.length === 0 ? (
        <div className="empty-state">
          <p>No tasks found</p>
          {canCreateTasks() && <p>Create your first task to get started!</p>}
        </div>
      ) : (
        <div className="tasks-container">
          {tasks.map((task) => (
            <div key={task.id} className="task-card">
              {editingTask?.id === task.id ? (
                <EditTaskForm
                  task={editingTask}
                  onSave={(data) => handleUpdate(task.id, data)}
                  onCancel={() => setEditingTask(null)}
                />
              ) : (
                <>
                  <div className="task-header">
                    <div className="task-status-badge" style={{ backgroundColor: getStatusColor(task.status) }}>
                      {task.status.replace('_', ' ')}
                    </div>
                    {(isAdmin() || canCreateTasks()) && (
                      <div className="task-actions">
                        <button
                          onClick={() => handleEdit(task)}
                          className="btn-edit"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="btn-delete"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="task-description">{task.description}</p>

                  <div className="task-info">
                    {task.projectName && (
                      <div className="info-item">
                        <span className="label">Project:</span>
                        <span className="value">{task.projectName}</span>
                      </div>
                    )}
                    <div className="info-item">
                      <span className="label">Owner:</span>
                      <span className="value">{task.ownerUsername}</span>
                    </div>
                    {task.assignedUsername && (
                      <div className="info-item">
                        <span className="label">Assigned To:</span>
                        <span className="value">{task.assignedUsername}</span>
                      </div>
                    )}
                    <div className="info-item">
                      <span className="label">Due Date:</span>
                      <span className="value">{formatDate(task.dueDate)}</span>
                    </div>
                  </div>

                  <div className="task-status-selector">
                    <label>Change Status:</label>
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      className="status-select"
                    >
                      {TASK_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
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

const EditTaskForm = ({ task, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    description: task.description,
    dueDate: task.dueDate,
    status: task.status,
    projectId: task.projectId || '',
    assignedUsername: task.assignedUsername || '',
  });
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await projectService.getAllProjects();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      projectId: formData.projectId ? parseInt(formData.projectId) : null,
    };
    onSave(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="edit-form">
      <textarea
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder="Task Description"
        rows="3"
        required
      />
      <input
        type="date"
        value={formData.dueDate}
        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
      />
      <select
        value={formData.status}
        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
      >
        {TASK_STATUSES.map((status) => (
          <option key={status} value={status}>
            {status.replace('_', ' ')}
          </option>
        ))}
      </select>
      <select
        value={formData.projectId}
        onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
      >
        <option value="">No Project</option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>
      <UserSelector
        value={formData.assignedUsername}
        onChange={(username) => setFormData({ ...formData, assignedUsername: username })}
        label="Assign To"
        required={false}
        allowEmpty={true}
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

export default TaskList;

