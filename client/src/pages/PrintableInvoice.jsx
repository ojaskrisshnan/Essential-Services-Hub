import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

// Icons
import PrintIcon from '@mui/icons-material/Print';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';

import api from '../services/api';

const PrintableInvoice = () => {
  const { id } = useParams(); // Booking ID
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await api.get(`/invoice/${id}`);
        setInvoice(res.data);
      } catch (err) {
        console.error(err);
        setError('Invoice could not be fetched.');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  // Auto-trigger printing once loaded
  useEffect(() => {
    if (invoice) {
      const timer = setTimeout(() => {
        window.print();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [invoice]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !invoice) {
    return (
      <Box p={4}>
        <Alert severity="error">{error || 'Invoice not found.'}</Alert>
        <Button startIcon={<KeyboardBackspaceIcon />} sx={{ mt: 2 }} onClick={() => navigate(-1)}>
          Back
        </Button>
      </Box>
    );
  }

  const { booking, payment } = invoice;

  return (
    <Box 
      sx={{ 
        maxWidth: 800, 
        mx: 'auto', 
        p: 4, 
        backgroundColor: '#ffffff', 
        color: '#000000',
        minHeight: '100vh',
        boxShadow: { xs: 'none', md: '0px 0px 10px rgba(0,0,0,0.1)' }
      }}
    >
      {/* Action panel (Hidden during print) */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, '@media print': { display: 'none' } }}>
        <Button 
          startIcon={<KeyboardBackspaceIcon />} 
          variant="outlined" 
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
        <Button 
          startIcon={<PrintIcon />} 
          variant="contained" 
          onClick={() => window.print()}
        >
          Print Invoice
        </Button>
      </Box>

      {/* Invoice Layout */}
      <Box sx={{ border: '2px solid #000', p: 3, borderRadius: 2 }}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6}>
            <Typography variant="h4" fontWeight="bold">INVOICE</Typography>
            <Typography variant="subtitle2">Essential Services Hub</Typography>
          </Grid>
          <Grid item xs={6} textAlign="right">
            <Typography variant="body2"><strong>Invoice No:</strong> {booking._id}</Typography>
            <Typography variant="body2"><strong>Date:</strong> {new Date(booking.createdAt).toLocaleDateString()}</Typography>
            <Typography variant="body2"><strong>Payment Method:</strong> {payment.method}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ borderBottomWidth: 2, mb: 4, borderColor: '#000' }} />

        {/* Client & Vendor Details */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="text.secondary"><strong>BILLED TO:</strong></Typography>
            <Typography variant="body1"><strong>{booking.customerId?.name}</strong></Typography>
            <Typography variant="body2">{booking.customerId?.email}</Typography>
            <Typography variant="body2">{booking.customerId?.phone}</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {booking.address?.street}, {booking.address?.area}, {booking.address?.city} - {booking.address?.pincode}
            </Typography>
          </Grid>
          <Grid item xs={6} textAlign="right">
            <Typography variant="subtitle2" color="text.secondary"><strong>SERVICE PROVIDER:</strong></Typography>
            <Typography variant="body1"><strong>{booking.providerId?.name}</strong></Typography>
            <Typography variant="body2">Category: {booking.serviceId?.category}</Typography>
            <Typography variant="body2">Slot: {booking.slot}</Typography>
          </Grid>
        </Grid>

        {/* Invoice Item Table */}
        <TableContainer sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ borderBottom: '2px solid #000' }}>
                <TableCell><strong>Service Description</strong></TableCell>
                <TableCell align="right"><strong>Duration (Mins)</strong></TableCell>
                <TableCell align="right"><strong>Unit Price</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{booking.serviceId?.serviceName}</TableCell>
                <TableCell align="right">{booking.serviceId?.duration}</TableCell>
                <TableCell align="right">₹{booking.serviceId?.price}</TableCell>
              </TableRow>
              <TableRow sx={{ borderTop: '2px solid #000' }}>
                <TableCell colSpan={2} align="right"><strong>Total Amount:</strong></TableCell>
                <TableCell align="right"><strong>₹{booking.serviceId?.price}</strong></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Divider sx={{ borderBottomWidth: 1, mb: 4, borderColor: '#000' }} />

        {/* Payment Confirmation */}
        <Box 
          sx={{ 
            p: 2, 
            backgroundColor: '#f8f9fa', 
            borderRadius: 1, 
            border: '1px solid #ced4da',
            textAlign: 'center'
          }}
        >
          <Typography variant="body2">
            Payment Status: <strong>{payment.status}</strong> 
            {payment.status === 'Paid' && ` (Transaction ID: ${payment.transactionId})`}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
          Thank you for choosing Essential Services Hub!
        </Typography>
      </Box>
    </Box>
  );
};

export default PrintableInvoice;
