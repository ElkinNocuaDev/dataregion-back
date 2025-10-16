const { Sequelize, DataTypes } = require('sequelize');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Ruta del certificado SSL descargado desde Aiven
const caPath = path.resolve(__dirname, '../ca.pem');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 16719, // asegúrate de incluir el puerto
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: true,
        ca: fs.existsSync(caPath) ? fs.readFileSync(caPath).toString() : undefined,
      },
    },
  }
);

// ---------------- MODELOS ----------------
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: DataTypes.STRING,
  email: { type: DataTypes.STRING, unique: true },
  password: DataTypes.STRING,
  role: { type: DataTypes.ENUM('admin','institution','user'), defaultValue: 'user' }
});

const Document = sequelize.define('Document', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: DataTypes.STRING,
  filename: DataTypes.STRING,
  originalname: DataTypes.STRING,
  description: DataTypes.TEXT,
  uploadedBy: DataTypes.INTEGER
});

const Rating = sequelize.define('Rating', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: DataTypes.INTEGER,
  documentId: DataTypes.INTEGER,
  score: { type: DataTypes.INTEGER, validate: { min: 1, max: 5 } }
});

// ---------------- RELACIONES ----------------
User.hasMany(Document, { foreignKey: 'uploadedBy' });
Document.belongsTo(User, { foreignKey: 'uploadedBy' });

Document.hasMany(Rating, { foreignKey: 'documentId' });
Rating.belongsTo(Document, { foreignKey: 'documentId' });

module.exports = { sequelize, User, Document, Rating };
