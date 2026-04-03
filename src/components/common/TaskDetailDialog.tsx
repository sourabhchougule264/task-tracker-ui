import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
} from '@mui/material';
import { Edit } from '@mui/icons-material';
import { useUpdateTask } from '../../hooks/useTasks';
import { useProjects } from '../../hooks/useProjects';
import { useUsers } from '../../hooks/useUsers';
import { canUpdateTask } from '../../utils/permissions';
import type { Task, TaskStatus, CreateTaskData, User } from '../../types';
import { TaskStatus as TaskStatusEnum } from '../../types';

interface TaskDetailDialogProps {
  open: boolean;
  task: Task | null;
  user: User | null;
  onClose: () => void;
}

const TaskDetailDialog: React.FC<TaskDetailDialogProps> = ({ open, task, user, onClose }) => {
  const { data: projects } = useProjects();
  const { data: users } = useUsers();
  const updateTask = useUpdateTask();

  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<CreateTaskData & { status?: TaskStatus }>({
    description: '',
    projectId: 0,
    assignedUsername: '',
    status: TaskStatusEnum.NEW,
    dueDate: '',
  });

  // Permission check
  const canUpdate = canUpdateTask(user);

  // Reset edit mode when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setIsEditMode(false);
    }
  }, [open]);

  // Populate form data when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        description: task.description,
        projectId: task.projectId || 0,
        assignedUsername: task.assignedUsername || '',
        status: task.status,
        dueDate: task.dueDate || '',
      });
    }
  }, [task]);

  const handleEnterEditMode = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    if (task) {
      setFormData({
        description: task.description,
        projectId: task.projectId || 0,
        assignedUsername: task.assignedUsername || '',
        status: task.status,
        dueDate: task.dueDate || '',
      });
    }
    setIsEditMode(false);
  };

  const handleSave = async () => {
    if (task) {
      await updateTask.mutateAsync({ id: task.id, ...formData });
      setIsEditMode(false);
      onClose();
    }
  };

  const getStatusColor = (status: TaskStatus): 'default' | 'primary' | 'warning' | 'error' | 'success' => {
    switch (status) {
      case TaskStatusEnum.NEW: return 'primary';
      case TaskStatusEnum.NOT_STARTED: return 'default';
      case TaskStatusEnum.IN_PROGRESS: return 'warning';
      case TaskStatusEnum.BLOCKED: return 'error';
      case TaskStatusEnum.COMPLETED: return 'success';
      default: return 'default';
    }
  };

  if (!task) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={600}>
            {isEditMode ? 'Edit Task' : 'Task Details'}
          </Typography>
          {!isEditMode && canUpdate && (
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={handleEnterEditMode}
              size="small"
            >
              Edit
            </Button>
          )}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {isEditMode ? (
            // Edit Mode
            <>
              <TextField
                fullWidth
                label="Task Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                margin="normal"
                multiline
                rows={3}
                autoFocus
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status || TaskStatusEnum.NEW}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                  label="Status"
                >
                  <MenuItem value={TaskStatusEnum.NEW}>New</MenuItem>
                  <MenuItem value={TaskStatusEnum.NOT_STARTED}>Not Started</MenuItem>
                  <MenuItem value={TaskStatusEnum.IN_PROGRESS}>In Progress</MenuItem>
                  <MenuItem value={TaskStatusEnum.BLOCKED}>Blocked</MenuItem>
                  <MenuItem value={TaskStatusEnum.COMPLETED}>Completed</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>Project</InputLabel>
                <Select
                  value={formData.projectId || ''}
                  onChange={(e) => setFormData({ ...formData, projectId: Number(e.target.value) })}
                  label="Project"
                >
                  {projects?.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>Assigned To</InputLabel>
                <Select
                  value={formData.assignedUsername || ''}
                  onChange={(e) => setFormData({ ...formData, assignedUsername: e.target.value })}
                  label="Assigned To"
                >
                  <MenuItem value="">
                    <em>Unassigned</em>
                  </MenuItem>
                  {users?.map((u) => (
                    <MenuItem key={u.username} value={u.username}>
                      {u.username} ({u.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Due Date"
                type="date"
                value={formData.dueDate || ''}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </>
          ) : (
            // View Mode
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {task.description}
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Status
                  </Typography>
                  <Chip
                    label={task.status.replace('_', ' ')}
                    color={getStatusColor(task.status)}
                    sx={{ fontWeight: 600 }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Project
                  </Typography>
                  <Typography variant="body1">
                    {task.projectName || 'No project assigned'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Assigned To
                  </Typography>
                  <Typography variant="body1">
                    {task.assignedUsername || 'Unassigned'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Created By
                  </Typography>
                  <Typography variant="body1">
                    {task.ownerUsername || 'Unknown'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Due Date
                  </Typography>
                  <Typography variant="body1">
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'No due date'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Task ID
                  </Typography>
                  <Typography variant="body1">
                    #{task.id}
                  </Typography>
                </Grid>
              </Grid>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        {isEditMode ? (
          <>
            <Button onClick={handleCancelEdit}>Cancel</Button>
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={!formData.description || !formData.projectId || updateTask.isPending}
            >
              {updateTask.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </>
        ) : (
          <Button onClick={onClose}>Close</Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TaskDetailDialog;

