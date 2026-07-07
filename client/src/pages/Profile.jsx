import React, { useState } from 'react';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';

import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, providerDetails, updateProfile } = useAuth();

  // Basic Info States
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');

  // Address States
  const [street, setStreet] = useState(user?.address?.street || '');
  const [area, setArea] = useState(user?.address?.area || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [pincode, setPincode] = useState(user?.address?.pincode || '');

  // Provider details (Optional)
  const [businessName, setBusinessName] = useState(providerDetails?.businessName || '');
  const [pricing, setPricing] = useState(providerDetails?.pricing || 100);
  const [experience, setExperience] = useState(providerDetails?.experience || 1);
  const [location, setLocation] = useState(providerDetails?.location || '');
  const [image, setImage] = useState(providerDetails?.image || '');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const updateData = {
      name,
      phone,
      address: { street, area, city, pincode }
    };

    if (password) {
      updateData.password = password;
    }

    if (user.role === 'provider') {
      updateData.providerDetails = {
        businessName,
        pricing: Number(pricing),
        experience: Number(experience),
        location,
        image
      };
    }

    try {
      await updateProfile(updateData);
      setSuccess('Profile updated successfully.');
      setPassword('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          My Profile
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Update your account preferences, address, and partner details.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* General Info */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold">Account Details</Typography>
              <Divider sx={{ mt: 1 }} />
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
                disabled
                type="email"
                label="Email Address (Cannot Change)"
                value={user?.email || ''}
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="password"
                label="New Password (Leave blank to keep current)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Grid>

            {/* Address Info */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>Home Address</Typography>
              <Divider sx={{ mt: 1 }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Street Name / Flat No"
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

            {/* Partner Details */}
            {user?.role === 'provider' && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mt: 2 }}>
                    Business Profile Configuration
                  </Typography>
                  <Divider sx={{ mt: 1 }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Business Name"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Business Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label="Starting Rate (₹)"
                    value={pricing}
                    onChange={(e) => setPricing(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label="Years of Experience"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Business Cover Image URL"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                  />
                </Grid>
              </>
            )}
          </Grid>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ mt: 4, height: 48, px: 4 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile;
