import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Rating from '@mui/material/Rating';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

// Icons
import StarIcon from '@mui/icons-material/Star';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import PinDropIcon from '@mui/icons-material/PinDrop';
import WorkIcon from '@mui/icons-material/Work';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SendIcon from '@mui/icons-material/Send';
import AutorenewIcon from '@mui/icons-material/Autorenew';

import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/EmptyState';

const ProviderDetails = () => {
  const { id } = useParams(); // Provider's User ID
  const navigate = useNavigate();
  const { user } = useAuth();

  const [provider, setProvider] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Review states
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Review Reply states (for Provider role)
  const [replyTexts, setReplyTexts] = useState({}); // { reviewId: text }

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch provider details
      const provRes = await api.get('/providers?approved=all');
      const found = provRes.data.find(p => p.userId?._id === id);
      if (!found) {
        setError('Provider details not found.');
        setLoading(false);
        return;
      }
      setProvider(found);

      // 2. Fetch services offered by this provider user
      const servRes = await api.get(`/services?providerId=${id}`);
      setServices(servRes.data);

      // 3. Fetch reviews
      const revRes = await api.get(`/reviews?providerId=${id}`);
      setReviews(revRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch provider details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleBookService = (service) => {
    navigate('/booking', { state: { service, provider } });
  };

  const handleSubscribeService = (service) => {
    navigate('/booking', { state: { service, provider, isSubscription: true } });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      return navigate('/login');
    }

    setSubmittingReview(true);
    try {
      await api.post('/review', {
        providerId: id,
        rating: newRating,
        review: newReviewText
      });
      setNewReviewText('');
      setNewRating(5);
      
      // Refresh details
      const revRes = await api.get(`/reviews?providerId=${id}`);
      setReviews(revRes.data);

      // Refresh provider rating average
      const provRes = await api.get('/providers?approved=all');
      const found = provRes.data.find(p => p.userId?._id === id);
      if (found) setProvider(found);

    } catch (err) {
      console.error(err);
      alert('Failed to post review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleReplyChange = (reviewId, text) => {
    setReplyTexts(prev => ({ ...prev, [reviewId]: text }));
  };

  const handleReplySubmit = async (reviewId) => {
    const text = replyTexts[reviewId];
    if (!text) return;

    try {
      await api.put(`/reviews/${reviewId}/reply`, { reply: text });
      setReplyTexts(prev => ({ ...prev, [reviewId]: '' }));
      
      // Refresh reviews list
      const revRes = await api.get(`/reviews?providerId=${id}`);
      setReviews(revRes.data);
    } catch (err) {
      console.error(err);
      alert('Failed to submit reply.');
    }
  };

  const isSubscriptionSupported = (cat) => {
    return ['Milk', 'Water Can', 'Newspaper', 'Grocery', 'LPG Gas', 'Laundry', 'Ironing'].includes(cat);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={50} />
      </Box>
    );
  }

  if (error || !provider) {
    return (
      <Container maxWidth="md" sx={{ py: 10 }}>
        <Alert severity="error">{error || 'Provider not found.'}</Alert>
        <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate('/services')}>Back to services</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Top Banner */}
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, mb: 4, position: 'relative', overflow: 'hidden' }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={3}>
            <Box 
              component="img" 
              src={provider.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80'}
              alt={provider.businessName}
              sx={{ width: '100%', borderRadius: 3, objectFit: 'cover', height: 180, boxShadow: 1 }}
            />
          </Grid>
          <Grid item xs={12} md={9}>
            <Box display="flex" gap={1.5} flexWrap="wrap" alignItems="center" mb={1}>
              <Chip label={provider.category} color="primary" />
              {!provider.approved && (
                <Chip label="Requires Verification" color="warning" variant="outlined" />
              )}
            </Box>
            <Typography variant="h3" fontWeight="800" component="h1" gutterBottom>
              {provider.businessName}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Owner: {provider.ownerName}
            </Typography>

            <Box display="flex" flexWrap="wrap" gap={3} my={2.5}>
              <Box display="flex" alignItems="center" gap={0.5}>
                <StarIcon sx={{ color: '#ffd43b' }} />
                <Typography variant="body1" fontWeight="bold">{provider.rating}</Typography>
                <Typography variant="body2" color="text.secondary">({provider.ratingCount} reviews)</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1} color="text.secondary">
                <WorkIcon sx={{ fontSize: 20 }} />
                <Typography variant="body2">{provider.experience} years experience</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1} color="text.secondary">
                <PinDropIcon sx={{ fontSize: 20 }} />
                <Typography variant="body2">{provider.location} ({provider.pincode})</Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Provider contact details shown if logged in */}
            {user ? (
              <Box display="flex" flexWrap="wrap" gap={3}>
                <Box display="flex" alignItems="center" gap={1} color="text.secondary">
                  <PhoneIcon sx={{ fontSize: 18 }} />
                  <Typography variant="body2">{provider.userId?.phone || 'N/A'}</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1} color="text.secondary">
                  <EmailIcon sx={{ fontSize: 18 }} />
                  <Typography variant="body2">{provider.userId?.email || 'N/A'}</Typography>
                </Box>
              </Box>
            ) : (
              <Typography variant="caption" color="text.secondary">
                Sign in to view provider contact phone & email.
              </Typography>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Main Grid: Left Services, Right Slots & Reviews */}
      <Grid container spacing={4}>
        {/* Left Column: Services offered */}
        <Grid item xs={12} md={7.5}>
          <Paper sx={{ p: 4, borderRadius: 3, mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" mb={3}>
              Offered Services
            </Typography>
            {services.length === 0 ? (
              <Typography variant="body1" color="text.secondary">
                No individual services set up yet.
              </Typography>
            ) : (
              <Box display="flex" flexDirection="column" gap={3}>
                {services.map((service) => (
                  <Card key={service._id} variant="outlined" sx={{ '&:hover': { transform: 'none', boxShadow: 'none' } }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="h6" fontWeight="bold">{service.serviceName}</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                            {service.description || 'Doorstep delivery/repair service.'}
                          </Typography>
                          <Box display="flex" gap={1} alignItems="center" color="text.secondary">
                            <ScheduleIcon sx={{ fontSize: 16 }} />
                            <Typography variant="caption">{service.duration} mins duration</Typography>
                          </Box>
                        </Box>
                        <Box textAlign="right" sx={{ minWidth: 100 }}>
                          <Typography variant="h5" fontWeight="bold" color="primary.main" gutterBottom>
                            ₹{service.price}
                          </Typography>
                          <Button 
                            variant="contained" 
                            color="primary" 
                            fullWidth
                            onClick={() => handleBookService(service)}
                            sx={{ mb: 1 }}
                          >
                            Book
                          </Button>
                          {isSubscriptionSupported(provider.category) && (
                            <Button 
                              variant="outlined" 
                              color="secondary" 
                              startIcon={<AutorenewIcon />}
                              fullWidth
                              size="small"
                              onClick={() => handleSubscribeService(service)}
                            >
                              Subscribe
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right Column: Availability & Reviews */}
        <Grid item xs={12} md={4.5}>
          {/* Availability */}
          <Paper sx={{ p: 3, borderRadius: 3, mb: 4 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Work Schedules & Slots
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box display="flex" flexWrap="wrap" gap={1}>
              {provider.availability?.map((slot) => (
                <Chip key={slot} label={slot} variant="outlined" color="primary" />
              ))}
            </Box>
          </Paper>

          {/* Customer Reviews */}
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Customer Reviews
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {/* Leave Review Form */}
            {user && user._id !== id && user.role === 'customer' && (
              <Box component="form" onSubmit={handleReviewSubmit} sx={{ mb: 4 }}>
                <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                  Write a review
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Typography variant="caption">Rating:</Typography>
                  <Rating
                    value={newRating}
                    onChange={(e, val) => setNewRating(val || 5)}
                  />
                </Box>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Share details of your experience..."
                  value={newReviewText}
                  onChange={(e) => setNewReviewText(e.target.value)}
                  sx={{ mb: 1.5 }}
                />
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="secondary"
                  disabled={submittingReview}
                  size="small"
                >
                  {submittingReview ? 'Submitting...' : 'Submit'}
                </Button>
              </Box>
            )}

            {/* Review List */}
            {reviews.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No reviews submitted yet.</Typography>
            ) : (
              <Box display="flex" flexDirection="column" gap={3}>
                {reviews.map((rev) => (
                  <Box key={rev._id} sx={{ p: 2, borderBottom: '1px solid #e2e8f0' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" fontWeight="bold">{rev.customerId?.name || 'Anonymous'}</Typography>
                      <Rating size="small" value={rev.rating} readOnly />
                    </Box>
                    <Typography variant="body2" color="text.primary" sx={{ mb: 1 }}>
                      {rev.review || 'No text review provided.'}
                    </Typography>

                    {/* Show existing provider reply */}
                    {rev.reply && (
                      <Box 
                        sx={{ 
                          p: 1.5, 
                          mt: 1, 
                          borderRadius: 2, 
                          backgroundColor: 'action.hover', 
                          borderLeft: '3px solid',
                          borderColor: 'primary.main'
                        }}
                      >
                        <Typography variant="caption" fontWeight="bold" display="block">
                          Provider Reply:
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {rev.reply}
                        </Typography>
                      </Box>
                    )}

                    {/* Show reply field for this Provider owner */}
                    {user && user._id === id && !rev.reply && (
                      <Box display="flex" alignItems="center" gap={1} mt={2}>
                        <TextField
                          size="small"
                          fullWidth
                          placeholder="Reply to review..."
                          value={replyTexts[rev._id] || ''}
                          onChange={(e) => handleReplyChange(rev._id, e.target.value)}
                        />
                        <IconButton 
                          color="primary" 
                          onClick={() => handleReplySubmit(rev._id)}
                          disabled={!replyTexts[rev._id]}
                        >
                          <SendIcon />
                        </IconButton>
                      </Box>
                    )}
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

export default ProviderDetails;
