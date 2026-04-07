import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Skeleton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Folder,
  Assignment,
  TrendingUp,
  CheckCircle,
  AccessTime,
  Person,
} from '@mui/icons-material';
import { useProjects } from '../../hooks/useProjects';
import { useTasks, useUserTasks } from '../../hooks/useTasks';
import { useAppSelector } from '../../store';
import TaskDetailDialog from '../../components/common/TaskDetailDialog';
import type { Task } from '../../types';
import { TaskStatus } from '../../types';

const OverviewView: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const { data: projects, isLoading: loadingProjects } = useProjects();
  const { data: allTasks, isLoading: loadingAllTasks } = useTasks();
  const { data: myTasks, isLoading: loadingMyTasks } = useUserTasks(user?.username || '');

  const isLoading = loadingProjects || loadingAllTasks || loadingMyTasks;

  // Task detail dialog state
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<Task | null>(null);

  // Calculate statistics
  const totalProjects = projects?.length || 0;
  const totalTasks = allTasks?.length || 0;
  const myTasksCount = myTasks?.length || 0;
  const completedTasks = allTasks?.filter(t => t.status === TaskStatus.COMPLETED).length || 0;
  const inProgressTasks = allTasks?.filter(t => t.status === TaskStatus.IN_PROGRESS).length || 0;
  const blockedTasks = allTasks?.filter(t => t.status === TaskStatus.BLOCKED).length || 0;

  // Get recent projects (last 5)
  const recentProjects = projects?.slice(0, 5) || [];

  // Get my recent tasks (last 5)
  const recentMyTasks = myTasks?.slice(0, 5) || [];

  const statsCards = [
    { title: 'Total Projects', value: totalProjects, icon: <Folder />, color: 'primary.main', path: '/dashboard/projects' },
    { title: 'Total Tasks', value: totalTasks, icon: <Assignment />, color: 'secondary.main', path: '/dashboard/all-tasks' },
    { title: 'My Tasks', value: myTasksCount, icon: <Person />, color: 'info.main', path: '/dashboard/tasks' },
    { title: 'Completed', value: completedTasks, icon: <CheckCircle />, color: 'success.main', path: '/dashboard/all-tasks?status=COMPLETED' },
    { title: 'In Progress', value: inProgressTasks, icon: <TrendingUp />, color: 'warning.main', path: '/dashboard/all-tasks?status=IN_PROGRESS' },
    { title: 'Blocked', value: blockedTasks, icon: <AccessTime />, color: 'error.main', path: '/dashboard/all-tasks?status=BLOCKED' },
  ];

  if (isLoading) {
    return (
      <Box>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
          Dashboard Overview
        </Typography>
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={i}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <DashboardIcon color="primary" sx={{ fontSize: 40 }} />
        <Typography variant="h4" fontWeight={700}>
          Dashboard Overview
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
            <Card
              onClick={() => navigate(stat.path)}
              sx={(theme) => {
                // Get the actual color value from the theme
                const getColorValue = (colorPath: string) => {
                  const parts = colorPath.split('.');
                  let value: any = theme.palette;
                  for (const part of parts) {
                    value = value?.[part];
                  }
                  return value || colorPath;
                };

                const mainColor = getColorValue(stat.color);

                return {
                  background: `linear-gradient(135deg, ${mainColor} 0%, ${mainColor} 100%)`,
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: 6,
                  },
                };
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ opacity: 0.8, color: 'white' }}>{stat.icon}</Box>
                  <Typography variant="h3" fontWeight={700} sx={{ color: 'white' }}>
                    {stat.value}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.9, color: 'white' }}>
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Projects */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Recent Projects
              </Typography>
              <Button size="small" onClick={() => navigate('/dashboard/projects')}>
                View All
              </Button>
            </Box>

            {recentProjects.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No projects yet. Create your first project!
              </Typography>
            ) : (
              <List>
                {recentProjects.map((project) => (
                  <ListItem
                    key={project.id}
                    sx={{
                      borderRadius: 1,
                      mb: 1,
                      bgcolor: 'action.hover',
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'action.selected',
                      },
                    }}
                    onClick={() => navigate(`/dashboard/projects/${project.id}/tasks`)}
                  >
                    <ListItemIcon>
                      <Folder color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={project.name}
                      secondary={project.description}
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                    {project.ownerUsername && (
                      <Chip label={project.ownerUsername} size="small" variant="outlined" />
                    )}
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* My Recent Tasks */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                My Recent Tasks
              </Typography>
              <Button size="small" onClick={() => navigate('/dashboard/tasks')}>
                View All
              </Button>
            </Box>

            {recentMyTasks.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No tasks assigned to you yet.
              </Typography>
            ) : (
              <List>
                {recentMyTasks.map((task) => (
                  <ListItem
                    key={task.id}
                    onClick={() => setSelectedTaskForDetail(task)}
                    sx={{
                      borderRadius: 1,
                      mb: 1,
                      bgcolor: 'action.hover',
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'action.selected',
                      },
                    }}
                  >
                    <ListItemIcon>
                      <Assignment color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={task.description}
                      secondary={task.projectName || 'No project'}
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                    <Chip
                      label={task.status.replace('_', ' ')}
                      size="small"
                      color={
                        task.status === TaskStatus.COMPLETED ? 'success' :
                        task.status === TaskStatus.IN_PROGRESS ? 'warning' :
                        task.status === TaskStatus.BLOCKED ? 'error' : 'default'
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Task Detail Dialog - Common Component */}
      <TaskDetailDialog
        open={!!selectedTaskForDetail}
        task={selectedTaskForDetail}
        user={user}
        onClose={() => setSelectedTaskForDetail(null)}
      />
    </Box>
  );
};

export default OverviewView;

