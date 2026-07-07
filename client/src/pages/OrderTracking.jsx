import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

// Icons
import RoomServiceIcon from '@mui/icons-material/RoomService';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import PaymentsIcon from '@mui/icons-material/Payments';

import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const trackingStatuses = [
  { key: 'Requested', label: 'Booking Requested' },
  { key: 'Accepted', label: 'Accepted by Provider' },
  { key: 'Assigned', label: 'Staff Assigned' },
  { key: 'Out for Delivery', label: 'Out for Delivery / En Route' },
  { key: 'In Progress', label: 'Service In Progress' },
  { key: 'Completed', label: 'Completed' }
];

const OrderTracking = () => {
  const { id } = useParams(); // Booking ID
  const navigate = useNavigate();
  const { user } = useAuth();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Complaint dialog
  const [complaintOpen, setComplaintOpen] = useState(false);
  const [complaintReason, setComplaintReason] = useState('Late Delivery');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [complaintStatus, setComplaintStatus] = useState(''); // e.g. success message

  const fetchBookingDetails = async () => {
    try {
      const res = await api.get('/booking');
      const found = res.data.find(b => b._id === id);
      if (!found) {
        setError('Booking details could not be loaded.');
      } else {
        setBooking(found);
      }
    } catch (err) {
      console.error(err);
      setError('Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingDetails();
    
    // Auto refresh every 10 seconds for real-time stepper feedback
    const interval = setInterval(fetchBookingDetails, 10000);
    return () => clearInterval(interval);
  }, [id]);

  const handlePayNow = async () => {
    try {
      setLoading(true);
      await api.post('/payment', {
        bookingId: booking._id,
        amount: booking.serviceId.price,
        method: 'UPI' // Mock UPI checkout directly
      });
      await fetchBookingDetails();
    } catch (err) {
      console.error(err);
      alert('Mock payment processing failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRaiseComplaint = async () => {
    try {
      await api.post('/complaint', {
        bookingId: booking._id,
        reason: complaintReason,
        description: complaintDesc
      });
      setComplaintStatus('Complaint filed successfully. Our support desk will resolve it.');
      setComplaintDesc('');
      setTimeout(() => {
        setComplaintOpen(false);
        setComplaintStatus('');
      }, 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to submit complaint.');
    }
  };

  const handlePrintInvoice = () => {
    // Open clean window with print layout
    const printWindow = window.open(`/api/invoice/${booking._id}`, '_blank');
    if (printWindow) {
      // Just fetching invoice details and rendering inside separate page
      printWindow.onload = function() {
        printWindow.print();
      };
    }
    // Alternatively, let's navigate to invoice route on client which is cleaner
    navigate(`/invoice/${booking._id}`);
  };

  const getStepIndex = (status) => {
    if (status === 'Cancelled') return -1;
    return trackingStatuses.findIndex(s => s.key === status);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={50} />
      </Box>
    );
  }

  if (error || !booking) {
    return (
      <Container maxWidth="md" sx={{ py: 10 }}>
        <Alert severity="error">{error || 'Booking not found.'}</Alert>
        <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate('/customer-dashboard')}>Back to Dashboard</Button>
      </Container>
    );
  }

  const currentStep = getStepIndex(booking.status);

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap">
          <Typography variant="h5" fontWeight="bold">
            Order Tracker
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Order ID: {booking._id}
          </Typography>
        </Box>
        <Divider sx={{ mb: 4 }} />

        {/* Live Stepper Tracker */}
        {booking.status === 'Cancelled' ? (
          <Alert severity="error" sx={{ mb: 4 }}>
            This booking has been Cancelled.
          </Alert>
        ) : (
          <Box sx={{ width: '100%', mb: 6, overflowX: 'auto' }}>
            <Stepper activeStep={currentStep} alternativeLabel>
              {trackingStatuses.map((step) => (
                <Step key={step.key}>
                  <StepLabel>{step.label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
        )}

        {/* Booking Details Grid */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {/* Left panel: Service & Provider details */}
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Service Booking Details
            </Typography>
            <Box display="flex" flexDirection="column" gap={1.5} mt={2}>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">Service Booked</Typography>
                <Typography variant="body1" fontWeight="bold">{booking.serviceId?.serviceName}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">Provider Agency</Typography>
                <Typography variant="body1" fontWeight="bold">{booking.customerId?.role === 'customer' ? booking.providerId?.name : booking.customerId?.name}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">Schedule slot</Typography>
                <Typography variant="body2">
                  {new Date(booking.bookingDate).toLocaleDateString()} at {booking.slot}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">Deliver to Address</Typography>
                <Typography variant="body2">
                  {booking.address?.street}, {booking.address?.area}, {booking.address?.city} - {booking.address?.pincode}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Right panel: Pricing, payment, billing details */}
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Billing & Invoice
            </Typography>
            <Box display="flex" flexDirection="column" gap={1.5} mt={2}>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">Billing Amount</Typography>
                <Typography variant="h5" fontWeight="bold" color="primary.main">₹{booking.serviceId?.price}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">Payment Status</Typography>
                <Chip 
                  label={booking.paymentStatus} 
                  color={booking.paymentStatus === 'Paid' ? 'success' : 'warning'}
                  size="small"
                />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">Payment Mode</Typography>
                <Typography variant="body2">{booking.paymentMethod}</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Stepper actions */}
        <Box display="flex" justifyContent="space-between" flexWrap="wrap" gap={2}>
          {/* Complaint Action */}
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={<ReportProblemIcon />}
            onClick={() => setComplaintOpen(true)}
          >
            Raise Dispute / Complaint
          </Button>

          <Box display="flex" gap={2}>
            {/* Pay now option */}
            {booking.paymentStatus === 'Pending' && booking.paymentMethod === 'Cash on Delivery' && (
              <Button 
                variant="contained" 
                color="secondary" 
                startIcon={<PaymentsIcon />}
                onClick={handlePayNow}
              >
                Pay Online
              </Button>
            )}

            {/* Print Invoice option */}
            {booking.status === 'Completed' && (
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<ReceiptIcon />}
                onClick={handlePrintInvoice}
              >
                Print Invoice
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Complaint Dialog Form */}
      <Dialog open={complaintOpen} onClose={() => setComplaintOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Raise Service Complaint</DialogTitle>
        <DialogContent>
          {complaintStatus && <Alert severity="success" sx={{ mb: 2 }}>{complaintStatus}</Alert>}
          <Typography variant="body2" color="text.secondary" paragraph>
            Lodge a complaint regarding Booking ID: {booking._id}. Admin will investigate.
          </Typography>
          <FormControl fullWidth sx={{ mb: 3, mt: 1 }}>
            <InputLabel id="complaint-reason-label">Reason</InputLabel>
            <Select
              labelId="complaint-reason-label"
              value={complaintReason}
              label="Reason"
              onChange={(e) => setComplaintReason(e.target.value)}
            >
              <MenuItem value="Late Delivery">Late Delivery</MenuItem>
              <MenuItem value="Wrong Item">Wrong Item / Incorrect quantity</MenuItem>
              <MenuItem value="Poor Service">Poor Service Quality</MenuItem>
              <MenuItem value="Overcharging">Overcharging / Billing issue</MenuItem>
              <MenuItem value="Other">Other / Miscellaneous</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            required
            label="Details / Description"
            multiline
            rows={4}
            value={complaintDesc}
            onChange={(e) => setComplaintDesc(e.target.value)}
            placeholder="Describe what went wrong in detail..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setComplaintOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleRaiseComplaint}
            disabled={!complaintDesc || !!complaintStatus}
          >
            Lodge Complaint
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrderTracking;
