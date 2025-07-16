import React, { useEffect, useState } from "react";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, CircularProgress, Box, Button, Tooltip } from "@mui/material";
import SyncIcon from '@mui/icons-material/Sync';

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "INR"];

export default function CurrencyRatesTable({ base = "INR" }) {
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchRates = () => {
    setLoading(true);
    fetch(
      `https://api.exchangerate.host/latest?base=${base}&symbols=${CURRENCIES.filter(c => c !== base).join(",")}`
    )
      .then((res) => res.json())
      .then((data) => {
        setRates(data.rates || {});
        setLastUpdate(new Date());
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRates();
    // eslint-disable-next-line
  }, [base]);

  return (
    <Box sx={{ my: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6" gutterBottom sx={{ flexGrow: 1 }}>
          Live Currency Rates (Base: {base})
        </Typography>
        <Tooltip title="Refresh rates">
          <span>
            <Button onClick={fetchRates} disabled={loading} size="small" variant="outlined" sx={{ minWidth: 36, p: 0 }}>
              <SyncIcon className={loading ? 'loading-spinner' : ''} />
            </Button>
          </span>
        </Tooltip>
      </Box>
      {lastUpdate && (
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          Last updated: {lastUpdate.toLocaleTimeString()}
        </Typography>
      )}
      {loading ? (
        <CircularProgress size={28} />
      ) : (
        <TableContainer component={Paper} sx={{ maxWidth: 400 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Currency</TableCell>
                <TableCell align="right">Rate</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(rates).map(([currency, rate]) => (
                <TableRow key={currency}>
                  <TableCell>{currency}</TableCell>
                  <TableCell align="right">{rate.toFixed(4)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
} 