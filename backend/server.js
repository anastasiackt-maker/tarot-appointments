const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();

const appointmentsRoutes = require('./routes/appointments');
const adminRoutes = require('./routes/admin');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Статика (frontend)
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// API
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/admin', adminRoutes);

// Главная страница
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
