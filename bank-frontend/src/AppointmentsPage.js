import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container, Typography, Box, Grid, Button, TextField, List, 
  ListItem, ListItemText, Divider, AppBar, Toolbar, CircularProgress, Alert,
  Select, MenuItem, FormControl, InputLabel, Chip, ListItemIcon, IconButton
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LogoutIcon from '@mui/icons-material/Logout';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
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


// --- Main Appointments Page Component ---
export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    navigate('/auth');
  }, [navigate]);

  const fetchAppointments = useCallback(async () => {
    setLoading(true); 
    try {
      const response = await apiClient.get('/api/appointments');
      setAppointments(response.data);
      setError('');
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleLogout();
      } else {
        setError('Could not fetch appointments.');
      }
    } finally {
      setLoading(false);
    }
  }, [handleLogout]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleCancel = async (appointmentId) => {
    setActionError('');
    setActionSuccess('');
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await apiClient.delete(`/api/appointments/${appointmentId}`);
        setActionSuccess('Appointment cancelled successfully.');
        fetchAppointments(); 
      } catch (err) {
        setActionError(err.response?.data?.message || 'Failed to cancel appointment.');
      }
    }
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
            sx={{ mr: 1, color: 'text.secondary', '&:hover': { color: 'text.primary', bgcolor: 'rgba(5, 255, 158, 0.1)' } }}
          >
            Dashboard
          </Button>
          <IconButton
            component={RouterLink} to="/profile" color="inherit"
            sx={{ mr: 2, color: 'text.secondary', '&:hover': { color: 'text.primary', bgcolor: 'rgba(5, 255, 158, 0.1)' } }}
          >
            <PersonIcon />
          </IconButton>
          <Button 
            color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}
            sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary', bgcolor: 'rgba(5, 255, 158, 0.1)' } }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Manage Appointments
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2, backgroundColor: 'rgba(255, 82, 82, 0.1)' }}>{error}</Alert>}
        {actionError && <Alert severity="error" sx={{ mb: 2, backgroundColor: 'rgba(255, 82, 82, 0.1)' }}>{actionError}</Alert>}
        {actionSuccess && <Alert severity="success" sx={{ mb: 2, backgroundColor: 'rgba(0, 245, 212, 0.1)' }}>{actionSuccess}</Alert>}
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <GlassPanel sx={{ p: 3 }}>
              <ScheduleAppointmentForm onSuccess={fetchAppointments} />
            </GlassPanel>
          </Grid>
          <Grid item xs={12} md={7}>
            <GlassPanel sx={{ p: 3 }}>
              <AppointmentsList appointments={appointments} loading={loading} onCancel={handleCancel} />
            </GlassPanel>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

// --- ScheduleAppointmentForm ---
function ScheduleAppointmentForm({ onSuccess }) {
  const [service, setService] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setIsSubmitting(true);
    const appointmentDateTime = new Date(`${date}T${time}`);
    if (appointmentDateTime < new Date()) {
       setError('Cannot schedule an appointment in the past.');
       setIsSubmitting(false);
       return;
    }
    try {
      const response = await apiClient.post('/api/appointments', { service, date, time });
      setSuccess(response.data.message);
      setService(''); setDate(''); setTime('');
      if (onSuccess) onSuccess(); 
    } catch (err) {
      setError(err.response?.data?.message || 'Scheduling failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography component="h2" variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
        Schedule a Service
      </Typography>
      {error && <Alert severity="error" sx={{ my: 2, backgroundColor: 'rgba(255, 82, 82, 0.1)' }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ my: 2, backgroundColor: 'rgba(0, 245, 212, 0.1)' }}>{success}</Alert>}
      <FormControl fullWidth margin="normal" required>
        <InputLabel id="service-label">Service</InputLabel>
        <Select labelId="service-label" value={service} label="Service" onChange={(e) => setService(e.target.value)}>
          <MenuItem value="Financial Advising">Financial Advising</MenuItem>
          <MenuItem value="Loan Application">Loan Application</MenuItem>
          <MenuItem value="New Account Setup">New Account Setup</MenuItem>
          <MenuItem value="Other">Other</MenuItem>
        </Select>
      </FormControl>
      <TextField label="Date" type="date" fullWidth required margin="normal" value={date}
        onChange={(e) => setDate(e.target.value)} InputLabelProps={{ shrink: true }}
        inputProps={{ min: today }} 
      />
      <TextField label="Time" type="time" fullWidth required margin="normal" value={time}
        onChange={(e) => setTime(e.target.value)} InputLabelProps={{ shrink: true }}
        inputProps={{ min: "09:00", max: "17:00", step: 900 }}
      />
      <GradientButton type="submit" fullWidth disabled={isSubmitting} startIcon={<EventAvailableIcon />} sx={{ mt: 2 }}>
        {isSubmitting ? <CircularProgress size={24} sx={{color: '#000'}} /> : 'Schedule Appointment'}
      </GradientButton>
    </Box>
  );
}

// --- AppointmentsList (Time Fix) ---
function AppointmentsList({ appointments, loading, onCancel }) {
  const formatDateTime = (dateStr, timeStr) => {
    try {
      const dateObj = new Date(dateStr + 'T' + timeStr);
      if (isNaN(dateObj.getTime())) return "Invalid Date";
      const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true };
      return new Intl.DateTimeFormat('en-US', options).format(dateObj);
    } catch (e) {
      console.error("Error formatting date/time:", e);
      return `${dateStr} ${timeStr}`;
    }
  };

  return (
    <>
      <Typography component="h2" variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
        Your Appointments
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>
      ) : (
        <List sx={{ maxHeight: '500px', overflow: 'auto' }}>
          {appointments.length === 0 ? (
            <Typography sx={{ color: 'text.secondary', mt: 2, p: 1 }}>
              You have no appointments scheduled.
            </Typography>
          ) : (
            appointments.map((appt, index) => (
              <React.Fragment key={appt.id}>
                <ListItem 
                  sx={{ p: '12px 4px', '&:hover': { bgcolor: 'rgba(5, 255, 158, 0.05)'}, borderRadius: '8px' }}
                  secondaryAction={
                    <IconButton edge="end" aria-label="cancel" onClick={() => onCancel(appt.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemIcon>
                    <EventAvailableIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>{appt.service}</Typography>}
                    secondary={formatDateTime(appt.date, appt.time)} 
                  />
                  <Chip 
                    label={appt.status} 
                    color={appt.status === 'Scheduled' ? 'secondary' : 'default'} 
                    size="small"
                    sx={{ mr: 6, bgcolor: 'secondary.main', color: '#000', fontWeight: 'bold' }}
                  />
                </ListItem>
                {index < appointments.length - 1 && <Divider component="li" sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />}
              </React.Fragment>
            ))
          )}
        </List>
      )}
    </>
  );
}