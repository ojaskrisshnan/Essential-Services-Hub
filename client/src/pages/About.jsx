import React from 'react';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import HomeIcon from '@mui/icons-material/Home';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SpeedIcon from '@mui/icons-material/Speed';

const About = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 5, borderRadius: 3, mb: 6 }}>
        <Typography variant="h3" fontWeight="800" align="center" gutterBottom>
          About Our Platform
        </Typography>
        <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 4, maxD: 600, mx: 'auto' }}>
          Bringing local utilities, milk deliveries, LPG gas, and household repair mechanics under a single unified tracking dashboard.
        </Typography>
        <Divider sx={{ mb: 6 }} />

        <Grid container spacing={4}>
          <Grid item xs={12} md={4} textAlign="center">
            <Box sx={{ p: 2, display: 'inline-flex', borderRadius: '50%', backgroundColor: 'rgba(63, 81, 181, 0.1)', mb: 2 }}>
              <HomeIcon color="primary" sx={{ fontSize: 40 }} />
            </Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Daily Essentials Hub</Typography>
            <Typography variant="body2" color="text.secondary">
              We consolidate fragmented household bookings (water cans, LPG cylinders, milk dairy subscriptions) in one simplified app.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} textAlign="center">
            <Box sx={{ p: 2, display: 'inline-flex', borderRadius: '50%', backgroundColor: 'rgba(245, 0, 87, 0.1)', mb: 2 }}>
              <VerifiedUserIcon color="secondary" sx={{ fontSize: 40 }} />
            </Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Verified Providers</Typography>
            <Typography variant="body2" color="text.secondary">
              All listed agencies and technicians undergo rigorous background and license verification by our administrators.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} textAlign="center">
            <Box sx={{ p: 2, display: 'inline-flex', borderRadius: '50%', backgroundColor: 'rgba(76, 175, 80, 0.1)', mb: 2 }}>
              <SpeedIcon color="success" sx={{ fontSize: 40 }} />
            </Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Real-time Tracking</Typography>
            <Typography variant="body2" color="text.secondary">
              Track the exact state of your deliveries and service bookings from request to acceptance, assignment, and completion.
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default About;
