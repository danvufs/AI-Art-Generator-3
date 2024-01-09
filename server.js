require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
// Include this to parse JSON bodies
app.use(express.json());
// Enable CORS for all routes
app.use(cors());

const proxy = createProxyMiddleware({
    target: 'https://api.openai.com',
    changeOrigin: true,
    pathRewrite: {
      '^/api': '/', 
    },
    timeout: 15000, 
  onProxyReq: (proxyReq, req) => {
    proxyReq.setHeader('Authorization', `Bearer ${process.env.OPENAI_API_KEY}`);
  },
});

// Handle OPTIONS requests for preflight
app.options('*', cors());
// Proxy endpoint
app.use('/api', proxy);

// Handles any requests that don't match the ones above
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/build/index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log(`Server listening on port ${port}`);
