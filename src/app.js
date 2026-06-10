const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const profileRoutes = require('./routes/profiles');
const errorHandler = require('./middleware/errorHandler');

const app = express();


app.use(cors());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, '..', 'public')));


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message:
        'Too many requests from this IP. Please try again after 15 minutes.',
    },
  },
});
app.use(limiter);


const startTime = Date.now();

app.get('/health', (_req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const hours = Math.floor(uptimeSeconds / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = uptimeSeconds % 60;

  let uptime = '';
  if (hours > 0) uptime += `${hours}h `;
  if (minutes > 0) uptime += `${minutes}m `;
  uptime += `${seconds}s`;

  res.status(200).json({
    success: true,
    status: 'online',
    timestamp: new Date().toISOString(),
    uptime: uptime.trim(),
  });
});


app.get('/api/health', (_req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  res.status(200).json({ success: true, status: 'online', uptime: `${uptimeSeconds}s` });
});


app.use('/api/profiles', profileRoutes);


app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'The requested endpoint does not exist.',
    },
  });
});


app.use(errorHandler);

module.exports = app;
