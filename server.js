const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(
    '/api',
    createProxyMiddleware({
        target: process.env.API_SERVER_URL || 'http://localhost:8080',
        changeOrigin: true,
    })
);

app.get('/');

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});