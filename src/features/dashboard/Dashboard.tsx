import React, { useState } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Brightness4,
  Brightness7,
  Dashboard as DashboardIcon,
  Assignment,
  Folder,
  Group,
  AccountCircle,
  ExitToApp,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store';
import { setTheme } from '../../store/uiSlice';
import { useLogout } from '../../hooks/useAuth';
import { isAdmin } from '../../utils/permissions';
import ProjectsView from './ProjectsView';
import TasksView from './TasksView';
import UserProfileView from './UserProfileView';
import UserManagementView from './UserManagementView';
import OverviewView from './OverviewView';
import Logo from '../../components/common/Logo';

const DRAWER_WIDTH = 260;

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const logout = useLogout();

  const user = useAppSelector((state) => state.auth.user);
  const currentTheme = useAppSelector((state) => state.ui.theme);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const userIsAdmin = isAdmin(user);

  const menuItems = [
    { text: 'Overview', icon: <DashboardIcon />, path: '/dashboard', show: true },
    { text: 'Projects', icon: <Folder />, path: '/dashboard/projects', show: true },
    { text: 'My Tasks', icon: <Assignment />, path: '/dashboard/tasks', show: true },
    { text: 'All Tasks', icon: <Assignment />, path: '/dashboard/all-tasks', show: true },
    { text: 'User Management', icon: <Group />, path: '/dashboard/users', show: userIsAdmin },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleThemeToggle = () => {
    dispatch(setTheme(currentTheme === 'light' ? 'dark' : 'light'));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Logo
            size={40}
            showText={true}
            textColor="white"
            onClick={() => handleNavigation('/dashboard')}
        />
      </Box>

      <List sx={{ flex: 1, pt: 2 }}>
        {menuItems
          .filter((item) => item.show)
          .map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  '&:hover': {
                    background: theme.palette.primary.main,
                    color: 'white',
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
      </List>

      <Divider />
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: 'action.hover',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {user?.username?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {user?.username}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: 'block',
                wordBreak: 'break-all',
                lineHeight: 1.2,
              }}
            >
              {user?.email}
            </Typography>
          </Box>
        </Box>
        {user?.roles && user.roles.length > 0 && (
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {user.roles.map((role) => (
              <Chip key={role} label={role} size="small" color="primary" variant="outlined" />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          boxShadow: 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Welcome, {user?.username}
          </Typography>

          <IconButton color="inherit" onClick={handleThemeToggle} sx={{ mr: 1 }}>
            {currentTheme === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>

          <IconButton color="inherit" onClick={handleProfileMenuOpen}>
            <AccountCircle />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={() => { handleNavigation('/dashboard/profile'); handleProfileMenuClose(); }}>
              <ListItemIcon>
                <AccountCircle fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <ExitToApp fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: 8,
          bgcolor: 'background.default',
          minHeight: '100vh',
        }}
      >
        <Routes>
          <Route path="/" element={<OverviewView />} />
          <Route path="/projects" element={<ProjectsView />} />
          <Route path="/projects/:projectId/tasks" element={<TasksView showMyTasks={false} />} />
          <Route path="/tasks" element={<TasksView showMyTasks={true} />} />
          <Route path="/all-tasks" element={<TasksView showMyTasks={false} />} />
          <Route path="/profile" element={<UserProfileView />} />
          {userIsAdmin && <Route path="/users" element={<UserManagementView />} />}
        </Routes>
      </Box>
    </Box>
  );
};

export default Dashboard;


