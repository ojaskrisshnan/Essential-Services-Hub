import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import HandymanIcon from '@mui/icons-material/Handyman';

import { useAuth } from '../context/AuthContext';

const categories = [
  'LPG Gas', 'Milk', 'Water Can', 'Laundry', 'Ironing', 
  'Electrician', 'Plumber', 'Carpenter', 'AC Repair', 
  'House Cleaning', 'Pest Control', 'Grocery', 'Medicine', 'Local Home Services'
];

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Basic Details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('customer'); // 'customer' or 'provider'
  
  // Address
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');

  // Provider Specific Details
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [pricing, setPricing] = useState(100);
  const [experience, setExperience] = useState(1);
  const [location, setLocation] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const urlRole = searchParams.get('role');
    if (urlRole === 'provider') {
      setRole('provider');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !phone) {
      return setError('Please fill in all basic fields.');
    }

    setLoading(true);
    setError('');

    const userData = {
      name,
      email,
      password,
      phone,
      role,
      address: { street, area, city, pincode },
    };

    if (role === 'provider') {
      userData.providerDetails = {
        businessName: businessName || `${name}'s Services`,
        category,
        location: location || city || area,
        pincode: pincode,
        experience: Number(experience),
        pricing: Number(pricing),
        availability: ['09:00 AM - 12:00 PM', '12:00 PM - 03:00 PM', '03:00 PM - 06:00 PM']
      };
    }

    try {
      await register(userData);
      if (role === 'provider') {
        navigate('/provider-dashboard');
      } else {
        navigate('/customer-dashboard');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Registration failed. Email might already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <HandymanIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h5" fontWeight="bold">ES Hub</Typography>
          </Box>
          <Typography variant="h5" fontWeight="bold">Create Account</Typography>
          <Typography variant="body2" color="text.secondary">Join our community today</Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Basic details */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Account Role</Typography>
              <RadioGroup 
                row 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                sx={{ mb: 1 }}
              >
                <FormControlLabel value="customer" control={<Radio />} label="Customer (Needs Services)" />
                <FormControlLabel value="provider" control={<Radio />} label="Service Provider (Offers Services)" />
              </RadioGroup>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="email"
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Grid>

            {/* Address */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" gutterBottom>
                Address
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Street / Landmark"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
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

            {/* Provider details */}
            {role === 'provider' && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" fontWeight="bold" color="primary" gutterBottom>
                    Business Profile (Requires Admin Approval)
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Business Name"
                    value={businessName}
                    placeholder="e.g. Cleaners LLC"
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel id="category-select-label">Category</InputLabel>
                    <Select
                      labelId="category-select-label"
                      value={category}
                      label="Category"
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {categories.map((cat) => (
                        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label="Starting Price (₹)"
                    value={pricing}
                    onChange={(e) => setPricing(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label="Years of Experience"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    required
                    fullWidth
                    label="Business Location/City"
                    value={location}
                    placeholder="e.g. Downtown Metroville"
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </Grid>
              </>
            )}
          </Grid>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ mt: 4, mb: 2, height: 48 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
          </Button>

          <Box display="flex" justifyContent="center" mt={1}>
            <Link component={RouterLink} to="/login" variant="body2">
              Already have an account? Sign In
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;
