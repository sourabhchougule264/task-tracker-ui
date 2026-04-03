import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Chip,
  Menu,
  MenuItem,
  Skeleton,
} from '@mui/material';
import {
  Add,
  MoreVert,
  Folder,
  Edit,
  Delete,
} from '@mui/icons-material';
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '../../hooks/useProjects';
import { useAppSelector } from '../../store';
import { canCreateProject, canUpdateProject, canDeleteProject } from '../../utils/permissions';
import type { Project, CreateProjectData } from '../../types';

const ProjectsView: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  // Permission checks
  const canCreate = canCreateProject(user);
  const canUpdate = canUpdateProject(user);
  const canDelete = canDeleteProject(user);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<CreateProjectData>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
  });
  const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement; project: Project } | null>(null);

  const handleOpenDialog = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        name: project.name,
        description: project.description,
        startDate: project.startDate || '',
        endDate: project.endDate || '',
      });
    } else {
      setEditingProject(null);
      setFormData({ name: '', description: '', startDate: '', endDate: '' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProject(null);
    setFormData({ name: '', description: '', startDate: '', endDate: '' });
  };

  const handleSubmit = async () => {
    if (editingProject) {
      await updateProject.mutateAsync({ id: editingProject.id, ...formData });
    } else {
      await createProject.mutateAsync(formData);
    }
    handleCloseDialog();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      await deleteProject.mutateAsync(id);
    }
    setMenuAnchor(null);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, project: Project) => {
    setMenuAnchor({ el: event.currentTarget, project });
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleProjectClick = (projectId: number) => {
    navigate(`/dashboard/projects/${projectId}/tasks`);
  };

  if (isLoading) {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="rectangular" width={150} height={40} />
        </Box>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Projects
        </Typography>
        {canCreate && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{ borderRadius: 2 }}
          >
            New Project
          </Button>
        )}
      </Box>

      {!projects || projects.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <Folder sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Projects Yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {canCreate ? 'Create your first project to get started' : 'No projects available to view'}
          </Typography>
          {canCreate && (
            <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
              Create Project
            </Button>
          )}
        </Card>
      ) : (
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Card
                onClick={() => handleProjectClick(project.id)}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Folder color="primary" />
                      <Typography variant="h6" fontWeight={600}>
                        {project.name}
                      </Typography>
                    </Box>
                    {(canUpdate || canDelete) && (
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click when clicking menu
                          handleMenuOpen(e, project);
                        }}
                      >
                        <MoreVert />
                      </IconButton>
                    )}
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {project.description}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {project.ownerUsername && (
                      <Chip label={`By: ${project.ownerUsername}`} size="small" />
                    )}
                    {project.startDate && (
                      <Chip
                        label={`Start: ${new Date(project.startDate).toLocaleDateString()}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                    {project.endDate && (
                      <Chip
                        label={`End: ${new Date(project.endDate).toLocaleDateString()}`}
                        size="small"
                        variant="outlined"
                        color="warning"
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Menu
        anchorEl={menuAnchor?.el}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        {canUpdate && (
          <MenuItem
            onClick={() => {
              if (menuAnchor) handleOpenDialog(menuAnchor.project);
              handleMenuClose();
            }}
          >
            <Edit fontSize="small" sx={{ mr: 1 }} /> Edit
          </MenuItem>
        )}
        {canDelete && (
          <MenuItem
            onClick={() => {
              if (menuAnchor) handleDelete(menuAnchor.project.id);
            }}
            sx={{ color: 'error.main' }}
          >
            <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
          </MenuItem>
        )}
      </Menu>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingProject ? 'Edit Project' : 'Create New Project'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Project Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            autoFocus
          />
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
            multiline
            rows={4}
          />
          <TextField
            fullWidth
            label="Start Date"
            type="date"
            value={formData.startDate || ''}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="End Date"
            type="date"
            value={formData.endDate || ''}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.name || createProject.isPending || updateProject.isPending}
          >
            {editingProject ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectsView;




