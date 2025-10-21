const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use('/node_modules', express.static(__dirname + '/node_modules'));

app.get('/')

const pagesRouter = require('./routes');
app.use('/', pagesRouter);

app.listen(port, () => {
    console.log(`Example app listening at http://127.0.0.1:${port}`);
});