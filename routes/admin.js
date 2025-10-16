const express = require('express');
const router = express.Router();
const { auth, permit } = require('../middleware/auth');
const bcrypt = require('bcrypt');
const { User } = require('../models');

router.post('/create-institution', auth, permit('admin'), async (req,res) => {
  const { name, email, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const inst = await User.create({ name, email, password: hash, role: 'institution' });
    res.json({ success:true, institution: { id: inst.id, email: inst.email }});
  } catch (err) {
    res.status(400).json({ success:false, message: err.message });
  }
});

module.exports = router;
