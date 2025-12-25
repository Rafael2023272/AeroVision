import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

// Helper to get OAuth2 token
async function getOpenSkyToken() {
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', process.env.OPENSKY_CLIENT_ID);
  params.append('client_secret', process.env.OPENSKY_CLIENT_SECRET);

  const response = await fetch(
    'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    }
  );

  if (!response.ok) throw new Error('Failed to get OpenSky token');

  const data = await response.json();
  return data.access_token;
}

router.get('/', async (req, res) => {
  try {
    const token = await getOpenSkyToken();
    const response = await fetch('https://opensky-network.org/api/states/all', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('OpenSky API returned error:', response.status, text);
      return res.status(response.status).json({ error: 'OpenSky API error' });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch aircraft data' });
  }
});

export default router;
