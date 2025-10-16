require('dotenv').config(); // antes de importar models
const { sequelize } = require('../models');

sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ DB synced successfully');
    process.exit(0);
  })
  .catch(e => {
    console.error('❌ Database sync failed:', e);
    process.exit(1);
  });
