const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// 1) 정적 파일 서빙
app.use(express.static(path.join(__dirname, 'public')));

// 2) SPA 라우팅 (나머지 모든 요청은 index.html로)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Frontend server listening at http://localhost:${port}`);
});