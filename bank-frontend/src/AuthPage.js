import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Box, TextField, Typography, Alert, 
  Grid, Link, CircularProgress 
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import GlassPanel from './GlassPanel'; 
import GradientButton from './GradientButton'; 

// Use environment variable for production, fallback to local
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  
  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <Container component="main" maxWidth="lg" sx={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
      <Grid container sx={{ 
        height: '80vh', 
        minHeight: 600, 
        borderRadius: '16px', 
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)' 
      }}>
        
        {/* Left Side (Branding) */}
        <Grid item xs={12} sm={5} sx={{ 
          display: { xs: 'none', sm: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 5,
          background: 'linear-gradient(135deg, #004444 30%, #002222 90%)',
          color: 'white',
          borderRadius: '16px 0 0 16px',
        }}>
          <AccountBalanceWalletIcon sx={{ fontSize: 80, mb: 2, color: 'primary.main' }} />
          <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold' }}>
            Vintage Bank
          </Typography>
          <Typography variant="h6" sx={{ mt: 1, textAlign: 'center', color: 'text.secondary' }}>
            Your future, secured.
          </Typography>
        </Grid>

        {/* Right Side (Form) */}
        <Grid item xs={12} sm={7}>
          <GlassPanel sx={{ 
            p: 5, 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            height: '100%',
            borderRadius: { xs: '16px', sm: '0 16px 16px 0' },
            overflowY: 'auto'
          }}>
            {isLogin ? <LoginForm /> : <RegisterForm />}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Link component="button" variant="body2" onClick={toggleForm} sx={{ color: 'text.secondary' }}>
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </Link>
            </Box>
          </GlassPanel>
        </Grid>
      </Grid>
    </Container>
  );
}

// --- Login Form ---
function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API_URL}/login`, { username, password });
      localStorage.setItem('token', response.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
        Sign In
      </Typography>
      {error && <Alert severity="error" sx={{ width: '100%', mb: 2, backgroundColor: 'rgba(255, 82, 82, 0.1)' }}>{error}</Alert>}
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          margin="normal" required fullWidth id="username" label="Username" name="username"
          autoFocus value={username} onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          margin="normal" required fullWidth name="password" label="Password" type="password"
          id="password" value={password} onChange={(e) => setPassword(e.target.value)}
        />
        <GradientButton
          type="submit" fullWidth disabled={isSubmitting}
          sx={{ mt: 3, mb: 2, py: 1.5 }}
        >
          {isSubmitting ? <CircularProgress size={24} sx={{color: '#000'}} /> : 'Sign In'}
        </GradientButton>
      </Box>
    </>
  );
}

// --- Register Form ---
function RegisterForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setIsSubmitting(true);
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setIsSubmitting(false);
      return;
    }
    try {
      await axios.post(`${API_URL}/register`, { username, password, firstName, lastName, email });
      setSuccess('Registration successful! Please sign in.');
      setUsername(''); setPassword(''); setFirstName(''); setLastName(''); setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
        Create Your Account
      </Typography>
      {error && <Alert severity="error" sx={{ width: '100%', mb: 2, backgroundColor: 'rgba(255, 82, 82, 0.1)' }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ width: '100%', mb: 2, backgroundColor: 'rgba(0, 245, 212, 0.1)' }}>{success}</Alert>}
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              required fullWidth id="firstName" label="First Name" name="firstName"
              autoFocus value={firstName} onChange={(e) => setFirstName(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required fullWidth id="lastName" label="Last Name" name="lastName"
              value={lastName} onChange={(e) => setLastName(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required fullWidth id="email" label="Email Address" name="email" type="email"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required fullWidth id="username" label="Username" name="username"
              value={username} onChange={(e) => setUsername(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required fullWidth name="password" label="Password" type="password"
              id="password" value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </Grid>
        </Grid>
        <GradientButton
          type="submit" fullWidth disabled={isSubmitting}
          sx={{ mt: 3, mb: 2, py: 1.5 }}
        >
          {isSubmitting ? <CircularProgress size={24} sx={{color: '#000'}} /> : 'Sign Up'}
        </GradientButton>
      </Box>
    </>
  );
}