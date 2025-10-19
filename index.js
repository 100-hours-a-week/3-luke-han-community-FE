const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/pages/login.html'));
});

app.listen(port, () => {
    console.log(`Example app listening at http://127.0.0.1:${port}`);
});