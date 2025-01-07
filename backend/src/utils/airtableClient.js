const Airtable = require('airtable');
const TABLES = require('../constants/tables');

// Configure Airtable base
const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
}).base(process.env.AIRTABLE_BASE_ID);

// Helper function to get a table
const getTable = (tableName) => {
  if (!TABLES[tableName]) {
    throw new Error(`Invalid table name: ${tableName}`);
  }
  return base(TABLES[tableName]);
};

// Helper function to format record
const formatRecord = (record) => ({
  id: record.id,
  ...record.fields,
});

// Helper function to format multiple records
const formatRecords = (records) => records.map(formatRecord);

module.exports = {
  base,
  getTable,
  formatRecord,
  formatRecords,
};
