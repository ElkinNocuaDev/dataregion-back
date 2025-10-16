require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const { sequelize } = require('./models');

const app = express();
// app.use(cors());
// CORS configuration
const allowedOrigins = [
  'http://localhost:5173', // para desarrollo local (si usas Vite o React local)
  'https://dataregion-frontend.vercel.app', // tu dominio exacto de Vercel
];

app.use(cors({
  origin: function (origin, callback) {
    // Permite llamadas sin origen (ej. Postman o scripts internos)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS bloqueado para este origen: ' + origin));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());

// static uploads
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')));

// routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/admin', require('./routes/admin'));

const PORT = process.env.PORT || 4000;
sequelize.authenticate()
  .then(() => {
    console.log('DB ok');
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  })
  .catch(err => console.error('DB connection error:', err));
