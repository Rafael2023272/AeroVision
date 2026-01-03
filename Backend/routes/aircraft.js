import express from 'express';
import fetch from 'node-fetch';
import AbortController from 'abort-controller';

const router = express.Router();

// Helper to get OAuth2 token with timeout
async function getOpenSkyToken() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout

  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', process.env.OPENSKY_CLIENT_ID);
    params.append('client_secret', process.env.OPENSKY_CLIENT_SECRET);

    const response = await fetch(
      'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
        signal: controller.signal
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get OpenSky token: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.access_token;

  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

// Main route to get aircraft data
router.get('/', async (req, res) => {
  try {
    console.log('Fetching OpenSky token...');
    const token = await getOpenSkyToken();
    console.log('Token received, fetching aircraft data...');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const response = await fetch('https://opensky-network.org/api/states/all', {
      headers: { 
        Authorization: `Bearer ${token}`,
        'User-Agent': 'AeroVision-App'
      },
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const text = await response.text();
      console.error('OpenSky API returned error:', response.status, text);
      return res.status(response.status).json({ 
        error: 'OpenSky API error',
        message: 'Unable to fetch live aircraft data',
        status: response.status
      });
    }

    const data = await response.json();
    console.log(`Successfully fetched ${data.states?.length || 0} aircraft`);
    res.json(data);

  } catch (err) {
    console.error('OpenSky fetch error:', err.message);

    // Handle specific error types
    if (err.name === 'AbortError') {
      return res.status(504).json({ 
        error: 'Request timeout',
        message: 'OpenSky API is taking too long to respond. Please try again in a moment.'
      });
    }

    if (err.message.includes('ETIMEDOUT') || err.message.includes('ECONNREFUSED')) {
      return res.status(503).json({ 
        error: 'Connection error',
        message: 'Cannot connect to OpenSky Network. Their servers may be temporarily unavailable.'
      });
    }

    res.status(500).json({ 
      error: 'Failed to fetch aircraft data',
      message: 'An unexpected error occurred. Please try again later.'
    });
  }
});

// Alternative route without authentication (lower rate limits)
router.get('/no-auth', async (req, res) => {
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
    console.log(`Successfully fetched ${data.states?.length || 0} aircraft (no-auth)`);
    res.json(data);

  } catch (err) {
    console.error('OpenSky no-auth error:', err.message);

    if (err.name === 'AbortError') {
      return res.status(504).json({ 
        error: 'Request timeout',
        message: 'Request timed out. Please try again.'
      });
    }

    res.status(503).json({ 
      error: 'Connection error',
      message: 'Cannot connect to OpenSky Network.'
    });
  }
});

export default router;
