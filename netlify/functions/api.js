require('dotenv').config({ path: '../../.env' }); // Важно для локальной работы
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const path = require('path');

const app = express();
const router = express.Router();

// Middleware
app.use(cors());
app.use(express.json());

// Переносим пути из старого server.js
const appointmentRoutes = require('../../backend/routes/appointments');
const adminRoutes = require('../../backend/routes/admin');

// API роуты
router.use('/appointments', appointmentRoutes);
router.use('/admin', adminRoutes);

// Netlify требует, чтобы все роуты были под одним префиксом, который совпадает с именем файла
app.use('/.netlify/functions/api', router); 

// Статические файлы (для локальной разработки)
if (process.env.NODE_ENV !== 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend')));
  app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/admin.html'));
  });
}

// Экспортируем handler для Netlify
module.exports.handler = serverless(app);
