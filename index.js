const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.static('public'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));

const pagesRouter = require('./routes');
app.use('/', pagesRouter);

app.listen(port, () => {
    console.log(`Example app listening at http://127.0.0.1:${port}`);
});