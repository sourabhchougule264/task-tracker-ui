import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProjectList from './ProjectList';
import TaskList from './TaskList';
import CreateProject from './CreateProject';
import CreateTask from './CreateTask';
import UserProfile from './UserProfile';
import UserManagement from './UserManagement';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout, canCreateTasks, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('projects');
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProjectCreated = () => {
    setShowCreateProject(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleTaskCreated = () => {
    setShowCreateTask(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setActiveTab('project-tasks');
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
    setActiveTab('projects');
  };

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <h1>Task Tracker</h1>
        </div>
        <div className="nav-user">
          <span className="user-info">
            Welcome, <strong>{user?.username}</strong>
            {user?.roles && user.roles.length > 0 && (
              <span className="user-roles">
                ({user.roles.join(', ')})
              </span>
            )}
          </span>
          <button
            onClick={() => setActiveTab('profile')}
            className={`btn-nav ${activeTab === 'profile' ? 'active' : ''}`}
            title="Profile"
          >
            👤 Profile
          </button>
          {isAdmin() && (
            <button
              onClick={() => setActiveTab('users')}
              className={`btn-nav ${activeTab === 'users' ? 'active' : ''}`}
              title="User Management"
            >
              👥 Users
            </button>
          )}
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <div className="tabs">
            {selectedProject ? (
              <>
                <button
                  className="tab"
                  onClick={handleBackToProjects}
                >
                  ← Back to Projects
                </button>
                <button className="tab active">
                  {selectedProject.name} - Tasks
                </button>
              </>
            ) : (
              <>
                <button
                  className={`tab ${activeTab === 'projects' ? 'active' : ''}`}
                  onClick={() => setActiveTab('projects')}
                >
                  Projects
                </button>
                <button
                  className={`tab ${activeTab === 'tasks' ? 'active' : ''}`}
                  onClick={() => setActiveTab('tasks')}
                >
                  My Tasks
                </button>
                <button
                  className={`tab ${activeTab === 'all-tasks' ? 'active' : ''}`}
                  onClick={() => setActiveTab('all-tasks')}
                >
                  All Tasks
                </button>
              </>
            )}
          </div>

          <div className="action-buttons">
            {canCreateTasks() && activeTab === 'projects' && !selectedProject && (
              <button
                className="btn-primary"
                onClick={() => setShowCreateProject(true)}
              >
                + New Project
              </button>
            )}
            {canCreateTasks() && (activeTab === 'tasks' || activeTab === 'all-tasks' || activeTab === 'project-tasks') && (
              <button
                className="btn-primary"
                onClick={() => setShowCreateTask(true)}
              >
                + New Task
              </button>
            )}
          </div>
        </div>

        <div className="dashboard-body">
          {activeTab === 'projects' && !selectedProject && (
            <ProjectList
              key={refreshTrigger}
              onRefresh={() => setRefreshTrigger(prev => prev + 1)}
              onProjectSelect={handleProjectSelect}
            />
          )}
          {activeTab === 'project-tasks' && selectedProject && (
            <TaskList
              key={`${refreshTrigger}-${selectedProject.id}`}
              projectId={selectedProject.id}
              onRefresh={() => setRefreshTrigger(prev => prev + 1)}
            />
          )}
          {activeTab === 'tasks' && (
            <TaskList key={refreshTrigger} showMyTasks={true} onRefresh={() => setRefreshTrigger(prev => prev + 1)} />
          )}
          {activeTab === 'all-tasks' && (
            <TaskList key={refreshTrigger} showMyTasks={false} onRefresh={() => setRefreshTrigger(prev => prev + 1)} />
          )}
          {activeTab === 'profile' && (
            <UserProfile />
          )}
          {activeTab === 'users' && isAdmin() && (
            <UserManagement />
          )}
        </div>
      </div>

      {showCreateProject && (
        <CreateProject
          onClose={() => setShowCreateProject(false)}
          onSuccess={handleProjectCreated}
        />
      )}

      {showCreateTask && (
        <CreateTask
          onClose={() => setShowCreateTask(false)}
          onSuccess={handleTaskCreated}
        />
      )}
    </div>
  );
};

export default Dashboard;

