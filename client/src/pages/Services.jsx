import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Slider from '@mui/material/Slider';
import Rating from '@mui/material/Rating';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import PinDropIcon from '@mui/icons-material/PinDrop';
import StarIcon from '@mui/icons-material/Star';
import WorkIcon from '@mui/icons-material/Work';
import ScheduleIcon from '@mui/icons-material/Schedule';

import api from '../services/api';
import { GridSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

const categories = [
  'All Categories', 'LPG Gas', 'Milk', 'Water Can', 'Laundry', 'Ironing', 
  'Electrician', 'Plumber', 'Carpenter', 'AC Repair', 
  'House Cleaning', 'Pest Control', 'Grocery', 'Medicine', 'Local Home Services'
];

const Services = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Search & Filter state
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [pincode, setPincode] = useState(searchParams.get('pincode') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All Categories');
  
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [minRating, setMinRating] = useState(0);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      let url = '/providers?';
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (pincode) url += `pincode=${encodeURIComponent(pincode)}&`;
      if (category && category !== 'All Categories') url += `category=${encodeURIComponent(category)}&`;
      url += `minPrice=${priceRange[0]}&maxPrice=${priceRange[1]}&`;
      if (minRating > 0) url += `minRating=${minRating}`;

      const res = await api.get(url);
      setProviders(res.data);
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [searchParams, priceRange, minRating]);

  // Sync URL search params
  const handleApplyFilters = (e) => {
    if (e) e.preventDefault();
    let params = {};
    if (search) params.search = search;
    if (pincode) params.pincode = pincode;
    if (category && category !== 'All Categories') params.category = category;
    
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setSearch('');
    setPincode('');
    setCategory('All Categories');
    setPriceRange([0, 2000]);
    setMinRating(0);
    setSearchParams({});
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Explore Service Providers
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Find the best local businesses offering essential home services.
      </Typography>

      <Grid container spacing={4}>
        {/* Filter Sidebar */}
        <Grid item xs={12} md={3.5}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3, position: 'sticky', top: 90 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Filters
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box component="form" onSubmit={handleApplyFilters} display="flex" flexDirection="column" gap={2.5}>
              {/* Search input */}
              <TextField
                fullWidth
                size="small"
                label="Search Keyword"
                placeholder="Name, category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Pincode */}
              <TextField
                fullWidth
                size="small"
                label="Pincode"
                placeholder="e.g. 560001"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PinDropIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Category Select */}
              <FormControl fullWidth size="small">
                <InputLabel id="cat-label">Category</InputLabel>
                <Select
                  labelId="cat-label"
                  value={category}
                  label="Category"
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((c) => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Price Range */}
              <Box>
                <Typography variant="body2" fontWeight="600" color="text.secondary" gutterBottom>
                  Price Range (₹{priceRange[0]} - ₹{priceRange[1]})
                </Typography>
                <Slider
                  value={priceRange}
                  onChange={(e, newVal) => setPriceRange(newVal)}
                  valueLabelDisplay="auto"
                  min={0}
                  max={2000}
                  step={50}
                />
              </Box>

              {/* Ratings */}
              <Box>
                <Typography variant="body2" fontWeight="600" color="text.secondary" gutterBottom>
                  Minimum Rating
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Rating
                    value={minRating}
                    precision={1}
                    onChange={(e, val) => setMinRating(val || 0)}
                  />
                  {minRating > 0 && <Typography variant="caption">{minRating}+ Stars</Typography>}
                </Box>
              </Box>

              <Box display="flex" gap={1.5} mt={1}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  fullWidth
                >
                  Apply
                </Button>
                <Button 
                  variant="outlined" 
                  color="inherit" 
                  fullWidth
                  onClick={handleClearFilters}
                >
                  Clear
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Results Grid */}
        <Grid item xs={12} md={8.5}>
          {loading ? (
            <GridSkeleton count={4} />
          ) : providers.length === 0 ? (
            <EmptyState 
              title="No service providers found" 
              description="No providers matched your current search filters. Try reducing the price boundary or looking in a different category/pincode."
              actionText="Reset Filters"
              onAction={handleClearFilters}
            />
          ) : (
            <Grid container spacing={3}>
              {providers.map((prov) => (
                <Grid item xs={12} sm={6} key={prov._id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardMedia
                      component="img"
                      height="160"
                      image={prov.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80'}
                      alt={prov.businessName}
                    />
                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                        <Typography variant="h6" fontWeight="bold" component="h2" sx={{ lineHeight: 1.2 }}>
                          {prov.businessName}
                        </Typography>
                        <Chip 
                          label={prov.category} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                          sx={{ ml: 1, shrink: 0 }}
                        />
                      </Box>

                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Owner: {prov.ownerName}
                      </Typography>

                      <Box display="flex" alignItems="center" gap={0.5} my={1}>
                        <StarIcon sx={{ color: '#ffd43b', fontSize: 20 }} />
                        <Typography variant="body2" fontWeight="bold">
                          {prov.rating}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ({prov.ratingCount || 0} reviews)
                        </Typography>
                      </Box>

                      <Box display="flex" flexDirection="column" gap={0.5} mt={1} mb={2}>
                        <Box display="flex" alignItems="center" gap={1} color="text.secondary">
                          <WorkIcon sx={{ fontSize: 16 }} />
                          <Typography variant="body2">{prov.experience} Years Experience</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1} color="text.secondary">
                          <PinDropIcon sx={{ fontSize: 16 }} />
                          <Typography variant="body2">{prov.location} ({prov.pincode})</Typography>
                        </Box>
                        {prov.availability?.length > 0 && (
                          <Box display="flex" alignItems="center" gap={1} color="text.secondary">
                            <ScheduleIcon sx={{ fontSize: 16 }} />
                            <Typography variant="body2" noWrap>
                              Slots: {prov.availability[0]}...
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      <Divider sx={{ my: 1.5, mt: 'auto' }} />

                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Starting from
                          </Typography>
                          <Typography variant="h6" fontWeight="bold" color="primary.main">
                            ₹{prov.pricing}
                          </Typography>
                        </Box>
                        <Button 
                          variant="contained" 
                          color="primary"
                          onClick={() => navigate(`/providers/${prov.userId._id}`)} // Route detail page based on user ID
                        >
                          Book Now
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Services;
