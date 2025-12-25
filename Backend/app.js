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
app.use('/api/user', userRoutes);

// OpenSky Proxy (Live Aircraft Data) using OAuth2
app.get('/api/aircraft', async (req, res) => {
  try {
    // Step 1: Get access token
    const tokenResponse = await fetch(
      'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: process.env.OPENSKY_CLIENT_ID,
          client_secret: process.env.OPENSKY_CLIENT_SECRET
        })
      }
    );

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      console.error('OpenSky token error:', errText);
      return res.status(tokenResponse.status).json({ error: 'Failed to get access token' });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Step 2: Fetch aircraft data
    const response = await fetch('https://opensky-network.org/api/states/all', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenSky API returned error:', response.status, errText);
      return res.status(response.status).json({ error: 'OpenSky API error' });
    }

    const data = await response.json();
    res.json(data);

  } catch (err) {
    console.error('OpenSky fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch aircraft data' });
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
