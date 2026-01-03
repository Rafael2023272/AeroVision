import fetch from 'node-fetch';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from './routes/user.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Test route to verify server is working
app.get('/api/test', (req, res) => {
  console.log('Test route hit!');
  res.json({ message: 'Server is working!' });
});

// Debug: Check if userRoutes is loaded
console.log('userRoutes loaded:', typeof userRoutes);

// Direct test route before mounting userRoutes
app.get('/api/users/test-direct', (req, res) => {
  console.log('Direct test route hit!');
  res.json({ message: 'Direct route works!' });
});

app.use('/api/users', userRoutes); // ✅ FIXED: Changed from '/api/user' to '/api/users'

// Another test after mounting
app.get('/test-after', (req, res) => {
  res.json({ message: 'After mount works!' });
});

console.log('Routes registered at /api/users');

// OpenSky Proxy (Live Aircraft Data) using OAuth2
app.get('/api/aircraft', async (req, res) => {
  try {
    console.log('Fetching OpenSky token...');
    
    // Step 1: Get access token with timeout
    const tokenController = new AbortController();
    const tokenTimeout = setTimeout(() => tokenController.abort(), 15000); // 15 second timeout

    const tokenResponse = await fetch(
      'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: process.env.OPENSKY_CLIENT_ID,
          client_secret: process.env.OPENSKY_CLIENT_SECRET
        }),
        signal: tokenController.signal
      }
    );

    clearTimeout(tokenTimeout);

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      console.error('OpenSky token error:', errText);
      return res.status(503).json({ 
        error: 'Failed to get access token',
        message: 'OpenSky authentication service is temporarily unavailable'
      });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    console.log('Token received, fetching aircraft data...');

    // Step 2: Fetch aircraft data with timeout
    const dataController = new AbortController();
    const dataTimeout = setTimeout(() => dataController.abort(), 15000);

    const response = await fetch('https://opensky-network.org/api/states/all', {
      headers: { 
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'AeroVision-App'
      },
      signal: dataController.signal
    });

    clearTimeout(dataTimeout);

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenSky API returned error:', response.status, errText);
      return res.status(response.status).json({ 
        error: 'OpenSky API error',
        message: 'Unable to fetch live aircraft data'
      });
    }

    const data = await response.json();
    console.log(`Successfully fetched ${data.states?.length || 0} aircraft`);
    res.json(data);

  } catch (err) {
    console.error('OpenSky fetch error:', err.message);

    // Handle timeout errors
    if (err.name === 'AbortError') {
      return res.status(504).json({ 
        error: 'Request timeout',
        message: 'OpenSky API is taking too long to respond. Please try again in a moment.'
      });
    }

    // Handle connection errors (ETIMEDOUT, ECONNREFUSED, etc)
    if (err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED' || err.message.includes('ETIMEDOUT')) {
      return res.status(503).json({ 
        error: 'Connection error',
        message: 'Cannot connect to OpenSky Network. Their servers may be temporarily unavailable. Please try again later.'
      });
    }

    res.status(500).json({ 
      error: 'Failed to fetch aircraft data',
      message: 'An unexpected error occurred'
    });
  }
});

// Alternative route without authentication (fallback option)
app.get('/api/aircraft/no-auth', async (req, res) => {
  try {
    console.log('Fetching aircraft data without authentication...');
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch('https://opensky-network.org/api/states/all', {
      headers: { 'User-Agent': 'AeroVision-App' },
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: 'OpenSky API error',
        message: 'Unable to fetch live aircraft data'
      });
    }

    const data = await response.json();
    console.log(`Successfully fetched ${data.states?.length || 0} aircraft (no-auth mode)`);
    res.json(data);

  } catch (err) {
    console.error('OpenSky no-auth error:', err.message);

    if (err.name === 'AbortError') {
      return res.status(504).json({ 
        error: 'Request timeout',
        message: 'Request timed out'
      });
    }

    res.status(503).json({ 
      error: 'Connection error',
      message: 'Cannot connect to OpenSky Network'
    });
  }
});


// ================================
// MongoDB Connection
// ================================
const dbURI = process.env.DB_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(dbURI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1);
  }
};

connectDB();

// ================================
// Start Server
// ================================
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});