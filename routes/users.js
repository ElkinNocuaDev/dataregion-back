const express = require('express');
const router = express.Router();
const { User } = require('../models');

// Obtener todos los usuarios (solo para pruebas)
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo usuarios' });
  }
});

module.exports = router;
