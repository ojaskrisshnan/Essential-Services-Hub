import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import { Link as RouterLink } from 'react-router-dom';
import HandymanIcon from '@mui/icons-material/Handyman';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[900],
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <HandymanIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">
                Essential Services Hub
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              A single place to book, schedule, and track all your daily household needs from trusted local providers.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Quick Links
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <Link component={RouterLink} to="/services" color="inherit" variant="body2">
                Browse Services
              </Link>
              <Link component={RouterLink} to="/about" color="inherit" variant="body2">
                About Us
              </Link>
              <Link component={RouterLink} to="/contact" color="inherit" variant="body2">
                Contact Support
              </Link>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Legal
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <Link href="#" color="inherit" variant="body2">
                Privacy Policy
              </Link>
              <Link href="#" color="inherit" variant="body2">
                Terms of Service
              </Link>
            </Box>
          </Grid>
        </Grid>
        <Box mt={5} textAlign="center">
          <Typography variant="body2" color="text.secondary">
            {'Copyright © '}
            <Link color="inherit" href="#">
              Essential Services Hub
            </Link>{' '}
            {new Date().getFullYear()}
            {'. All rights reserved.'}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
