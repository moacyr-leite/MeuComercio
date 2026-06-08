const { SCHEMA } = require('./schema');
const { initializeDatabase, getDatabasePath } = require('./init');

module.exports = {
  SCHEMA,
  initializeDatabase,
  getDatabasePath,
};
