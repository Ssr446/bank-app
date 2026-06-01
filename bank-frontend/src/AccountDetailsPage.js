import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link as RouterLink, useParams } from 'react-router-dom';
import {
  Container, Typography, Box, Grid, Button, List,
  ListItem, ListItemText, Divider, AppBar, Toolbar, CircularProgress, Alert,
  ListItemIcon, IconButton
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import PersonIcon from '@mui/icons-material/Person';
import GlassPanel from './GlassPanel';
import AnimatedCounter from './AnimatedCounter';

// Use environment variable for production, fallback to local
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// --- Reusable API client ---
const apiClient = axios.create({ baseURL: API_URL });
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) { config.headers.Authorization = `Bearer ${token}`; }
  return config;
}, (error) => Promise.reject(error));

// --- formatTimestamp Function ---
const formatTimestamp = (timestamp) => {
  try { const utcTimestamp = timestamp.endsWith('Z') || timestamp.includes('+') ? timestamp : timestamp + 'Z'; const dateObj = new Date(utcTimestamp); if (isNaN(dateObj.getTime())) return "Invalid Date"; const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone; const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true, timeZone: userTimeZone }; return new Intl.DateTimeFormat('en-US', options).format(dateObj); } catch (e) { console.error("Error formatting timestamp:", e); return timestamp; }
};

// --- Main Account Details Page Component ---
export default function AccountDetailsPage() {
  const [accountData, setAccountData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    navigate('/auth');
  }, [navigate]);

  useEffect(() => {
    const fetchAccountData = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(`/api/account/${id}`);
        setAccountData(response.data);
        setError('');
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          handleLogout();
        } else {
          setError(err.response?.data?.message || 'Could not fetch account data.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAccountData();
  }, [id, handleLogout]);

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

      <Container component="main" maxWidth="md" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        {error && <Alert severity="error" sx={{ mb: 2, backgroundColor: 'rgba(255, 82, 82, 0.1)' }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>
        ) : accountData && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <GlassPanel sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" component="h1" gutterBottom>
                    {accountData.account.accountName}
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                    {accountData.account.accountType}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Current Balance
                  </Typography>
                  <AnimatedCounter
                    end={accountData.account.balance}
                    variant="h4"
                    sx={{ color: 'primary.main', fontWeight: 'bold' }}
                  />
                </Box>
              </GlassPanel>
            </Grid>
            <Grid item xs={12}>
              <GlassPanel sx={{ p: 3 }}>
                <Typography component="h2" variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Full Transaction History
                </Typography>
                <List sx={{ maxHeight: '60vh', overflow: 'auto' }}>
                  {accountData.transactions.length === 0 ? (
                    <Typography sx={{ color: 'text.secondary', mt: 2, p: 1 }}>
                      No transactions for this account.
                    </Typography>
                  ) : (
                    accountData.transactions.map((tx, index) => (
                      <React.Fragment key={tx.id}>
                        <ListItem sx={{ p: '12px 4px', '&:hover': { bgcolor: 'rgba(5, 255, 158, 0.05)'}, borderRadius: '8px' }}>
                          <ListItemIcon>
                            {tx.type === 'DEBIT' ? (
                              <ArrowUpwardIcon color="error" />
                            ) : (
                              <ArrowDownwardIcon color="secondary" />
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={<Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>{tx.description}</Typography>}
                            secondary={formatTimestamp(tx.timestamp)}
                          />
                          <Typography
                            variant="body1"
                            color={tx.type === 'DEBIT' ? 'error.main' : 'secondary.main'}
                            sx={{ fontWeight: 'bold', minWidth: '90px', textAlign: 'right' }}
                          >
                            {tx.type === 'DEBIT' ? '-' : '+'}₹{tx.amount.toFixed(2)}
                          </Typography>
                        </ListItem>
                        {index < accountData.transactions.length - 1 && <Divider component="li" sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />}
                      </React.Fragment>
                    ))
                  )}
                </List>
              </GlassPanel>
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  );
}