import React, { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import CircularProgress from '@mui/material/CircularProgress';

// Chart JS Imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

import api from '../services/api';

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const analyticRes = await api.get('/analytics');
      setAnalytics(analyticRes.data);

      const usersRes = await api.get('/users');
      setUsers(usersRes.data);

      const provsRes = await api.get('/providers');
      setProviders(provsRes.data);

      const complaintsRes = await api.get('/complaints');
      setComplaints(complaintsRes.data);
    } catch (error) {
      console.error('Failed to load admin metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleUserBlock = async (userId) => {
    try {
      setLoading(true);
      await api.put(`/users/${userId}/block`);
      await fetchAdminData();
    } catch (err) {
      console.error(err);
      alert('Failed to block/unblock user.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProviderApproval = async (providerId, currentApproval) => {
    try {
      setLoading(true);
      await api.put(`/providers/${providerId}/approve`, { approved: !currentApproval });
      await fetchAdminData();
    } catch (err) {
      console.error(err);
      alert('Failed to update provider status.');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveComplaint = async (complaintId) => {
    try {
      setLoading(true);
      await api.put(`/complaints/${complaintId}`, { status: 'Resolved' });
      await fetchAdminData();
    } catch (err) {
      console.error(err);
      alert('Failed to resolve complaint.');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={50} />
      </Box>
    );
  }

  // Setup Chart Data Structures
  const usersChartData = {
    labels: ['Customers', 'Service Providers'],
    datasets: [
      {
        data: [analytics.summary?.totalCustomers || 0, analytics.summary?.totalProviders || 0],
        backgroundColor: ['#3f51b5', '#f50057'],
        hoverBackgroundColor: ['#303f9f', '#c51162'],
      },
    ],
  };

  const categoryChartData = {
    labels: analytics.categoryStats?.map((s) => s._id) || [],
    datasets: [
      {
        label: 'Bookings Count',
        data: analytics.categoryStats?.map((s) => s.count) || [],
        backgroundColor: 'rgba(34, 184, 207, 0.7)',
        borderColor: '#22b8cf',
        borderWidth: 1,
      },
    ],
  };

  // Maps monthly indices (e.g. Month 7 -> July)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const earningsChartData = {
    labels: analytics.monthlyStats?.map((s) => monthNames[s._id - 1]) || ['Jul'],
    datasets: [
      {
        label: 'Monthly Earnings (₹)',
        data: analytics.monthlyStats?.map((s) => s.total) || [analytics.summary?.revenue],
        borderColor: '#4caf50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        fill: true,
        tension: 0.2,
      },
    ],
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold">Admin Control Center</Typography>
        <Typography variant="body1" color="text.secondary">Review statistics, provider listings, and pending complaints.</Typography>
      </Box>

      {/* Tabs */}
      <Tabs 
        value={tabValue} 
        onChange={(e, val) => setTabValue(val)} 
        sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Analytics Dashboard" />
        <Tab label="Service Providers" />
        <Tab label="User Directories" />
        <Tab label="Customer Complaints" />
      </Tabs>

      {/* Tab Panels */}
      {tabValue === 0 && (
        <Box>
          {/* Key Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Total Earnings / Revenue</Typography>
                <Typography variant="h4" fontWeight="bold" color="primary.main" mt={1}>
                  ₹{analytics.summary?.revenue || 0}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Total Bookings Completed</Typography>
                <Typography variant="h4" fontWeight="bold" mt={1}>
                  {analytics.summary?.totalBookings || 0}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Active System Users</Typography>
                <Typography variant="h4" fontWeight="bold" mt={1}>
                  {analytics.summary?.totalUsers || 0}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Charts Grid */}
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                <Typography variant="h6" fontWeight="bold" mb={2}>User Demographic</Typography>
                <Box height={250} display="flex" justifyContent="center">
                  <Pie data={usersChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight="bold" mb={2}>System Category Bookings</Typography>
                <Box height={250}>
                  <Bar data={categoryChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight="bold" mb={2}>System Sales & Earnings Trend</Typography>
                <Box height={280}>
                  <Line data={earningsChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {tabValue === 1 && (
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight="bold" mb={2}>Provider Verification Panel</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Business Name</strong></TableCell>
                  <TableCell><strong>Category</strong></TableCell>
                  <TableCell><strong>Owner</strong></TableCell>
                  <TableCell><strong>Location</strong></TableCell>
                  <TableCell><strong>Rating</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell align="right"><strong>Action</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {providers.map((p) => (
                  <TableRow key={p._id}>
                    <TableCell><strong>{p.businessName}</strong></TableCell>
                    <TableCell>{p.category}</TableCell>
                    <TableCell>{p.ownerName}</TableCell>
                    <TableCell>{p.location} ({p.pincode})</TableCell>
                    <TableCell>{p.rating} ⭐</TableCell>
                    <TableCell>
                      <Chip 
                        label={p.approved ? 'Verified' : 'Pending Verification'} 
                        color={p.approved ? 'success' : 'warning'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant={p.approved ? 'outlined' : 'contained'}
                        color={p.approved ? 'error' : 'success'}
                        size="small"
                        onClick={() => handleToggleProviderApproval(p._id, p.approved)}
                      >
                        {p.approved ? 'Suspend' : 'Verify & Approve'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {tabValue === 2 && (
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight="bold" mb={2}>User Directory Manager</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Phone</strong></TableCell>
                  <TableCell><strong>Role</strong></TableCell>
                  <TableCell><strong>Block Status</strong></TableCell>
                  <TableCell align="right"><strong>Action</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u._id}>
                    <TableCell>{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.phone}</TableCell>
                    <TableCell>
                      <Chip label={u.role.toUpperCase()} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={u.isBlocked ? 'Blocked' : 'Active'} 
                        color={u.isBlocked ? 'error' : 'success'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell align="right">
                      {u.role !== 'admin' && (
                        <Button
                          variant="outlined"
                          color={u.isBlocked ? 'success' : 'error'}
                          size="small"
                          onClick={() => handleToggleUserBlock(u._id)}
                        >
                          {u.isBlocked ? 'Unblock' : 'Block User'}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {tabValue === 3 && (
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight="bold" mb={2}>Dispute Support Desk</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Customer</strong></TableCell>
                  <TableCell><strong>Reason</strong></TableCell>
                  <TableCell><strong>Details</strong></TableCell>
                  <TableCell><strong>Booking ID</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell align="right"><strong>Action</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {complaints.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">No active complaints in the system.</TableCell>
                  </TableRow>
                ) : (
                  complaints.map((c) => (
                    <TableRow key={c._id}>
                      <TableCell>{c.customerId?.name} ({c.customerId?.email})</TableCell>
                      <TableCell>
                        <Chip label={c.reason} color="error" size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{c.description}</TableCell>
                      <TableCell>{c.bookingId?._id}</TableCell>
                      <TableCell>
                        <Chip 
                          label={c.status} 
                          color={c.status === 'Resolved' ? 'success' : 'warning'} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell align="right">
                        {c.status === 'Pending' && (
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => handleResolveComplaint(c._id)}
                          >
                            Resolve Dispute
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Container>
  );
};

export default AdminDashboard;
