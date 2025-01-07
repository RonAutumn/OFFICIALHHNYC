const Airtable = require('airtable');
require('dotenv').config();

const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.AIRTABLE_BASE_ID);

const TABLES = {
  PRODUCTS: 'Products',
  ORDERS: 'Orders',
  CATEGORIES: 'Categories',
  DELIVERY_FEES: 'Delivery_Fees',
  SETTINGS: 'Settings'
};

async function getAllRecords(tableName) {
  try {
    const records = await base(tableName).select().all();
    return records.map(record => ({
      id: record.id,
      ...record.fields
    }));
  } catch (error) {
    console.error(`Error fetching ${tableName}:`, error);
    throw error;
  }
}

async function getRecord(tableName, recordId) {
  try {
    const record = await base(tableName).find(recordId);
    return {
      id: record.id,
      ...record.fields
    };
  } catch (error) {
    console.error(`Error fetching ${tableName} record:`, error);
    throw error;
  }
}

async function createRecord(tableName, fields) {
  try {
    const records = await base(tableName).create([{ fields }]);
    return {
      id: records[0].id,
      ...records[0].fields
    };
  } catch (error) {
    console.error(`Error creating ${tableName} record:`, error);
    throw error;
  }
}

async function updateRecord(tableName, recordId, fields) {
  try {
    const records = await base(tableName).update([{
      id: recordId,
      fields
    }]);
    return {
      id: records[0].id,
      ...records[0].fields
    };
  } catch (error) {
    console.error(`Error updating ${tableName} record:`, error);
    throw error;
  }
}

async function deleteRecord(tableName, recordId) {
  try {
    const records = await base(tableName).destroy([recordId]);
    return {
      id: records[0].id,
      deleted: true
    };
  } catch (error) {
    console.error(`Error deleting ${tableName} record:`, error);
    throw error;
  }
}

module.exports = {
  base,
  TABLES,
  getAllRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord
}; 