import React from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';

export const ProviderCardSkeleton = () => (
  <Card sx={{ height: '100%' }}>
    <Skeleton variant="rectangular" height={160} />
    <CardContent>
      <Skeleton variant="text" width="60%" height={28} />
      <Skeleton variant="text" width="40%" height={20} style={{ margin: '8px 0' }} />
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
        <Skeleton variant="text" width="30%" height={24} />
        <Skeleton variant="rectangular" width={90} height={36} sx={{ borderRadius: 2 }} />
      </Box>
    </CardContent>
  </Card>
);

export const GridSkeleton = ({ count = 6 }) => (
  <Grid container spacing={3}>
    {Array.from(new Array(count)).map((_, index) => (
      <Grid item xs={12} sm={6} md={4} key={index}>
        <ProviderCardSkeleton />
      </Grid>
    ))}
  </Grid>
);

export const ListSkeleton = ({ count = 4 }) => (
  <Box mt={2}>
    {Array.from(new Array(count)).map((_, index) => (
      <Box key={index} mb={2} p={2} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
        <Skeleton variant="text" width="40%" height={28} />
        <Skeleton variant="text" width="80%" height={20} style={{ margin: '4px 0' }} />
        <Skeleton variant="text" width="20%" height={20} />
      </Box>
    ))}
  </Box>
);
