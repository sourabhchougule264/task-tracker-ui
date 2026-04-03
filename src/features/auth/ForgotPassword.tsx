import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
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
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { LockReset } from '@mui/icons-material';
import authService from '../../services/authService';
import { useAppDispatch } from '../../store';
import { showNotification } from '../../store/uiSlice';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    confirmationCode: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<{
    username?: string;
    confirmationCode?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: typeof errors = {};
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: typeof errors = {};
    if (!formData.confirmationCode.trim()) {
      newErrors.confirmationCode = 'Confirmation code is required';
    }
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) return;

    setLoading(true);
    try {
      const result = await authService.forgotPassword(formData.username);
      dispatch(showNotification({ message: result.message, severity: 'success' }));
      setActiveStep(1);
    } catch (error: any) {
      dispatch(showNotification({
        message: error.response?.data?.message || 'Failed to send reset code',
        severity: 'error',
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setLoading(true);
    try {
      await authService.confirmForgotPassword(
        formData.username,
        formData.confirmationCode,
        formData.newPassword
      );
      dispatch(showNotification({
        message: 'Password reset successfully!',
        severity: 'success',
      }));
      setTimeout(() => navigate('/login'), 2000);
    } catch (error: any) {
      dispatch(showNotification({
        message: error.response?.data?.message || 'Failed to reset password',
        severity: 'error',
      }));
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Enter Username', 'Reset Password'];

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
            <LockReset sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h4" fontWeight={700}>
              Reset Password
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
              Enter your username to receive a reset code
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {activeStep === 0 ? (
              <form onSubmit={handleRequestCode}>
                <Alert severity="info" sx={{ mb: 3 }}>
                  Enter your username and we'll send you a reset code via email.
                </Alert>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  error={!!errors.username}
                  helperText={errors.username}
                  margin="normal"
                  autoFocus
                />
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    mt: 3,
                    py: 1.5,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Code'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword}>
                <Alert severity="info" sx={{ mb: 3 }}>
                  Check your email for the confirmation code.
                </Alert>
                <TextField
                  fullWidth
                  label="Confirmation Code"
                  name="confirmationCode"
                  value={formData.confirmationCode}
                  onChange={handleChange}
                  error={!!errors.confirmationCode}
                  helperText={errors.confirmationCode}
                  margin="normal"
                  autoFocus
                />
                <TextField
                  fullWidth
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  error={!!errors.newPassword}
                  helperText={errors.newPassword}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  margin="normal"
                />
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    mt: 3,
                    py: 1.5,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
                </Button>
              </form>
            )}

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Remember your password?{' '}
                <Link component={RouterLink} to="/login" sx={{ textDecoration: 'none', fontWeight: 600 }}>
                  Login
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default ForgotPassword;


