import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const steps = ['Schedule Details', 'Delivery Address', 'Payment Mode', 'Confirmation'];

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Selected Service and Provider passed from State
  const { service, provider, isSubscription } = location.state || {};

  // Stepper state
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [successBookingId, setSuccessBookingId] = useState('');

  // Form states - Step 1 Schedule
  const [bookingDate, setBookingDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [slot, setSlot] = useState(provider?.availability?.[0] || '09:00 AM - 12:00 PM');
  const [frequency, setFrequency] = useState('Daily'); // For subscriptions

  // Form states - Step 2 Address
  const [street, setStreet] = useState(user?.address?.street || '');
  const [area, setArea] = useState(user?.address?.area || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [pincode, setPincode] = useState(user?.address?.pincode || '');

  // Form states - Step 3 Payment
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [cardNo, setCardNo] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiId, setUpiId] = useState('');

  if (!service || !provider) {
    return (
      <Container maxWidth="md" sx={{ py: 10, textAlign: 'center' }}>
        <Paper p={4} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h5" color="error" gutterBottom>
            Invalid checkout session.
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            No service was selected. Please browse the service list to select a provider.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/services')}>
            Browse Services
          </Button>
        </Paper>
      </Container>
    );
  }

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const address = { street, area, city, pincode };

      if (isSubscription) {
        // Create Subscription
        const subRes = await api.post('/subscription', {
          serviceId: service._id,
          providerId: provider.userId._id,
          frequency,
          startDate: bookingDate
        });
        
        // Setup mock first payment if method was prepaid
        if (paymentMethod !== 'Cash on Delivery') {
          // create a mock booking representing first subscription delivery
          const bookingRes = await api.post('/booking', {
            providerId: provider.userId._id,
            serviceId: service._id,
            bookingDate,
            slot,
            paymentMethod,
            address
          });
          
          await api.post('/payment', {
            bookingId: bookingRes.data._id,
            amount: service.price,
            method: paymentMethod
          });
        }

        setSuccessBookingId('SUB');
        handleNext();
      } else {
        // Create Booking
        const bookingRes = await api.post('/booking', {
          providerId: provider.userId._id,
          serviceId: service._id,
          bookingDate,
          slot,
          paymentMethod,
          address
        });

        const bookingId = bookingRes.data._id;

        // Process Mock Payment if UPI/Card
        if (paymentMethod !== 'Cash on Delivery') {
          await api.post('/payment', {
            bookingId,
            amount: service.price,
            method: paymentMethod
          });
        }

        setSuccessBookingId(bookingId);
        handleNext();
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Order placement failed. Please verify fields and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step Renders
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {isSubscription ? 'Setup Subscription Frequency' : 'Select Schedule Date & Slot'}
              </Typography>
            </Grid>
            {isSubscription ? (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="freq-select">Subscription Pattern</InputLabel>
                  <Select
                    labelId="freq-select"
                    value={frequency}
                    label="Subscription Pattern"
                    onChange={(e) => setFrequency(e.target.value)}
                  >
                    <MenuItem value="Daily">Daily Delivery</MenuItem>
                    <MenuItem value="Weekly">Weekly Delivery</MenuItem>
                    <MenuItem value="Monthly">Monthly Delivery</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            ) : null}
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="date"
                label={isSubscription ? 'Start Date' : 'Booking Date'}
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            {!isSubscription && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="slot-select">Available Time Slot</InputLabel>
                  <Select
                    labelId="slot-select"
                    value={slot}
                    label="Available Time Slot"
                    onChange={(e) => setSlot(e.target.value)}
                  >
                    {provider.availability?.map((s) => (
                      <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Deliver to Address
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Street Name / Landmark"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
              />
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Choose Payment Mode
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <RadioGroup
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <FormControlLabel 
                  value="Cash on Delivery" 
                  control={<Radio />} 
                  label="Cash on Delivery (Pay at Doorstep)" 
                />
                <FormControlLabel 
                  value="UPI" 
                  control={<Radio />} 
                  label="UPI Payments (Instantly pay using mock ID)" 
                />
                <FormControlLabel 
                  value="Card" 
                  control={<Radio />} 
                  label="Credit / Debit Card" 
                />
              </RadioGroup>
            </Grid>

            {/* Sub-forms for prepaid options */}
            <Grid item xs={12} md={6}>
              {paymentMethod === 'Card' && (
                <Card variant="outlined">
                  <CardContent display="flex" flexDirection="column" gap={2}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Card Details (Simulation)</Typography>
                    <TextField
                      fullWidth
                      label="Card Number"
                      size="small"
                      placeholder="XXXX-XXXX-XXXX-XXXX"
                      value={cardNo}
                      onChange={(e) => setCardNo(e.target.value)}
                      sx={{ mb: 1.5 }}
                    />
                    <Box display="flex" gap={2}>
                      <TextField
                        label="Expiry"
                        size="small"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                      />
                      <TextField
                        label="CVV"
                        size="small"
                        type="password"
                        placeholder="123"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                      />
                    </Box>
                  </CardContent>
                </Card>
              )}
              {paymentMethod === 'UPI' && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>UPI Transaction (Simulation)</Typography>
                    <TextField
                      fullWidth
                      label="UPI Virtual Private Address"
                      size="small"
                      placeholder="username@okaxis"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                    />
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        );
      case 3:
        return (
          <Box p={2}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Confirm Booking Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Business Name</Typography>
                <Typography variant="body1" fontWeight="bold">{provider.businessName}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Service Selected</Typography>
                <Typography variant="body1" fontWeight="bold">{service.serviceName}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Billing Amount</Typography>
                <Typography variant="body1" fontWeight="bold" color="primary.main">₹{service.price}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">{isSubscription ? 'Frequency' : 'Time Slot'}</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {isSubscription ? `${frequency} subscription` : slot}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Delivery Address</Typography>
                <Typography variant="body2">
                  {street}, {area}, {city} - {pincode}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Payment Mode</Typography>
                <Typography variant="body2">{paymentMethod}</Typography>
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" align="center" fontWeight="bold" mb={1}>
          {isSubscription ? 'Setup Subscription' : 'Book Appointment'}
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Complete the checkout steps for: {service.serviceName}
        </Typography>

        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === steps.length ? (
          /* Thank you panel */
          <Box textAlign="center" py={4}>
            <CheckCircleOutlineIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Booking Confirmed!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 4 }}>
              Your order has been placed successfully. {isSubscription ? 'Your active subscription schedule is set.' : 'The service provider has been notified to assign staff.'}
            </Typography>

            <Box display="flex" justifyContent="center" gap={2}>
              {successBookingId !== 'SUB' ? (
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => navigate(`/orders/${successBookingId}`)}
                >
                  Track Order
                </Button>
              ) : (
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => navigate('/customer-dashboard')}
                >
                  My Subscriptions
                </Button>
              )}
              <Button 
                variant="outlined" 
                onClick={() => navigate('/services')}
              >
                Browse Services
              </Button>
            </Box>
          </Box>
        ) : (
          /* Step Forms with Nav triggers */
          <Box>
            {renderStepContent(activeStep)}
            
            <Box display="flex" justifyContent="space-between" mt={4}>
              <Button
                disabled={activeStep === 0 || loading}
                onClick={handleBack}
              >
                Back
              </Button>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handlePlaceOrder}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Place Order'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Booking;
