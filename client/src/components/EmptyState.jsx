import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import SearchOffIcon from '@mui/icons-material/SearchOff';

const EmptyState = ({ 
  title = 'No results found', 
  description = 'Try refining your search terms or filters.', 
  actionText, 
  onAction,
  icon: IconComponent = SearchOffIcon 
}) => {
  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center" 
      textAlign="center"
      p={6}
      my={4}
      sx={{
        backgroundColor: (theme) => theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.01)' : 'rgba(255, 255, 255, 0.02)',
        borderRadius: 4,
        border: '1px dashed',
        borderColor: (theme) => theme.palette.mode === 'light' ? '#e2e8f0' : '#233554',
      }}
    >
      <IconComponent sx={{ fontSize: 72, color: 'text.secondary', mb: 2, opacity: 0.6 }} />
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mb: 3 }}>
        {description}
      </Typography>
      {actionText && onAction && (
        <Button variant="contained" color="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
