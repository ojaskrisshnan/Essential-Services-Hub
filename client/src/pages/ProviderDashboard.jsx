import React, { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';

// Icons
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AssignmentIcon from '@mui/icons-material/Assignment';
import StarRateIcon from '@mui/icons-material/StarRate';
import HandymanIcon from '@mui/icons-material/Handyman';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const statusFlow = ['Requested', 'Accepted', 'Assigned', 'Out for Delivery', 'In Progress', 'Completed', 'Cancelled'];

const ProviderDashboard = () => {
  const { user, providerDetails } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Service modal
  const [serviceOpen, setServiceOpen] = useState(false);
  const [editingService, setEditingService] = useState(null); // null if adding new
  const [serviceName, setServiceName] = useState('');
  const [serviceDesc, setServiceDesc] = useState('');
  const [servicePrice, setServicePrice] = useState(100);
  const [serviceDuration, setServiceDuration] = useState(60);

  const fetchDashboardData = async () => {
    try {
      const bookRes = await api.get('/booking');
      setBookings(bookRes.data);

      const servRes = await api.get(`/services?providerId=${user._id}`);
      setServices(servRes.data);

      const revRes = await api.get(`/reviews?providerId=${user._id}`);
      setReviews(revRes.data);
    } catch (error) {
      console.error('Failed to load provider dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleBookingAction = async (bookingId, nextStatus) => {
    try {
      setLoading(true);
      await api.put(`/booking/${bookingId}`, { status: nextStatus });
      await fetchDashboardData();
    } catch (err) {
      console.error(err);
      alert('Failed to update booking status.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrEditService = async (e) => {
    e.preventDefault();
    if (!serviceName || !servicePrice) return;

    try {
      setLoading(true);
      const data = {
        serviceName,
        category: providerDetails?.category || 'Local Home Services',
        description: serviceDesc,
        price: Number(servicePrice),
        duration: Number(serviceDuration)
      };

      if (editingService) {
        await api.put(`/services/${editingService._id}`, data);
      } else {
        await api.post('/services', data);
      }

      setServiceOpen(false);
      setEditingService(null);
      setServiceName('');
      setServiceDesc('');
      setServicePrice(100);
      setServiceDuration(60);

      await fetchDashboardData();
    } catch (err) {
      console.error(err);
      alert('Failed to save service.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      setLoading(true);
      await api.delete(`/services/${serviceId}`);
      await fetchDashboardData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete service.');
    } finally {
      setLoading(false);
    }
  };

  const openServiceDialog = (serv = null) => {
    if (serv) {
      setEditingService(serv);
      setServiceName(serv.serviceName);
      setServiceDesc(serv.description);
      setServicePrice(serv.price);
      setServiceDuration(serv.duration);
    } else {
      setEditingService(null);
      setServiceName('');
      setServiceDesc('');
      setServicePrice(100);
      setServiceDuration(60);
    }
    setServiceOpen(true);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={50} />
      </Box>
    );
  }

  // Segmenting bookings
  const newRequests = bookings.filter(b => b.status === 'Requested');
  const activeJobs = bookings.filter(b => !['Requested', 'Completed', 'Cancelled'].includes(b.status));
  const completedJobs = bookings.filter(b => b.status === 'Completed');

  // Calculate earnings
  const totalRevenue = completedJobs.reduce((sum, b) => sum + (b.serviceId?.price || 0), 0);

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            {providerDetails?.businessName || 'Business Dashboard'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Category: {providerDetails?.category} | Owner: {user?.name}
          </Typography>
        </Box>
        {providerDetails?.approved ? (
          <Chip label="Verified Partner" color="success" />
        ) : (
          <Chip label="Verification Pending" color="warning" />
        )}
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <MonetizationOnIcon color="primary" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="caption" color="text.secondary">Total Revenue</Typography>
              <Typography variant="h5" fontWeight="bold">₹{totalRevenue}</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <AssignmentIcon color="secondary" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="caption" color="text.secondary">Incoming Requests</Typography>
              <Typography variant="h5" fontWeight="bold">{newRequests.length}</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <StarRateIcon sx={{ color: '#ffc107', fontSize: 40 }} />
            <Box>
              <Typography variant="caption" color="text.secondary">Business Rating</Typography>
              <Typography variant="h5" fontWeight="bold">{providerDetails?.rating || 'N/A'}</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <HandymanIcon color="info" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="caption" color="text.secondary">Total Offerings</Typography>
              <Typography variant="h5" fontWeight="bold">{services.length}</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Main Grid: Left Jobs, Right Catalog */}
      <Grid container spacing={4}>
        {/* Left Column: Jobs Management */}
        <Grid item xs={12} md={7.5}>
          {/* New Booking Requests */}
          <Paper sx={{ p: 3, borderRadius: 3, mb: 4 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>Incoming Service Requests</Typography>
            <Divider sx={{ mb: 2 }} />

            {newRequests.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No incoming requests at the moment.</Typography>
            ) : (
              <Box display="flex" flexDirection="column" gap={2}>
                {newRequests.map((req) => (
                  <Card key={req._id} variant="outlined" sx={{ '&:hover': { transform: 'none', boxShadow: 'none' } }}>
                    <CardContent sx={{ p: 2 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={7}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {req.serviceId?.serviceName} (₹{req.serviceId?.price})
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Client: {req.customerId?.name} | Phone: {req.customerId?.phone}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Slot: {req.slot} | Date: {new Date(req.bookingDate).toLocaleDateString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={5} textAlign="right">
                          <Button 
                            variant="contained" 
                            color="success" 
                            size="small"
                            onClick={() => handleBookingAction(req._id, 'Accepted')}
                            sx={{ mr: 1 }}
                          >
                            Accept
                          </Button>
                          <Button 
                            variant="outlined" 
                            color="error" 
                            size="small"
                            onClick={() => handleBookingAction(req._id, 'Cancelled')}
                          >
                            Reject
                          </Button>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>

          {/* Active Job Tracker board */}
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>Active Job Board</Typography>
            <Divider sx={{ mb: 2 }} />

            {activeJobs.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No active operations currently.</Typography>
            ) : (
              <Box display="flex" flexDirection="column" gap={2}>
                {activeJobs.map((job) => (
                  <Card key={job._id} variant="outlined" sx={{ '&:hover': { transform: 'none', boxShadow: 'none' } }}>
                    <CardContent sx={{ p: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">{job.serviceId?.serviceName}</Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Client: {job.customerId?.name} | {job.slot}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Addr: {job.address?.street}, {job.address?.area} ({job.address?.pincode})
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <FormControl size="small" sx={{ minWidth: 140 }}>
                            <Select
                              value={job.status}
                              onChange={(e) => handleBookingAction(job._id, e.target.value)}
                            >
                              <MenuItem value="Accepted">Accepted</MenuItem>
                              <MenuItem value="Assigned">Assigned</MenuItem>
                              <MenuItem value="Out for Delivery">Out for Delivery</MenuItem>
                              <MenuItem value="In Progress">In Progress</MenuItem>
                              <MenuItem value="Completed">Completed</MenuItem>
                              <MenuItem value="Cancelled">Cancelled</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right Column: Service Catalog Management */}
        <Grid item xs={12} md={4.5}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">Service Catalog</Typography>
              <Button 
                variant="contained" 
                size="small" 
                startIcon={<AddIcon />}
                onClick={() => openServiceDialog()}
              >
                Add Service
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {services.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No items in your catalog yet. Click Add Service above.</Typography>
            ) : (
              <Box display="flex" flexDirection="column" gap={1.5}>
                {services.map((s) => (
                  <Box 
                    key={s._id} 
                    p={2} 
                    sx={{ 
                      borderRadius: 2, 
                      border: '1px solid #e2e8f0', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight="bold">{s.serviceName}</Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Price: ₹{s.price} | Duration: {s.duration} mins
                      </Typography>
                    </Box>
                    <Box>
                      <IconButton color="primary" onClick={() => openServiceDialog(s)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDeleteService(s._id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Service Add/Edit Dialog */}
      <Dialog open={serviceOpen} onClose={() => setServiceOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingService ? 'Edit Catalog Service' : 'Add New Catalog Service'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleAddOrEditService} display="flex" flexDirection="column" gap={2} sx={{ mt: 1.5 }}>
            <TextField
              required
              fullWidth
              label="Service Name"
              value={serviceName}
              placeholder="e.g. 15L Bottled Water"
              onChange={(e) => setServiceName(e.target.value)}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={serviceDesc}
              onChange={(e) => setServiceDesc(e.target.value)}
            />
            <Box display="flex" gap={2}>
              <TextField
                required
                fullWidth
                type="number"
                label="Price (₹)"
                value={servicePrice}
                onChange={(e) => setServicePrice(e.target.value)}
              />
              <TextField
                required
                fullWidth
                type="number"
                label="Duration (minutes)"
                value={serviceDuration}
                onChange={(e) => setServiceDuration(e.target.value)}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setServiceOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddOrEditService} disabled={!serviceName || !servicePrice}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProviderDashboard;
