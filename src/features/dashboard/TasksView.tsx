import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Chip,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Skeleton,
} from '@mui/material';
import {
  Add,
  MoreVert,
  Assignment,
  Edit,
  Delete,
  FilterList,
} from '@mui/icons-material';
import { useTasks, useUserTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../../hooks/useTasks';
import { useProjects } from '../../hooks/useProjects';
import { useUsers } from '../../hooks/useUsers';
import { useAppSelector } from '../../store';
import { canCreateTask, canUpdateTask, canDeleteTask } from '../../utils/permissions';
import TaskDetailDialog from '../../components/common/TaskDetailDialog';
import { Task, CreateTaskData, TaskStatus } from '../../types';

interface TasksViewProps {
  showMyTasks?: boolean;
}

const TasksView: React.FC<TasksViewProps> = ({ showMyTasks = false }) => {
  const { projectId } = useParams<{ projectId: string }>();
  const routerLocation = useLocation();
  const user = useAppSelector((state) => state.auth.user);
  const { data: allTasks, isLoading: loadingAll } = useTasks();
  const { data: myTasks, isLoading: loadingMy } = useUserTasks(user?.username || '');
  const { data: projects } = useProjects();
  const { data: users } = useUsers();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  // Permission checks
  const canCreate = canCreateTask(user);
  const canUpdate = canUpdateTask(user);
  const canDelete = canDeleteTask(user);

  // State variables
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<CreateTaskData & { status?: TaskStatus }>({
    description: '',
    projectId: 0,
    assignedUsername: '',
    status: TaskStatus.NEW,
  });
  const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement; task: Task } | null>(null);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<Task | null>(null);

  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'ALL'>('ALL');
  const [filterProject, setFilterProject] = useState<number | 'ALL'>('ALL');
  const [filterAssignedUser, setFilterAssignedUser] = useState<string | 'ALL'>('ALL');

  useEffect(() => {
    setFilterProject('ALL');
    setFilterAssignedUser('ALL');

    const params = new URLSearchParams(routerLocation.search);
    const statusParam = params.get('status');

    if (statusParam && Object.values(TaskStatus).includes(statusParam as TaskStatus)) {
      setFilterStatus(statusParam as TaskStatus);
    } else {
      setFilterStatus('ALL');
    }
  }, [routerLocation.pathname, routerLocation.search, showMyTasks, projectId]);

  // Filter tasks by projectId if provided
  const filteredTasks = projectId
    ? (showMyTasks ? myTasks : allTasks)?.filter(task => task.projectId === Number(projectId))
    : (showMyTasks ? myTasks : allTasks);

  // Apply filters
  const applyFilters = (taskList: Task[] | undefined) => {
    if (!taskList) return [];

    return taskList.filter(task => {
      // Status filter
      if (filterStatus !== 'ALL' && task.status !== filterStatus) {
        return false;
      }

      // Project filter
      if (filterProject !== 'ALL' && task.projectId !== filterProject) {
        return false;
      }

     // Assigned user filter
      if (filterAssignedUser !== 'ALL') {
        if (filterAssignedUser === 'UNASSIGNED') {
          if (task.assignedUsername) return false;
        } else if (task.assignedUsername !== filterAssignedUser) {
          return false;
        }
      }

      return true;
    });
  };

  const tasks = applyFilters(filteredTasks);
  const isLoading = showMyTasks ? loadingMy : loadingAll;

  const currentProject = projectId ? projects?.find(p => p.id === Number(projectId)) : null;


  const handleOpenDialog = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        description: task.description,
        projectId: task.projectId || 0,
        assignedUsername: task.assignedUsername || '',
        status: task.status,
        dueDate: task.dueDate,
      });
    } else {
      setEditingTask(null);
      setFormData({ description: '', projectId: 0, assignedUsername: '', status: TaskStatus.NEW });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTask(null);
  };

  const handleSubmit = async () => {
    if (editingTask) {
      await updateTask.mutateAsync({ id: editingTask.id, ...formData });
    } else {
      const { status, ...createData } = formData;
      await createTask.mutateAsync(createData);
    }
    handleCloseDialog();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask.mutateAsync(id);
    }
    setMenuAnchor(null);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, task: Task) => {
    setMenuAnchor({ el: event.currentTarget, task });
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const getStatusColor = (status: TaskStatus): 'default' | 'primary' | 'warning' | 'error' | 'success' => {
    switch (status) {
      case TaskStatus.NEW: return 'primary';
      case TaskStatus.NOT_STARTED: return 'default';
      case TaskStatus.IN_PROGRESS: return 'warning';
      case TaskStatus.BLOCKED: return 'error';
      case TaskStatus.COMPLETED: return 'success';
      default: return 'default';
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTaskForDetail(task);
  };

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 3 }} />
        <Grid container spacing={2}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} key={i}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            {currentProject ? `${currentProject.name} - Tasks` : (showMyTasks ? 'My Tasks' : 'All Tasks')}
          </Typography>
          {currentProject && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {currentProject.description}
            </Typography>
          )}
        </Box>
        {canCreate && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{ borderRadius: 2 }}
          >
            New Task
          </Button>
        )}
      </Box>

      {/* Filter Section */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <FilterList color="action" />
        <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
          Filters:
        </Typography>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as TaskStatus | 'ALL')}
            label="Status"
          >
            <MenuItem value="ALL">All Statuses</MenuItem>
            <MenuItem value={TaskStatus.NEW}>New</MenuItem>
            <MenuItem value={TaskStatus.NOT_STARTED}>Not Started</MenuItem>
            <MenuItem value={TaskStatus.IN_PROGRESS}>In Progress</MenuItem>
            <MenuItem value={TaskStatus.BLOCKED}>Blocked</MenuItem>
            <MenuItem value={TaskStatus.COMPLETED}>Completed</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Project</InputLabel>
          <Select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value as number | 'ALL')}
            label="Project"
          >
            <MenuItem value="ALL">All Projects</MenuItem>
            {projects?.map((project) => (
              <MenuItem key={project.id} value={project.id}>
                {project.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {!showMyTasks && (<FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Assigned To</InputLabel>
          <Select
            value={filterAssignedUser}
            onChange={(e) => setFilterAssignedUser(e.target.value)}
            label="Assigned To"
          >
            <MenuItem value="ALL">All Users</MenuItem>
            <MenuItem value="UNASSIGNED">Unassigned</MenuItem>
            {users?.map((u) => (
              <MenuItem key={u.username} value={u.username}>
                {u.username}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        )}

        {(filterStatus !== 'ALL' || filterProject !== 'ALL' || filterAssignedUser !== 'ALL') && (
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              setFilterStatus('ALL');
              setFilterProject('ALL');
              setFilterAssignedUser('ALL');
            }}
          >
            Clear Filters
          </Button>
        )}
      </Box>

      {!tasks || tasks.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <Assignment sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {(filterStatus !== 'ALL' || filterProject !== 'ALL' || filterAssignedUser !== 'ALL')
              ? 'No Tasks Match Filters'
              : 'No Tasks Yet'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {(filterStatus !== 'ALL' || filterProject !== 'ALL' || filterAssignedUser !== 'ALL')
              ? 'Try adjusting your filters to see more tasks'
              : (canCreate ? 'Create your first task to get started' : 'No tasks available to view')}
          </Typography>
          {(filterStatus !== 'ALL' || filterProject !== 'ALL' || filterAssignedUser !== 'ALL') ? (
            <Button
              variant="outlined"
              onClick={() => {
                setFilterStatus('ALL');
                setFilterProject('ALL');
                setFilterAssignedUser('ALL');
              }}
            >
              Clear All Filters
            </Button>
          ) : (
            canCreate && (
              <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
                Create Task
              </Button>
            )
          )}
        </Card>
      ) : (
        <Grid container spacing={2}>
          {tasks.map((task) => (
            <Grid item xs={12} key={task.id}>
              <Card
                onClick={() => handleTaskClick(task)}
                sx={{
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Assignment color="primary" />
                        <Typography variant="h6" fontWeight={600}>
                          {task.description}
                        </Typography>
                        <Chip
                          label={task.status.replace('_', ' ')}
                          color={getStatusColor(task.status)}
                          size="small"
                        />
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                        {task.projectName && (
                          <Chip label={`Project: ${task.projectName}`} size="small" variant="outlined" />
                        )}
                        {task.assignedUsername && (
                          <Chip label={`Assigned to: ${task.assignedUsername}`} size="small" />
                        )}
                        {task.ownerUsername && (
                          <Chip label={`Created by: ${task.ownerUsername}`} size="small" variant="outlined" />
                        )}
                        {task.dueDate && (
                          <Chip label={`Due: ${new Date(task.dueDate).toLocaleDateString()}`} size="small" color="warning" variant="outlined" />
                        )}
                      </Box>
                    </Box>

                    {(canUpdate || canDelete) && (
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click
                          handleMenuOpen(e, task);
                        }}
                      >
                        <MoreVert />
                      </IconButton>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Menu anchorEl={menuAnchor?.el} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        {canUpdate && (
          <MenuItem
            onClick={() => {
              if (menuAnchor) handleOpenDialog(menuAnchor.task);
              handleMenuClose();
            }}
          >
            <Edit fontSize="small" sx={{ mr: 1 }} /> Edit
          </MenuItem>
        )}
        {canDelete && (
          <MenuItem
            onClick={() => {
              if (menuAnchor) handleDelete(menuAnchor.task.id);
            }}
            sx={{ color: 'error.main' }}
          >
            <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
          </MenuItem>
        )}
      </Menu>

      {/* Task Detail Dialog - Common Component */}
      <TaskDetailDialog
        open={!!selectedTaskForDetail}
        task={selectedTaskForDetail}
        user={user}
        onClose={() => setSelectedTaskForDetail(null)}
      />

      {/* Create/Edit Task Dialog (existing) */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        <DialogContent>
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
            <InputLabel>Assigned To (Optional)</InputLabel>
            <Select
              value={formData.assignedUsername || ''}
              onChange={(e) => setFormData({ ...formData, assignedUsername: e.target.value })}
              label="Assigned To (Optional)"
            >
              <MenuItem value="">
                <em>None (Unassigned)</em>
              </MenuItem>
              {users?.map((user) => (
                <MenuItem key={user.username} value={user.username}>
                  {user.username} ({user.email})
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
          {editingTask && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status || TaskStatus.NEW}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                label="Status"
              >
                <MenuItem value={TaskStatus.NEW}>New</MenuItem>
                <MenuItem value={TaskStatus.NOT_STARTED}>Not Started</MenuItem>
                <MenuItem value={TaskStatus.IN_PROGRESS}>In Progress</MenuItem>
                <MenuItem value={TaskStatus.BLOCKED}>Blocked</MenuItem>
                <MenuItem value={TaskStatus.COMPLETED}>Completed</MenuItem>
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.description || !formData.projectId}
          >
            {editingTask ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TasksView;


