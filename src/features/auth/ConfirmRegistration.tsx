import React, { useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  Container,
  CircularProgress,
  Alert,
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { useConfirm } from '../../hooks/useAuth';

const ConfirmRegistration: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const confirmMutation = useConfirm();

  const [formData, setFormData] = useState({
    username: (location.state as any)?.username || '',
    confirmationCode: '',
  });
  const [errors, setErrors] = useState<{ username?: string; confirmationCode?: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.confirmationCode.trim()) {
      newErrors.confirmationCode = 'Confirmation code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const result = await confirmMutation.mutateAsync({
      username: formData.username,
      code: formData.confirmationCode,
    });

    if (result.success) {
      setTimeout(() => navigate('/login'), 2000);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Card elevation={8} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              py: 4,
              textAlign: 'center',
            }}
          >
            <CheckCircle sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h4" fontWeight={700}>
              Confirm Your Email
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
              Enter the confirmation code sent to your email
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              Please check your email for the confirmation code.
            </Alert>

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                error={!!errors.username}
                helperText={errors.username}
                margin="normal"
                autoFocus={!formData.username}
              />

              <TextField
                fullWidth
                label="Confirmation Code"
                name="confirmationCode"
                value={formData.confirmationCode}
                onChange={handleChange}
                error={!!errors.confirmationCode}
                helperText={errors.confirmationCode}
                margin="normal"
                autoFocus={!!formData.username}
                placeholder="Enter 6-digit code"
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={confirmMutation.isPending}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                {confirmMutation.isPending ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Confirm Email'
                )}
              </Button>

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Already confirmed?{' '}
                  <Link component={RouterLink} to="/login" sx={{ textDecoration: 'none', fontWeight: 600 }}>
                    Login
                  </Link>
                </Typography>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default ConfirmRegistration;


