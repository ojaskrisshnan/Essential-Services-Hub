import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

// Icons
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HistoryIcon from '@mui/icons-material/History';
import PaymentsIcon from '@mui/icons-material/Payments';
import LoopIcon from '@mui/icons-material/Loop';

import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const bookRes = await api.get('/booking');
      setBookings(bookRes.data);

      const subRes = await api.get('/subscription');
      setSubscriptions(subRes.data);
    } catch (error) {
      console.error('Failed to fetch customer dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleSub = async (subId, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Paused' : 'Active';
    try {
      setLoading(true);
      await api.put(`/subscription/${subId}`, { status: nextStatus });
      await fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to change subscription status.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={50} />
      </Box>
    );
  }

  // Segmenting bookings
  const activeBookings = bookings.filter(b => !['Completed', 'Cancelled'].includes(b.status));
  const pendingPayments = bookings.filter(b => b.paymentStatus === 'Pending' && b.status !== 'Cancelled');
  const pastBookings = bookings.filter(b => ['Completed', 'Cancelled'].includes(b.status));

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold">
          Welcome back, {user?.name}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your active services, schedules, and tracking updates.
        </Typography>
      </Box>

      {/* Grid of Key Info Panels */}
      <Grid container spacing={4}>
        {/* Left Column: Active Bookings and Recurring Subscriptions */}
        <Grid item xs={12} md={8}>
          {/* Active Orders */}
          <Paper sx={{ p: 3, borderRadius: 3, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <CalendarMonthIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">Active Services / Deliveries</Typography>
              </Box>
              <Chip label={activeBookings.length} color="primary" size="small" />
            </Box>
            <Divider sx={{ mb: 2 }} />

            {activeBookings.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography variant="body1" color="text.secondary" paragraph>
                  You do not have any active appointments or pending deliveries.
                </Typography>
                <Button variant="contained" component={RouterLink} to="/services">
                  Book a Service
                </Button>
              </Box>
            ) : (
              <Box display="flex" flexDirection="column" gap={2}>
                {activeBookings.map((b) => (
                  <Card key={b._id} variant="outlined" sx={{ '&:hover': { transform: 'none', boxShadow: 'none' } }}>
                    <CardContent sx={{ p: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {b.serviceId?.serviceName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Provider: {b.providerId?.name} | Slot: {b.slot}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Date: {new Date(b.bookingDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Chip label={b.status} color="info" size="small" />
                          <Button 
                            variant="contained" 
                            size="small"
                            onClick={() => navigate(`/orders/${b._id}`)}
                          >
                            Track
                          </Button>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>

          {/* Subscriptions */}
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <LoopIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">Recurring Subscriptions</Typography>
              </Box>
              <Chip label={subscriptions.length} color="secondary" size="small" />
            </Box>
            <Divider sx={{ mb: 2 }} />

            {subscriptions.length === 0 ? (
              <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 3 }}>
                No active repeating deliveries (milk, water, etc.) set up.
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {subscriptions.map((s) => (
                  <Grid item xs={12} sm={6} key={s._id}>
                    <Card variant="outlined">
                      <CardContent sx={{ p: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {s.serviceId?.serviceName}
                          </Typography>
                          <Chip 
                            label={s.status} 
                            color={s.status === 'Active' ? 'success' : 'default'} 
                            size="small" 
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                          Frequency: <strong>{s.frequency}</strong> | Rate: ₹{s.serviceId?.price}
                        </Typography>
                        <Box display="flex" gap={1}>
                          <Button 
                            variant="outlined" 
                            size="small"
                            color={s.status === 'Active' ? 'warning' : 'success'}
                            fullWidth
                            onClick={() => handleToggleSub(s._id, s.status)}
                          >
                            {s.status === 'Active' ? 'Pause' : 'Resume'}
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>

        {/* Right Column: Pending Payments & Invoice History */}
        <Grid item xs={12} md={4}>
          {/* Pending Payments Alerts */}
          {pendingPayments.length > 0 && (
            <Paper sx={{ p: 3, borderRadius: 3, mb: 4, border: '1px solid', borderColor: 'warning.main' }}>
              <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                <PaymentsIcon color="warning" />
                <Typography variant="subtitle1" fontWeight="bold">Payments Alert</Typography>
              </Box>
              <Alert severity="warning" sx={{ mb: 2 }}>
                You have {pendingPayments.length} pending cash/online payments.
              </Alert>
              <Box display="flex" flexDirection="column" gap={1.5}>
                {pendingPayments.slice(0, 2).map((bp) => (
                  <Box 
                    key={bp._id} 
                    p={1.5} 
                    sx={{ borderRadius: 2, border: '1px solid #e2e8f0', backgroundColor: 'action.hover' }}
                  >
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" fontWeight="bold">{bp.serviceId?.serviceName}</Typography>
                      <Typography variant="body2" fontWeight="bold">₹{bp.serviceId?.price}</Typography>
                    </Box>
                    <Button 
                      variant="outlined" 
                      color="warning" 
                      size="small" 
                      fullWidth 
                      sx={{ mt: 1 }}
                      onClick={() => navigate(`/orders/${bp._id}`)}
                    >
                      Pay / Clear Bill
                    </Button>
                  </Box>
                ))}
              </Box>
            </Paper>
          )}

          {/* Past Booking History */}
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <HistoryIcon color="action" />
              <Typography variant="h6" fontWeight="bold">Recent Booking History</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {pastBookings.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No completed bookings found.</Typography>
            ) : (
              <Box display="flex" flexDirection="column" gap={2}>
                {pastBookings.slice(0, 5).map((b) => (
                  <Box key={b._id} display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" fontWeight="bold">{b.serviceId?.serviceName}</Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Completed: {new Date(b.bookingDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Button 
                      size="small" 
                      variant="text"
                      onClick={() => navigate(`/orders/${b._id}`)}
                    >
                      Invoice
                    </Button>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CustomerDashboard;
