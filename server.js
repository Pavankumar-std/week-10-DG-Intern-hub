// ---------------------------------------------------------------
// server.js - starting point of the backend. Run:  npm start
// ---------------------------------------------------------------
const fs = require('fs');
const path = require('path');

// Tiny .env reader (so you don't need the "dotenv" package)
const envFile = path.join(__dirname, '.env');
if (fs.existsSync(envFile)) {
  fs.readFileSync(envFile, 'utf8').split('\n').forEach((line) => {
    const [key, ...rest] = line.split('=');
    if (key && !key.startsWith('#') && rest.length) process.env[key.trim()] = rest.join('=').trim();
  });
}

const express = require('express');
const cors = require('cors');
const { load } = require('./db');
const seed = require('./seed');
const routes = require('./routes');

// Load the JSON "database". If it doesn't exist yet, create demo data.
if (!load()) seed();

const app = express();
app.use(cors());            // allow the React app to call this API
app.use(express.json());    // read JSON from request bodies

app.get('/', (req, res) => res.json({ message: 'Job Portal API is running 🚀' }));
app.use('/api', routes);

// Unknown URL
app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));

// Any unexpected crash ends up here
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ API running at http://localhost:${PORT}`));
