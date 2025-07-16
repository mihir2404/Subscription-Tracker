import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Container, Typography, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, Snackbar, Alert, Grid, Paper,
  Card, CardContent, CardActions, Switch, useMediaQuery, AppBar, Toolbar, CssBaseline, MenuItem, Select, InputLabel, FormControl, Tooltip, CircularProgress, Fade, Zoom
} from '@mui/material';
import { Add, Edit, Delete, CalendarToday, Brightness4, Brightness7, Movie, MusicNote, Tv, Theaters, Sync, TrendingUp, AccountBalance, Notifications } from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import './App.css';
import { addRippleEffect, formatCurrency, daysUntilRenewal, getRenewalStatusColor, storage } from './utils';
import CurrencyRatesTable from "./CurrencyRatesTable";

const LOCAL_STORAGE_KEY = 'subscriptions';
const LOCAL_CURRENCY_KEY = 'currency';
const LOCAL_RATES_KEY = 'currency_rates';
const LOCAL_RATES_TIME_KEY = 'currency_rates_time';

const BASE_CURRENCY = 'INR';

const currencyOptions = [
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar' },
];

const defaultSubscriptions = [
  {
    name: 'Netflix',
    cost: 499,
    renewalDate: getNextMonth(),
    icon: <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" alt="Netflix" style={{ height: 24 }} />
  },
  {
    name: 'Spotify',
    cost: 119,
    renewalDate: getNextMonth(),
    icon: <img src="https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg" alt="Spotify" style={{ height: 24 }} />
  },
  {
    name: 'Amazon Prime',
    cost: 299,
    renewalDate: getNextMonth(),
    icon: <img src="https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video.png" alt="Amazon Prime" style={{ height: 24 }} />
  },
  {
    name: 'Apple TV',
    cost: 99,
    renewalDate: getNextMonth(),
    icon: <img src="https://upload.wikimedia.org/wikipedia/commons/1/1b/Apple_TV%2B_logo.svg" alt="Apple TV" style={{ height: 24 }} />
  },
  {
    name: 'Hotstar',
    cost: 299,
    renewalDate: getNextMonth(),
    icon: <img src="https://upload.wikimedia.org/wikipedia/commons/1/1e/Disney%2B_Hotstar_logo.svg" alt="Hotstar" style={{ height: 24 }} />
  },
  {
    name: 'Zee5',
    cost: 99,
    renewalDate: getNextMonth(),
    icon: <img src="https://upload.wikimedia.org/wikipedia/commons/7/7c/ZEE5_official_logo.png" alt="Zee5" style={{ height: 24 }} />
  },
  {
    name: 'SonyLIV',
    cost: 299,
    renewalDate: getNextMonth(),
    icon: <img src="https://upload.wikimedia.org/wikipedia/commons/2/2e/SonyLIV_Logo.svg" alt="SonyLIV" style={{ height: 24 }} />
  },
  {
    name: 'JioCinema',
    cost: 999,
    renewalDate: getNextMonth(),
    icon: <img src="https://upload.wikimedia.org/wikipedia/commons/2/2e/JioCinema_logo.svg" alt="JioCinema" style={{ height: 24 }} />
  },
  {
    name: 'ALTBalaji',
    cost: 100,
    renewalDate: getNextMonth(),
    icon: <img src="https://upload.wikimedia.org/wikipedia/commons/6/6a/ALTBalaji_logo.png" alt="ALTBalaji" style={{ height: 24 }} />
  },
  {
    name: 'SunNXT',
    cost: 50,
    renewalDate: getNextMonth(),
    icon: <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Sun_NXT_Logo.png" alt="SunNXT" style={{ height: 24 }} />
  },
  // Additional popular subscriptions
  {
    name: 'YouTube Premium',
    cost: 139,
    renewalDate: getNextMonth(),
    icon: <img src="https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg" alt="YouTube Premium" style={{ height: 24 }} />
  },
  {
    name: 'Hulu',
    cost: 199,
    renewalDate: getNextMonth(),
    icon: <img src="https://upload.wikimedia.org/wikipedia/commons/e/e4/Hulu_Logo.svg" alt="Hulu" style={{ height: 24 }} />
  },
  {
    name: 'HBO Max',
    cost: 299,
    renewalDate: getNextMonth(),
    icon: <img src="https://upload.wikimedia.org/wikipedia/commons/1/17/HBO_Max_Logo.svg" alt="HBO Max" style={{ height: 24 }} />
  },
  {
    name: 'Google One',
    cost: 130,
    renewalDate: getNextMonth(),
    icon: <img src="https://upload.wikimedia.org/wikipedia/commons/2/2b/Google_One_icon.svg" alt="Google One" style={{ height: 24 }} />
  },
  {
    name: 'Dropbox',
    cost: 150,
    renewalDate: getNextMonth(),
    icon: <img src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Dropbox_Icon.svg" alt="Dropbox" style={{ height: 24 }} />
  },
  {
    name: 'Audible',
    cost: 199,
    renewalDate: getNextMonth(),
    icon: <img src="https://upload.wikimedia.org/wikipedia/commons/8/8e/Audible_logo.svg" alt="Audible" style={{ height: 24 }} />
  },
  {
    name: 'LinkedIn Premium',
    cost: 800,
    renewalDate: getNextMonth(),
    icon: <img src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png" alt="LinkedIn Premium" style={{ height: 24 }} />
  },
  {
    name: 'Disney+',
    cost: 299,
    renewalDate: getNextMonth(),
    icon: <img src="https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg" alt="Disney+" style={{ height: 24 }} />
  },
  {
    name: 'Canva Pro',
    cost: 499,
    renewalDate: getNextMonth(),
    icon: <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Canva_icon_2021.svg" alt="Canva Pro" style={{ height: 24 }} />
  },
  {
    name: 'Microsoft 365',
    cost: 529,
    renewalDate: getNextMonth(),
    icon: <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft 365" style={{ height: 24 }} />
  },
];

function getNextMonth() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}

function getInitialSubscriptions() {
  const data = storage.get(LOCAL_STORAGE_KEY);
  if (data) return data;
  return defaultSubscriptions;
}

function getInitialCurrency() {
  return storage.get(LOCAL_CURRENCY_KEY, BASE_CURRENCY);
}

function getNextRenewals(subscriptions) {
  const today = new Date();
  return subscriptions
    .filter(sub => new Date(sub.renewalDate) >= today)
    .sort((a, b) => new Date(a.renewalDate) - new Date(b.renewalDate))
    .slice(0, 3);
}

function getCurrencySymbol(code) {
  const found = currencyOptions.find(c => c.code === code);
  return found ? found.symbol : '₹';
}

function useExchangeRates(base, currencies) {
  const [rates, setRates] = useState(() => {
    const cached = localStorage.getItem(LOCAL_RATES_KEY);
    return cached ? JSON.parse(cached) : { [base]: 1 };
  });
  const [lastUpdate, setLastUpdate] = useState(() => {
    const cachedTime = localStorage.getItem(LOCAL_RATES_TIME_KEY);
    return cachedTime ? new Date(cachedTime) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRates = async () => {
    setLoading(true);
    setError(null);
    try {
      const symbols = currencies.filter(c => c !== base).join(',');
      const url = `https://api.exchangerate.host/latest?base=${base}&symbols=${symbols}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data && data.rates) {
        const allRates = { ...data.rates, [base]: 1 };
        setRates(allRates);
        setLastUpdate(new Date());
        localStorage.setItem(LOCAL_RATES_KEY, JSON.stringify(allRates));
        localStorage.setItem(LOCAL_RATES_TIME_KEY, new Date().toISOString());
      } else {
        setError('Failed to fetch rates');
      }
    } catch (e) {
      setError('Failed to fetch rates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch if no cache or cache is older than 12 hours
    if (!lastUpdate || (Date.now() - lastUpdate.getTime()) > 12 * 60 * 60 * 1000) {
      fetchRates();
    }
    // eslint-disable-next-line
  }, [base]);

  return { rates, lastUpdate, loading, error, fetchRates };
}

function App() {
  // Theme state
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [darkMode, setDarkMode] = useState(prefersDarkMode);
  const [isLoading, setIsLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const theme = useMemo(() => createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: '#1976d2' },
      secondary: { main: '#ff9800' },
      background: {
        default: darkMode ? '#181a1b' : '#f4f6fa',
        paper: darkMode ? '#23272f' : '#fff',
      },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            transition: 'all 0.3s ease',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            transition: 'all 0.3s ease',
          },
        },
      },
    },
  }), [darkMode]);

  // App state
  const [subscriptions, setSubscriptions] = useState(getInitialSubscriptions);
  const [currency, setCurrency] = useState(getInitialCurrency);
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState({ name: '', cost: '', renewalDate: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Currency conversion
  const { rates, lastUpdate, loading: ratesLoading, error: ratesError, fetchRates } = useExchangeRates(
    BASE_CURRENCY,
    currencyOptions.map(c => c.code)
  );

  useEffect(() => {
    storage.set(LOCAL_STORAGE_KEY, subscriptions);
  }, [subscriptions]);

  useEffect(() => {
    storage.set(LOCAL_CURRENCY_KEY, currency);
  }, [currency]);

  const handleOpen = (index = null) => {
    setEditIndex(index);
    if (index !== null) {
      setForm({ ...subscriptions[index], icon: undefined });
    } else {
      setForm({ name: '', cost: '', renewalDate: '' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditIndex(null);
    setForm({ name: '', cost: '', renewalDate: '' });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (!form.name || !form.cost || !form.renewalDate) {
      setSnackbar({ open: true, message: 'All fields are required.', severity: 'error' });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate loading for better UX
    setTimeout(() => {
      const newSub = { ...form, cost: parseFloat(form.cost) };
      if (editIndex !== null) {
        const updated = [...subscriptions];
        updated[editIndex] = newSub;
        setSubscriptions(updated);
        setSnackbar({ open: true, message: 'Subscription updated!', severity: 'success' });
      } else {
        setSubscriptions([...subscriptions, newSub]);
        setSnackbar({ open: true, message: 'Subscription added!', severity: 'success' });
      }
      setIsLoading(false);
      handleClose();
    }, 500);
  };

  const handleDelete = (index) => {
    setIsLoading(true);
    
    // Simulate loading for better UX
    setTimeout(() => {
      const updated = subscriptions.filter((_, i) => i !== index);
      setSubscriptions(updated);
      setSnackbar({ open: true, message: 'Subscription deleted.', severity: 'info' });
      setIsLoading(false);
    }, 300);
  };

  const handleCurrencyChange = (e) => {
    setCurrency(e.target.value);
  };

  // Convert a value from INR to selected currency
  const convert = (value) => {
    if (currency === BASE_CURRENCY) return value;
    if (!rates[currency]) return value;
    return value * rates[currency];
  };

  const totalCost = subscriptions.reduce((sum, sub) => sum + (parseFloat(sub.cost) || 0), 0);
  const nextRenewals = getNextRenewals(subscriptions);
  const currencySymbol = getCurrencySymbol(currency);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="sticky" color="primary" elevation={2}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }} className="enhanced-typography">
            <AccountBalance sx={{ mr: 1, verticalAlign: 'middle' }} />
            Subscription Tracker
          </Typography>
          <FormControl size="small" sx={{ minWidth: 110, mr: 2 }} className="currency-selector">
            <InputLabel id="currency-label">Currency</InputLabel>
            <Select
              labelId="currency-label"
              value={currency}
              label="Currency"
              onChange={handleCurrencyChange}
            >
              {currencyOptions.map(opt => (
                <MenuItem key={opt.code} value={opt.code}>{opt.symbol} {opt.code}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Tooltip title="Refresh rates">
            <IconButton 
              color="inherit" 
              onClick={fetchRates} 
              disabled={ratesLoading} 
              size="small"
              className={ratesLoading ? 'loading-spinner' : ''}
            >
              <Sync />
            </IconButton>
          </Tooltip>
          <Tooltip title="Notifications">
            <IconButton 
              color="inherit" 
              onClick={() => setShowNotifications(!showNotifications)}
              size="small"
              className={showNotifications ? 'pulse' : ''}
            >
              <Notifications />
            </IconButton>
          </Tooltip>
          <Box sx={{ display: 'flex', alignItems: 'center' }} className="theme-toggle">
            <Brightness7 sx={{ color: darkMode ? 'grey.500' : 'orange', mr: 1 }} />
            <Switch
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              color="default"
              inputProps={{ 'aria-label': 'toggle dark mode' }}
            />
            <Brightness4 sx={{ color: darkMode ? 'orange' : 'grey.700' }} />
          </Box>
        </Toolbar>
      </AppBar>
      <Container maxWidth="sm" sx={{ py: 4 }} className="page-transition">
        <Fade in={true} timeout={800}>
          <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 3, textAlign: 'center', background: theme.palette.mode === 'dark' ? 'rgba(30,32,36,0.9)' : 'linear-gradient(90deg, #e3f2fd 0%, #fff 100%)' }}>
            <Typography variant="h4" gutterBottom fontWeight={700} color="primary.main" className="enhanced-typography">
              <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
              Subscription Tracker
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Track your active subscriptions, monthly costs, and upcoming renewals.
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {ratesLoading ? 'Updating rates...' : ratesError ? 'Failed to update rates.' : lastUpdate ? `Rates updated: ${lastUpdate.toLocaleString()}` : ''}
              </Typography>
            </Box>
          </Paper>
        </Fade>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <Zoom in={true} timeout={600}>
              <Paper elevation={2} sx={{ p: 2, textAlign: 'center', background: theme.palette.secondary.light }} className="stats-card">
                <Typography variant="subtitle2" color="text.secondary">Total Monthly Cost</Typography>
                <Typography variant="h5" color="secondary.main" fontWeight={700} className="enhanced-typography">
                  {currencySymbol}{convert(totalCost).toFixed(2)}
                </Typography>
              </Paper>
            </Zoom>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Zoom in={true} timeout={800}>
              <Paper elevation={2} sx={{ p: 2, textAlign: 'center', background: theme.palette.primary.light }} className="stats-card">
                <Typography variant="subtitle2" color="text.secondary">Upcoming Renewals</Typography>
                {nextRenewals.length === 0 ? (
                  <Typography color="text.secondary" fontSize={14}>No upcoming renewals.</Typography>
                ) : (
                  nextRenewals.map((sub, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: idx > 0 ? 1 : 0 }}>
                      <CalendarToday sx={{ mr: 1, fontSize: 18 }} color="action" className="icon-bounce" />
                      <Typography fontSize={15}>
                        {sub.name} <span style={{ color: theme.palette.primary.dark }}>
                          ({new Date(sub.renewalDate).toLocaleDateString()})
                        </span>
                      </Typography>
                    </Box>
                  ))
                )}
              </Paper>
            </Zoom>
          </Grid>
        </Grid>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" className="enhanced-typography">Your Subscriptions</Typography>
          <Button 
            variant="contained" 
            startIcon={<Add />} 
            onClick={(e) => {
              addRippleEffect(e);
              handleOpen();
            }}
            size="small"
            className="animated-button"
          >
            Add
          </Button>
        </Box>
        <div className="responsive-grid">
          {subscriptions.length === 0 && (
            <Paper sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }} className="fade-in">
              No subscriptions yet.
            </Paper>
          )}
          {subscriptions.map((sub, idx) => (
            <Zoom in={true} timeout={200 + idx * 100} key={idx}>
              <Card 
                elevation={4} 
                sx={{ mb: 2, background: theme.palette.mode === 'dark' ? 'rgba(40,44,52,0.95)' : '#fff' }}
                className="subscription-card slide-in"
              >
                <CardContent className="card-content-enhanced">
                  {sub.icon && (
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#23272f',
                        borderRadius: 12,
                        marginRight: 16,
                        overflow: 'hidden',
                      }}
                    >
                      <img
                        src={sub.icon.props.src}
                        alt={sub.name}
                        style={{
                          maxWidth: 28,
                          maxHeight: 28,
                          display: 'block',
                          objectFit: 'contain',
                        }}
                        onError={e => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/28?text=?';
                        }}
                      />
                    </div>
                  )}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" color="primary.main" fontWeight={600} gutterBottom className="enhanced-typography">
                      {sub.name}
                    </Typography>
                    <Typography color="text.secondary" fontSize={15}>
                      {currencySymbol}{convert(sub.cost).toFixed(2)}/mo
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography color="text.secondary" fontSize={14}>
                        Renews: {new Date(sub.renewalDate).toLocaleDateString()}
                      </Typography>
                      {(() => {
                        const daysUntil = daysUntilRenewal(sub.renewalDate);
                        const statusColor = getRenewalStatusColor(daysUntil);
                        return (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: statusColor,
                              animation: daysUntil <= 3 ? 'pulse 2s infinite' : 'none'
                            }}
                          />
                        );
                      })()}
                    </Box>
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <IconButton 
                    aria-label="edit" 
                    onClick={(e) => {
                      addRippleEffect(e);
                      handleOpen(idx);
                    }}
                    size="small"
                    className="animated-button"
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton 
                    aria-label="delete" 
                    onClick={(e) => {
                      addRippleEffect(e);
                      handleDelete(idx);
                    }}
                    size="small"
                    className="animated-button"
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </CardActions>
              </Card>
            </Zoom>
          ))}
        </div>
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs" className="dialog-enter">
          <DialogTitle>{editIndex !== null ? 'Edit Subscription' : 'Add Subscription'}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
              className="form-field"
            />
            <TextField
              margin="dense"
              label={`Monthly Cost (₹)`}
              name="cost"
              type="number"
              value={form.cost}
              onChange={handleChange}
              fullWidth
              required
              inputProps={{ min: 0, step: 0.01 }}
              variant="outlined"
              helperText={`Enter amount in ${BASE_CURRENCY}`}
              className="form-field"
            />
            <TextField
              margin="dense"
              label="Renewal Date"
              name="renewalDate"
              type="date"
              value={form.renewalDate}
              onChange={handleChange}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              className="form-field"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} className="animated-button">Cancel</Button>
            <Button 
              onClick={handleSave} 
              variant="contained" 
              className="animated-button"
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={20} /> : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          className="message-enter"
        >
          <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="loading-overlay">
            <CircularProgress />
          </div>
        )}
        <CurrencyRatesTable base={currency} />
      </Container>
    </ThemeProvider>
  );
}

export default App;
