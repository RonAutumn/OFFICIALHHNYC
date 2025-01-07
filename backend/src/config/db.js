const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize('heavenly_bites', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Test database connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

// Initialize database
async function initializeDatabase() {
  try {
    // Import models
    require('./models/Product');
    require('./models/Order');
    require('./models/Customer');

    // Sync all models
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

module.exports = {
  sequelize,
  testConnection,
  initializeDatabase
};
