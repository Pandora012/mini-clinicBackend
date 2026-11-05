const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/sequelize');

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map(url => url.trim()) : ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const doctorRoutes = require('./routes/doctors');
const clinicRoutes = require('./routes/clinics');
const registrationRoutes = require('./routes/registrations');
const queueRoutes = require('./routes/queues');
const examinationRoutes = require('./routes/examinations');
const dashboardRoutes = require('./routes/dashboard');

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/queues', queueRoutes);
app.use('/api/examinations', examinationRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Mini Clinic API is running'
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Permintaan gagal diproses. Silakan coba lagi.'
  });
});

module.exports = app;
