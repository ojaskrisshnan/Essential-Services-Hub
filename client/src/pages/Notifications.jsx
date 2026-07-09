import React, { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';

// Icons
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';

import api from '../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (error) {
      console.error('Failed to retrieve notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      setLoading(true);
      await api.put('/notifications/read');
      await fetchNotifications();
    } catch (err) {
      console.error(err);
      alert('Failed to mark read.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      setLoading(true);
      await api.delete(`/notifications/${id}`);
      await fetchNotifications();
    } catch (err) {
      console.error(err);
      alert('Failed to delete notification.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all notifications?')) return;
    try {
      setLoading(true);
      await api.delete('/notifications');
      await fetchNotifications();
    } catch (err) {
      console.error(err);
      alert('Failed to clear notifications.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={50} />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <NotificationsActiveIcon color="primary" />
            <Typography variant="h5" fontWeight="bold">Notification Center</Typography>
          </Box>
          <Box display="flex" gap={1.5}>
            {notifications.some(n => !n.read) && (
              <Button 
                variant="outlined" 
                color="primary" 
                startIcon={<DoneAllIcon />}
                onClick={handleMarkAllRead}
              >
                Mark all as read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button 
                variant="outlined" 
                color="error" 
                startIcon={<DeleteSweepIcon />}
                onClick={handleClearAll}
              >
                Clear all
              </Button>
            )}
          </Box>
        </Box>
        <Divider sx={{ mb: 2 }} />

        {notifications.length === 0 ? (
          <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
            You do not have any alerts yet.
          </Typography>
        ) : (
          <List>
            {notifications.map((notif, idx) => (
              <React.Fragment key={notif._id}>
                <ListItem 
                  sx={{ 
                    py: 2, 
                    px: 3, 
                    borderRadius: 2,
                    mb: 1.5,
                    backgroundColor: notif.read ? 'transparent' : 'action.hover',
                    borderLeft: notif.read ? 'none' : '4px solid',
                    borderColor: 'primary.main'
                  }}
                  secondaryAction={
                    <IconButton 
                      edge="end" 
                      aria-label="delete" 
                      color="error"
                      onClick={() => handleDeleteNotification(notif._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText 
                    primary={notif.message} 
                    secondary={new Date(notif.createdAt).toLocaleString()}
                    primaryTypographyProps={{ 
                      fontWeight: notif.read ? 400 : 600,
                      variant: 'body1'
                    }}
                    secondaryTypographyProps={{ 
                      variant: 'caption',
                      sx: { mt: 0.5, display: 'inline-block' }
                    }}
                  />
                </ListItem>
                {idx < notifications.length - 1 && <Divider sx={{ my: 1, opacity: 0.5 }} />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
};

export default Notifications;
