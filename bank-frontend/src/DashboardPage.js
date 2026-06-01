import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container, Typography, Box, Grid, Button, TextField, List,
  ListItem, ListItemText, Divider, AppBar, Toolbar, CircularProgress, Alert,
  Select, MenuItem, FormControl, InputLabel, ListItemIcon, Tabs, Tab, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LogoutIcon from '@mui/icons-material/Logout';
import SendIcon from '@mui/icons-material/Send';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import SavingsIcon from '@mui/icons-material/Savings';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import GlassPanel from './GlassPanel';
import GradientButton from './GradientButton';
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

// --- Clock Component ---
const Clock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timerId = setInterval(() => { setTime(new Date()); }, 1000);
    return () => clearInterval(timerId);
  }, []);
  const formatTime = (date) => { try { const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone; const options = { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true, timeZone: userTimeZone, timeZoneName: 'short' }; return new Intl.DateTimeFormat('en-US', options).format(date); } catch (e) { console.error("Error formatting clock time:", e); return date.toLocaleTimeString(); } };
  return ( <Typography sx={{ color: 'text.secondary', mr: 2, fontSize: '0.9rem', minWidth: '130px', textAlign: 'right' }}> {formatTime(time)} </Typography> );
};

// --- formatTimestamp Function ---
const formatTimestamp = (timestamp) => {
  try { const utcTimestamp = timestamp.endsWith('Z') || timestamp.includes('+') ? timestamp : timestamp + 'Z'; const dateObj = new Date(utcTimestamp); if (isNaN(dateObj.getTime())) return "Invalid Date"; const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone; const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true, timeZone: userTimeZone }; return new Intl.DateTimeFormat('en-US', options).format(dateObj); } catch (e) { console.error("Error formatting timestamp:", e); return timestamp; }
};

// --- Main Dashboard Component ---
export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogout = useCallback(() => { localStorage.removeItem('token'); navigate('/auth'); }, [navigate]);
  const fetchDashboardData = useCallback(async () => { try { const response = await apiClient.get('/api/dashboard'); setDashboardData(response.data); setError(''); } catch (err) { if (err.response?.status === 401 || err.response?.status === 403) { handleLogout(); } else { setError('Could not fetch dashboard data. Please refresh.'); } } finally { setLoading(false); } }, [handleLogout]);
  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);
  const onActionSuccess = () => { fetchDashboardData(); };

  if (loading) { return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>; }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <AccountBalanceWalletIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', flexGrow: 1 }}> Vintage Bank </Typography>
          <Clock />
          <Button component={RouterLink} to="/appointments" color="inherit" startIcon={<EventAvailableIcon />} sx={{ mr: 1, color: 'text.secondary', '&:hover': { color: 'text.primary', bgcolor: 'rgba(5, 255, 158, 0.1)' } }} > Appointments </Button>
          <IconButton component={RouterLink} to="/profile" color="inherit" sx={{ mr: 2, color: 'text.secondary', '&:hover': { color: 'text.primary', bgcolor: 'rgba(5, 255, 158, 0.1)' } }} > <PersonIcon /> </IconButton>
          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />} sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary', bgcolor: 'rgba(5, 255, 158, 0.1)' } }} > Logout </Button>
        </Toolbar>
      </AppBar>

      <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        {error && <Alert severity="error" sx={{ mb: 2, backgroundColor: 'rgba(255, 82, 82, 0.1)' }}>{error}</Alert>}

        {dashboardData && (
          <Grid container spacing={3}>
            {/* Welcome Message (Full Width at Top) */}
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-start' }} >
              <Typography variant="h4" component="h1" gutterBottom >
                Welcome back, {dashboardData.username}
              </Typography>
            </Grid>

            {/* Left Column (Actions + History) */}
            <Grid item xs={12} md={5}>
              <Grid container direction="column" spacing={3}>
                {/* Financial Actions (Top Left) */}
                <Grid item xs={12}>
                  <GlassPanel sx={{ p: 3, height: '100%' }}>
                    <ActionsForm accounts={dashboardData.accounts} onSuccess={onActionSuccess} />
                  </GlassPanel>
                </Grid>
                {/* Recent Activity (Bottom Left) */}
                <Grid item xs={12}>
                   <GlassPanel sx={{ p: 3, height: '100%' }}>
                     <TransactionHistory transactions={dashboardData.recentTransactions} />
                   </GlassPanel>
                </Grid>
              </Grid>
            </Grid>

            {/* Right Column (Accounts Overview) */}
            <Grid item xs={12} md={7}>
              <GlassPanel sx={{p: 3, height: '100%' }}>
                <AccountsOverview accounts={dashboardData.accounts} onSuccess={onActionSuccess} />
              </GlassPanel>
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  );
}

// --- AccountsOverview ---
function AccountsOverview({ accounts, onSuccess }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography component="h2" variant="h5" sx={{ fontWeight: 'bold' }}>
          Your Accounts
        </Typography>
        <Button startIcon={<AddIcon />} onClick={() => setOpen(true)} variant="outlined" color="primary" sx={{ borderColor: 'primary.main', color: 'primary.main', '&:hover': { backgroundColor: 'rgba(5, 255, 158, 0.1)', borderColor: 'primary.main' } }} > New Account </Button>
      </Box>
      <Grid container spacing={2}>
        {accounts.length === 0 ? (
          <Grid item xs={12}><Typography sx={{color: 'text.secondary', textAlign: 'center', mt: 4}}> You have no accounts. Click "New Account" to get started. </Typography></Grid>
        ) : (
          accounts.map((account) => (
            <Grid item xs={12} key={account.id}> 
              <GlassPanel component={RouterLink} to={`/account/${account.id}`} sx={{ p: 2.5, textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', '&:hover': { borderColor: 'primary.main', transform: 'scale(1.02)', boxShadow: '0 0 20px rgba(5, 255, 158, 0.3)'} }} >
                <Box sx={{ flexGrow: 1, mr: 2 }}>
                  <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 'bold' }}> {account.accountName} </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}> {account.accountType} </Typography>
                </Box>
                <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                  <AnimatedCounter end={account.balance} variant="h5" sx={{ color: 'primary.main', fontWeight: 'bold' }} />
                </Box>
              </GlassPanel>
            </Grid>
          ))
        )}
      </Grid>
      <CreateAccountDialog open={open} onClose={() => setOpen(false)} onSuccess={onSuccess} />
    </>
  );
}

// --- CreateAccountDialog ---
function CreateAccountDialog({ open, onClose, onSuccess }) {
  const [accountName, setAccountName] = useState(''); const [accountType, setAccountType] = useState('Checking'); const [error, setError] = useState(''); const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e) => { e.preventDefault(); setError(''); setIsSubmitting(true); try { await apiClient.post('/api/accounts', { accountName, accountType }); if (onSuccess) onSuccess(); onClose(); setAccountName(''); setAccountType('Checking'); } catch (err) { setError(err.response?.data?.message || 'Failed to create account.'); } finally { setIsSubmitting(false); } };
  return ( <Dialog open={open} onClose={onClose} PaperComponent={GlassPanel} PaperProps={{component: 'form', onSubmit: handleSubmit}}> <DialogTitle sx={{color: 'primary.main'}}>Create New Account</DialogTitle> <DialogContent> {error && <Alert severity="error" sx={{ mb: 2, backgroundColor: 'rgba(255, 82, 82, 0.1)' }}>{error}</Alert>} <TextField autoFocus margin="dense" id="accountName" label="Account Name (e.g., 'Vacation Fund')" type="text" fullWidth variant="outlined" value={accountName} onChange={(e) => setAccountName(e.target.value)} required /> <FormControl fullWidth margin="normal" required> <InputLabel id="account-type-label">Account Type</InputLabel> <Select labelId="account-type-label" id="accountType" value={accountType} label="Account Type" onChange={(e) => setAccountType(e.target.value)}> <MenuItem value="Checking">Checking</MenuItem> <MenuItem value="Savings">Savings</MenuItem> </Select> </FormControl> </DialogContent> <DialogActions sx={{p: '0 24px 24px'}}> <Button onClick={onClose} disabled={isSubmitting} sx={{color: 'text.secondary'}}>Cancel</Button> <GradientButton type="submit" disabled={isSubmitting}> {isSubmitting ? <CircularProgress size={24} sx={{color: '#000'}} /> : 'Create'} </GradientButton> </DialogActions> </Dialog> );
}

// --- ActionsForm ---
function ActionsForm({ accounts, onSuccess }) {
  const [tabIndex, setTabIndex] = useState(0); const handleChange = (event, newValue) => { setTabIndex(newValue); };
  if (accounts.length === 0) { return ( <Box> <Typography component="h2" variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}> Financial Actions </Typography> <Alert severity="info" sx={{backgroundColor: 'rgba(2, 136, 209, 0.1)'}}>You must create an account to make transactions.</Alert> </Box> ); }
  return ( <Box> <Typography component="h2" variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}> Financial Actions </Typography> <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}> <Tabs value={tabIndex} onChange={handleChange} variant="fullWidth"> <Tab label="Transfer" icon={<SendIcon />} iconPosition="start" /> <Tab label="Deposit" icon={<SavingsIcon />} iconPosition="start" /> <Tab label="Withdraw" icon={<AccountBalanceIcon />} iconPosition="start" /> </Tabs> </Box> {tabIndex === 0 && <TransferForm accounts={accounts} onSuccess={onSuccess} />} {tabIndex === 1 && <DepositForm accounts={accounts} onSuccess={onSuccess} />} {tabIndex === 2 && <WithdrawForm accounts={accounts} onSuccess={onSuccess} />} </Box> );
}

// --- TransferForm ---
function TransferForm({ accounts, onSuccess }) {
  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || ''); const [recipientUsername, setRecipientUsername] = useState(''); const [amount, setAmount] = useState(''); const [error, setError] = useState(''); const [success, setSuccess] = useState(''); const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e) => { e.preventDefault(); setError(''); setSuccess(''); setIsSubmitting(true); try { const response = await apiClient.post('/api/transfer', { fromAccountId, recipientUsername, amount: parseFloat(amount) }); setSuccess(response.data.message); setRecipientUsername(''); setAmount(''); if (onSuccess) onSuccess(); } catch (err) { setError(err.response?.data?.message || 'Transfer failed.'); } finally { setIsSubmitting(false); } };
  return ( <Box component="form" onSubmit={handleSubmit}> {error && <Alert severity="error" sx={{ my: 2, backgroundColor: 'rgba(255, 82, 82, 0.1)' }}>{error}</Alert>} {success && <Alert severity="success" sx={{ my: 2, backgroundColor: 'rgba(0, 245, 212, 0.1)' }}>{success}</Alert>} <FormControl fullWidth margin="normal" required> <InputLabel id="from-account-label">From Account</InputLabel> <Select labelId="from-account-label" value={fromAccountId} label="From Account" onChange={(e) => setFromAccountId(e.target.value)}> {accounts.map((account) => ( <MenuItem key={account.id} value={account.id}> {account.accountName} (₹{account.balance.toFixed(2)}) </MenuItem> ))} </Select> </FormControl> <TextField label="Recipient's Username" fullWidth required margin="normal" value={recipientUsername} onChange={(e) => setRecipientUsername(e.target.value)} /> <TextField label="Amount" type="number" fullWidth required margin="normal" value={amount} onChange={(e) => setAmount(e.target.value)} inputProps={{ min: "0.01", step: "0.01" }} /> <GradientButton type="submit" fullWidth disabled={isSubmitting} startIcon={<SendIcon />} sx={{ mt: 2 }}> {isSubmitting ? <CircularProgress size={24} sx={{color: '#000'}} /> : 'Send Money'} </GradientButton> </Box> );
}

// --- DepositForm ---
function DepositForm({ accounts, onSuccess }) {
  const [toAccountId, setToAccountId] = useState(accounts[0]?.id || ''); const [amount, setAmount] = useState(''); const [error, setError] = useState(''); const [success, setSuccess] = useState(''); const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e) => { e.preventDefault(); setError(''); setSuccess(''); setIsSubmitting(true); try { const response = await apiClient.post('/api/deposit', { toAccountId: toAccountId, amount: parseFloat(amount) }); setSuccess(response.data.message); setAmount(''); if (onSuccess) onSuccess(); } catch (err) { setError(err.response?.data?.message || 'Deposit failed.'); } finally { setIsSubmitting(false); } };
  return ( <Box component="form" onSubmit={handleSubmit}> {error && <Alert severity="error" sx={{ my: 2, backgroundColor: 'rgba(255, 82, 82, 0.1)' }}>{error}</Alert>} {success && <Alert severity="success" sx={{ my: 2, backgroundColor: 'rgba(0, 245, 212, 0.1)' }}>{success}</Alert>} <FormControl fullWidth margin="normal" required> <InputLabel id="to-account-label">To Account</InputLabel> <Select labelId="to-account-label" value={toAccountId} label="To Account" onChange={(e) => setToAccountId(e.target.value)}> {accounts.map((account) => ( <MenuItem key={account.id} value={account.id}> {account.accountName} (₹{account.balance.toFixed(2)}) </MenuItem> ))} </Select> </FormControl> <TextField label="Amount" type="number" fullWidth required margin="normal" value={amount} onChange={(e) => setAmount(e.target.value)} inputProps={{ min: "0.01", step: "0.01" }} /> <GradientButton type="submit" fullWidth disabled={isSubmitting} startIcon={<SavingsIcon />} sx={{ mt: 2 }}> {isSubmitting ? <CircularProgress size={24} sx={{color: '#000'}} /> : 'Deposit Money'} </GradientButton> </Box> );
}

// --- WithdrawForm ---
function WithdrawForm({ accounts, onSuccess }) {
  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || ''); const [amount, setAmount] = useState(''); const [error, setError] = useState(''); const [success, setSuccess] = useState(''); const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e) => { e.preventDefault(); setError(''); setSuccess(''); setIsSubmitting(true); try { const response = await apiClient.post('/api/withdraw', { fromAccountId, amount: parseFloat(amount) }); setSuccess(response.data.message); setAmount(''); if (onSuccess) onSuccess(); } catch (err) { setError(err.response?.data?.message || 'Withdrawal failed.'); } finally { setIsSubmitting(false); } };
  return ( <Box component="form" onSubmit={handleSubmit}> {error && <Alert severity="error" sx={{ my: 2, backgroundColor: 'rgba(255, 82, 82, 0.1)' }}>{error}</Alert>} {success && <Alert severity="success" sx={{ my: 2, backgroundColor: 'rgba(0, 245, 212, 0.1)' }}>{success}</Alert>} <FormControl fullWidth margin="normal" required> <InputLabel id="from-account-label">From Account</InputLabel> <Select labelId="from-account-label" value={fromAccountId} label="From Account" onChange={(e) => setFromAccountId(e.target.value)}> {accounts.map((account) => ( <MenuItem key={account.id} value={account.id}> {account.accountName} (₹{account.balance.toFixed(2)}) </MenuItem> ))} </Select> </FormControl> <TextField label="Amount" type="number" fullWidth required margin="normal" value={amount} onChange={(e) => setAmount(e.target.value)} inputProps={{ min: "0.01", step: "0.01" }} /> <GradientButton type="submit" fullWidth disabled={isSubmitting} startIcon={<AccountBalanceIcon />} sx={{ mt: 2 }}> {isSubmitting ? <CircularProgress size={24} sx={{color: '#000'}} /> : 'Withdraw Money'} </GradientButton> </Box> );
}

// --- TransactionHistory ---
function TransactionHistory({ transactions }) {
  return (
    <>
      <Typography component="h2" variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}> Recent Activity </Typography>
      <List sx={{ maxHeight: '400px', overflow: 'auto' }}>
        {transactions.length === 0 ? ( <Typography sx={{ color: 'text.secondary', mt: 2, p: 1 }}>No transactions yet.</Typography> ) : (
          transactions.map((tx, index) => (
            <React.Fragment key={tx.id}>
              <ListItem sx={{ p: '12px 4px', '&:hover': { bgcolor: 'rgba(5, 255, 158, 0.05)'}, borderRadius: '8px' }}>
                <ListItemIcon> {tx.type === 'DEBIT' ? <ArrowUpwardIcon color="error" /> : <ArrowDownwardIcon color="secondary" />} </ListItemIcon>
                <ListItemText primary={<Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>{tx.description}</Typography>} secondary={`${formatTimestamp(tx.timestamp)} | ${tx.accountName}`} />
                <Typography variant="body1" color={tx.type === 'DEBIT' ? 'error.main' : 'secondary.main'} sx={{ fontWeight: 'bold', minWidth: '90px', textAlign: 'right' }} > {tx.type === 'DEBIT' ? '-' : '+'}₹{tx.amount.toFixed(2)} </Typography>
              </ListItem>
              {index < transactions.length - 1 && <Divider component="li" sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />}
            </React.Fragment>
          ))
        )}
      </List>
    </>
  );
}