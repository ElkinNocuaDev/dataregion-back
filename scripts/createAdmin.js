require('dotenv').config();
const bcrypt = require('bcryptjs');
const { User, sequelize } = require('../models');

(async () => {
  try {
    await sequelize.authenticate();

    const name = 'Administrador';
    const email = 'admin@dataregion.com';
    const password = 'admin123'; // cámbialo luego
    const hashed = await bcrypt.hash(password, 10);

    const [admin, created] = await User.findOrCreate({
      where: { email },
      defaults: { name, email, password: hashed, role: 'admin' }
    });

    if (created) {
      console.log('✅ Usuario administrador creado correctamente');
    } else {
      console.log('⚠️ El usuario administrador ya existía');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error al crear admin:', err);
    process.exit(1);
  }
})();
