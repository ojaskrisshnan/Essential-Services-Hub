import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';

import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HandymanIcon from '@mui/icons-material/Handyman';

import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';
import api from '../services/api';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { mode, toggleThemeMode } = useThemeMode();
  const navigate = useNavigate();

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorElNotif, setAnchorElNotif] = useState(null);
  
  // Mobile Drawer State
  const [mobileOpen, setMobileOpen] = useState(false);

  const fetchNotifications = async () => {
    if (isAuthenticated) {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data);
        setUnreadCount(res.data.filter((n) => !n.read).length);
      } catch (error) {
        console.error('Error fetching notifications in Navbar:', error);
      }
    }
  };

  useEffect(() => {
    fetchNotifications();
    let interval;
    if (isAuthenticated) {
      interval = setInterval(fetchNotifications, 12000); // refresh every 12 seconds
    }
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleNotifOpen = (event) => {
    setAnchorElNotif(event.currentTarget);
  };

  const handleNotifClose = () => {
    setAnchorElNotif(null);
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark notifications read:', error);
    }
    handleNotifClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setMobileOpen(open);
  };

  // Nav links configuration based on role
  const getNavLinks = () => {
    if (!isAuthenticated) {
      return [
        { label: 'Services', path: '/services' },
        { label: 'About', path: '/about' },
        { label: 'Contact', path: '/contact' },
      ];
    }
    
    if (user.role === 'admin') {
      return [
        { label: 'Dashboard', path: '/admin-dashboard' },
        { label: 'Services', path: '/services' },
      ];
    }

    if (user.role === 'provider') {
      return [
        { label: 'Dashboard', path: '/provider-dashboard' },
        { label: 'Services', path: '/services' },
      ];
    }

    // Default Customer
    return [
      { label: 'Home', path: '/' },
      { label: 'Dashboard', path: '/customer-dashboard' },
      { label: 'Book Service', path: '/services' },
    ];
  };

  const navLinks = getNavLinks();

  const drawer = (
    <Box onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)} sx={{ width: 250 }}>
      <Box sx={{ my: 2, px: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <HandymanIcon color="primary" />
        <Typography variant="h6" fontWeight="bold">
          ES Hub
        </Typography>
      </Box>
      <Divider />
      <List>
        {navLinks.map((link) => (
          <ListItem button component={RouterLink} to={link.path} key={link.label}>
            <ListItemText primary={link.label} />
          </ListItem>
        ))}
        {isAuthenticated ? (
          <>
            <ListItem button component={RouterLink} to="/profile">
              <ListItemText primary="My Profile" />
            </ListItem>
            <ListItem button onClick={handleLogout}>
              <ListItemText primary="Logout" />
            </ListItem>
          </>
        ) : (
          <>
            <ListItem button component={RouterLink} to="/login">
              <ListItemText primary="Login" />
            </ListItem>
            <ListItem button component={RouterLink} to="/register">
              <ListItemText primary="Register" />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" color="default" elevation={1} sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
        <Toolbar>
          {/* Hamburger Menu on Mobile */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleDrawer(true)}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo / Title */}
          <HandymanIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1, color: 'primary.main' }} />
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: 'flex',
              fontWeight: 800,
              letterSpacing: '.05rem',
              color: 'inherit',
              textDecoration: 'none',
              flexGrow: { xs: 1, md: 0 }
            }}
          >
            Essential Services Hub
          </Typography>

          {/* Desktop Nav Links */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 2, ml: 4 }}>
            {navLinks.map((link) => (
              <Button
                component={RouterLink}
                to={link.path}
                key={link.label}
                sx={{ color: 'text.primary', fontWeight: 550 }}
              >
                {link.label}
              </Button>
            ))}
          </Box>

          {/* Right Action Icons */}
          <Box display="flex" alignItems="center" gap={1}>
            {/* Theme Toggle */}
            <IconButton onClick={toggleThemeMode} color="inherit">
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>

            {/* Notifications Menu */}
            {isAuthenticated && (
              <>
                <IconButton color="inherit" onClick={handleNotifOpen}>
                  <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
                <Menu
                  anchorEl={anchorElNotif}
                  open={Boolean(anchorElNotif)}
                  onClose={handleNotifClose}
                  PaperProps={{
                    sx: { width: 320, maxHeight: 400, mt: 1.5, borderRadius: 2 }
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
                    <Typography variant="subtitle1" fontWeight="bold">Notifications</Typography>
                    {unreadCount > 0 && (
                      <Button size="small" onClick={handleMarkAllRead}>Mark read</Button>
                    )}
                  </Box>
                  <Divider />
                  {notifications.length === 0 ? (
                    <MenuItem disabled sx={{ py: 2 }}>
                      <Typography variant="body2" color="text.secondary">No notifications yet.</Typography>
                    </MenuItem>
                  ) : (
                    notifications.slice(0, 5).map((notif) => (
                      <MenuItem 
                        key={notif._id} 
                        onClick={handleNotifClose}
                        component={RouterLink}
                        to={user.role === 'customer' ? '/customer-dashboard' : '/provider-dashboard'}
                        sx={{ 
                          whiteSpace: 'normal',
                          py: 1.5,
                          backgroundColor: notif.read ? 'transparent' : 'action.hover' 
                        }}
                      >
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: notif.read ? 400 : 600 }}>
                            {notif.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))
                  )}
                  <Divider />
                  <MenuItem 
                    component={RouterLink} 
                    to="/notifications" 
                    onClick={handleNotifClose}
                    sx={{ justifyContent: 'center', py: 1 }}
                  >
                    <Typography variant="body2" color="primary" fontWeight="bold">View all</Typography>
                  </MenuItem>
                </Menu>
              </>
            )}

            {/* Profile / Login Button */}
            {isAuthenticated ? (
              <>
                <Button
                  component={RouterLink}
                  to="/profile"
                  startIcon={<AccountCircleIcon />}
                  sx={{ color: 'text.primary', fontWeight: 600, display: { xs: 'none', sm: 'inline-flex' } }}
                >
                  {user.name.split(' ')[0]}
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={handleLogout}
                  sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                color="primary"
                size="small"
              >
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={toggleDrawer(false)}
        ModalProps={{ keepMounted: true }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;
