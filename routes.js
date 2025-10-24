const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, './public/pages/login/login.html'));
});

router.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, './public/pages/signup/signup.html'));
});

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './public/pages/home/home.html'));
});

router.get('/post/create', (req, res) => {
  res.sendFile(path.join(__dirname, './public/pages/post/post_edit.html'));
});

router.get('/post/:id/edit', (req, res) => {
  res.sendFile(path.join(__dirname, './public/pages/post/post_edit.html'));
});

router.get('/post/:id', (req, res) => {
  res.sendFile(path.join(__dirname, './public/pages/post/post_detail.html'));
});

module.exports = router;
