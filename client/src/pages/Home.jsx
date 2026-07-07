import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import LocalDrinkIcon from '@mui/icons-material/LocalDrink';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import PlumbingIcon from '@mui/icons-material/Plumbing';
import ConstructionIcon from '@mui/icons-material/Construction';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import BugReportIcon from '@mui/icons-material/BugReport';
import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';

const categoriesList = [
  { name: 'LPG Gas', icon: LocalFireDepartmentIcon, color: '#ff6b6b' },
  { name: 'Milk', icon: LocalDrinkIcon, color: '#4dabf7' },
  { name: 'Water Can', icon: WaterDropIcon, color: '#339af0' },
  { name: 'Laundry', icon: LocalLaundryServiceIcon, color: '#da77f2' },
  { name: 'Ironing', icon: LocalLaundryServiceIcon, color: '#be4bdb' },
  { name: 'Electrician', icon: ElectricalServicesIcon, color: '#ffd43b' },
  { name: 'Plumber', icon: PlumbingIcon, color: '#22b8cf' },
  { name: 'Carpenter', icon: ConstructionIcon, color: '#f76707' },
  { name: 'AC Repair', icon: AcUnitIcon, color: '#15aabf' },
  { name: 'House Cleaning', icon: CleaningServicesIcon, color: '#20c997' },
  { name: 'Pest Control', icon: BugReportIcon, color: '#fa5252' },
  { name: 'Grocery', icon: LocalGroceryStoreIcon, color: '#40c057' },
  { name: 'Medicine', icon: LocalPharmacyIcon, color: '#e8590c' },
  { name: 'Local Home Services', icon: HomeRepairServiceIcon, color: '#7950f2' }
];

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [pincodeQuery, setPincodeQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    let url = '/services?';
    if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
    if (pincodeQuery) url += `pincode=${encodeURIComponent(pincodeQuery)}`;
    navigate(url);
  };

  const handleCategoryClick = (categoryName) => {
    navigate(`/services?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: (theme) => 
            theme.palette.mode === 'light'
              ? 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)'
              : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          py: { xs: 8, md: 12 },
          textAlign: 'center',
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`
        }}
      >
        <Container maxWidth="md">
          <Typography 
            variant="h2" 
            component="h1" 
            fontWeight="800" 
            gutterBottom
            sx={{
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              color: 'text.primary'
            }}
          >
            Your Daily Household Essentials, <Box component="span" sx={{ color: 'primary.main' }}>Simplified</Box>
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ mb: 4, px: { xs: 2, md: 8 } }}
          >
            Book, schedule, and track milk deliveries, water cans, LPG refills, laundry, housekeeping, plumbing, and other neighborhood services in one tap.
          </Typography>

          {/* Search Bar Form */}
          <Box 
            component="form" 
            onSubmit={handleSearchSubmit}
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              backgroundColor: 'background.paper',
              p: 2,
              borderRadius: 3,
              boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.15)',
              maxWidth: 700,
              mx: 'auto'
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="What service are you looking for? (e.g. Milk, Electrician)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              sx={{ width: { xs: '100%', sm: 180 } }}
              variant="outlined"
              placeholder="Pincode"
              value={pincodeQuery}
              onChange={(e) => setPincodeQuery(e.target.value)}
            />
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              size="large"
              sx={{ px: 4, height: 56 }}
            >
              Search
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Category Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box textAlign="center" mb={6}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Browse by Category
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Select an essential service to find certified local providers near you.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {categoriesList.map((cat) => {
            const Icon = cat.icon;
            return (
              <Grid item xs={6} sm={4} md={3} key={cat.name}>
                <Card 
                  onClick={() => handleCategoryClick(cat.name)}
                  sx={{ 
                    cursor: 'pointer', 
                    textAlign: 'center',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: 3,
                    borderRadius: 3
                  }}
                >
                  <Box 
                    sx={{ 
                      p: 2, 
                      borderRadius: '50%', 
                      backgroundColor: `${cat.color}20`,
                      color: cat.color,
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Icon sx={{ fontSize: 32 }} />
                  </Box>
                  <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                    <Typography variant="subtitle1" fontWeight="600">
                      {cat.name}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>
      
      {/* Recommended Banner */}
      <Box sx={{ backgroundColor: 'action.hover', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Are you a local service provider?
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Register your agency or freelance business with us to reach hundreds of households in your area. Add services, specify pricing, and manage schedules seamlessly.
              </Typography>
              <Button 
                variant="contained" 
                color="secondary" 
                size="large"
                onClick={() => navigate('/register?role=provider')}
              >
                Join as Service Provider
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box 
                component="img" 
                src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80" 
                alt="Service provider" 
                sx={{ width: '100%', borderRadius: 3, boxShadow: 3 }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
