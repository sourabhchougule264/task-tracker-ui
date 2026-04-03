import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Grid,
  Divider,
} from '@mui/material';
import { Email, Person, Shield } from '@mui/icons-material';
import { useAppSelector } from '../../store';

const UserProfileView: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) return null;

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
        My Profile
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '3rem',
                }}
              >
                {user.username.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h5" fontWeight={600}>
                {user.username}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {user.email}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                Account Information
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Person color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Username
                  </Typography>
                </Box>
                <Typography variant="body1" fontWeight={500}>
                  {user.username}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Email color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Email Address
                  </Typography>
                </Box>
                <Typography variant="body1" fontWeight={500}>
                  {user.email}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Shield color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Roles & Permissions
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {user.roles && user.roles.length > 0 ? (
                    user.roles.map((role) => (
                      <Chip key={role} label={role} color="primary" />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No roles assigned
                    </Typography>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserProfileView;




