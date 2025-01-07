const base = require('../config/airtable');

const TABLE_NAME = 'Shipping fees';

const ShippingFee = {
  // Get all shipping fees
  getAll: async () => {
    try {
      console.log('ShippingFee.getAll - Starting...');
      
      const records = await base(TABLE_NAME).select({
        fields: ['Standard', 'Express', 'Fee']
      }).all();
      
      console.log('ShippingFee.getAll - Records fetched:', records.length);
      
      if (!records || records.length === 0) {
        console.log('ShippingFee.getAll - No records found');
        return [];
      }
      
      const shippingFees = records.map(record => ({
        id: record.id,
        standard: record.fields.Standard || '',
        express: record.fields.Express || '',
        fee: parseFloat(record.fields.Fee) || 0
      }));
      
      console.log('ShippingFee.getAll - Processed shipping fees:', shippingFees.length);
      return shippingFees;
    } catch (error) {
      console.error('Error in getAll shipping fees:', error);
      throw error;
    }
  },

  // Calculate shipping fee
  calculateFee: async (method = 'standard') => {
    try {
      console.log('ShippingFee.calculateFee - Starting...', { method });
      
      // Default fees
      const defaultFees = {
        standard: 5.00,
        express: 15.00
      };
      
      return {
        method,
        fee: method === 'express' ? defaultFees.express : defaultFees.standard
      };
    } catch (error) {
      console.error('Error calculating shipping fee:', error);
      throw error;
    }
  }
};

module.exports = ShippingFee;
