import React, { useState } from 'react';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';

// Icons
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSubmitted(true);
    setName('');
    setEmail('');
    setMessage('');
    setTimeout(() => {
      setSubmitted(false);
    }, 4000);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Grid container spacing={4}>
        {/* Contact Info */}
        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3, height: '100%' }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>Get In Touch</Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Have a question or feedback regarding provider services? Reach out to us.
            </Typography>

            <Box display="flex" flexDirection="column" gap={3} mt={4}>
              <Box display="flex" alignItems="center" gap={2}>
                <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: 'primary.light', color: 'white' }}>
                  <PhoneIcon />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Phone Support</Typography>
                  <Typography variant="body1" fontWeight="bold">+1 (800) 555-SERV</Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="center" gap={2}>
                <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: 'secondary.light', color: 'white' }}>
                  <EmailIcon />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Email Support</Typography>
                  <Typography variant="body1" fontWeight="bold">support@eshub.com</Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="center" gap={2}>
                <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: 'success.light', color: 'white' }}>
                  <LocationOnIcon />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Headquarters</Typography>
                  <Typography variant="body1" fontWeight="bold">Tech Zone, Metroville, IN</Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Contact Form */}
        <Grid item xs={12} md={7}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>Send Message</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Leave us a note, and our admin team will reply within 24 hours.
            </Typography>

            {submitted && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Your message has been sent successfully. Thank you for writing!
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2.5}>
              <TextField
                required
                fullWidth
                label="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <TextField
                required
                fullWidth
                type="email"
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                required
                fullWidth
                multiline
                rows={4}
                label="How can we help you?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <Button type="submit" variant="contained" size="large" sx={{ py: 1.5 }}>
                Submit Message
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Contact;
