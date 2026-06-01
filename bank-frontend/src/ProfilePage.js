import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container, Typography, Box, Button, TextField, 
  AppBar, Toolbar, CircularProgress, Alert, Tabs, Tab
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import GlassPanel from './GlassPanel';
import GradientButton from './GradientButton';

// Use environment variable for production, fallback to local
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// --- Reusable API client ---
const apiClient = axios.create({ baseURL: API_URL });
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) { config.headers.Authorization = `Bearer ${token}`; }
  return config;
}, (error) => Promise.reject(error));


// --- Main Profile Page Component ---
export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabIndex, setTabIndex] = useState(0);
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    navigate('/auth');
  }, [navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('/api/profile');
        setProfile(response.data);
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          handleLogout();
        } else {
          setError('Could not fetch profile data.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [handleLogout]);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <AccountBalanceWalletIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Vintage Bank
          </Typography>
          <Button
            component={RouterLink} to="/" color="inherit" startIcon={<ArrowBackIcon />}
            sx={{ mr: 2, color: 'text.secondary', '&:hover': { color: 'text.primary', bgcolor: 'rgba(5, 255, 158, 0.1)' } }}
          >
            Back to Dashboard
          </Button>
          <Button 
            color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}
            sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary', bgcolor: 'rgba(5, 255, 158, 0.1)' } }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container component="main" maxWidth="md" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Your Profile
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2, backgroundColor: 'rgba(255, 82, 82, 0.1)' }}>{error}</Alert>}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>
        ) : profile && (
          <GlassPanel sx={{ p: 0, overflow: 'hidden' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabIndex} onChange={handleTabChange} variant="fullWidth">
                <Tab label="Update Profile" icon={<PersonIcon />} iconPosition="start" />
                <Tab label="Change Password" icon={<LockIcon />} iconPosition="start" />
              </Tabs>
            </Box>
            <Box sx={{ p: 3 }}>
              {tabIndex === 0 && <ProfileUpdateForm profile={profile} />}
              {tabIndex === 1 && <PasswordUpdateForm />}
            </Box>
          </GlassPanel>
        )}
      </Container>
    </Box>
  );
}

// --- ProfileUpdateForm ---
function ProfileUpdateForm({ profile }) {
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [email, setEmail] = useState(profile.email);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setIsSubmitting(true);
    try {
      const response = await apiClient.put('/api/profile', { firstName, lastName, email });
      setSuccess(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography component="h2" variant="h6" gutterBottom>
        Update Your Information
      </Typography>
      {error && <Alert severity="error" sx={{ my: 2, backgroundColor: 'rgba(255, 82, 82, 0.1)' }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ my: 2, backgroundColor: 'rgba(0, 245, 212, 0.1)' }}>{success}</Alert>}
      <TextField
        label="Username" fullWidth margin="normal" value={profile.username}
        disabled
      />
      <TextField
        label="First Name" fullWidth required margin="normal"
        value={firstName} onChange={(e) => setFirstName(e.target.value)}
      />
      <TextField
        label="Last Name" fullWidth required margin="normal"
        value={lastName} onChange={(e) => setLastName(e.target.value)}
      />
      <TextField
        label="Email" type="email" fullWidth required margin="normal"
        value={email} onChange={(e) => setEmail(e.target.value)}
      />
      <GradientButton type="submit" fullWidth disabled={isSubmitting} sx={{ mt: 2 }}>
        {isSubmitting ? <CircularProgress size={24} sx={{color: '#000'}} /> : 'Save Changes'}
      </GradientButton>
    </Box>
  );
}

// --- PasswordUpdateForm ---
function PasswordUpdateForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await apiClient.put('/api/profile/password', { currentPassword, newPassword });
      setSuccess(response.data.message);
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography component="h2" variant="h6" gutterBottom>
        Change Your Password
      </Typography> 
      {error && <Alert severity="error" sx={{ my: 2, backgroundColor: 'rgba(255, 82, 82, 0.1)' }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ my: 2, backgroundColor: 'rgba(0, 245, 212, 0.1)' }}>{success}</Alert>}
      <TextField
        label="Current Password" type="password" fullWidth required margin="normal"
        value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
      />
      <TextField
        label="New Password" type="password" fullWidth required margin="normal"
        value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
      />
      <TextField
        label="Confirm New Password" type="password" fullWidth required margin="normal"
        value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <GradientButton type="submit" fullWidth disabled={isSubmitting} sx={{ mt: 2 }}>
        {isSubmitting ? <CircularProgress size={24} sx={{color: '#000'}} /> : 'Update Password'}
      </GradientButton>
    </Box>
  );
}