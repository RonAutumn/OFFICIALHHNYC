const base = require('../config/airtable');

const TABLE_NAME = 'Order Details';

const Shipping = {
  getAll: async () => {
    try {
      const records = await base(TABLE_NAME).select().all();
      return records.map(record => ({
        id: record.id,
        orderId: record.fields.OrderID,
        customerName: record.fields.CustomerName,
        email: record.fields.Email,
        phone: record.fields.Phone,
        address: record.fields.Address,
        city: record.fields.City,
        state: record.fields.State,
        zipCode: record.fields.ZipCode,
        shippingMethod: record.fields['Shipping Method'],
        shippingFee: parseFloat(record.fields['Shipping Fee']) || 0,
        status: record.fields.Status,
        notes: record.fields.Notes
      }));
    } catch (error) {
      console.error('Error in getAll shipping:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const record = await base(TABLE_NAME).find(id);
      return {
        id: record.id,
        orderId: record.fields.OrderID,
        customerName: record.fields.CustomerName,
        email: record.fields.Email,
        phone: record.fields.Phone,
        address: record.fields.Address,
        city: record.fields.City,
        state: record.fields.State,
        zipCode: record.fields.ZipCode,
        shippingMethod: record.fields['Shipping Method'],
        shippingFee: parseFloat(record.fields['Shipping Fee']) || 0,
        status: record.fields.Status,
        notes: record.fields.Notes
      };
    } catch (error) {
      console.error('Error in getById shipping:', error);
      throw error;
    }
  },

  create: async (shippingData) => {
    try {
      const record = await base(TABLE_NAME).create([
        {
          fields: {
            OrderID: shippingData.orderId,
            CustomerName: shippingData.customerName,
            Email: shippingData.email,
            Phone: shippingData.phone,
            Address: shippingData.address,
            City: shippingData.city,
            State: shippingData.state,
            ZipCode: shippingData.zipCode,
            'Shipping Method': shippingData.shippingMethod,
            'Shipping Fee': shippingData.shippingFee,
            Status: 'Pending',
            Notes: shippingData.notes || ''
          }
        }
      ]);
      return record[0];
    } catch (error) {
      console.error('Error creating shipping:', error);
      throw error;
    }
  },

  updateStatus: async (id, status) => {
    try {
      const record = await base(TABLE_NAME).update([
        {
          id: id,
          fields: {
            Status: status
          }
        }
      ]);
      return record[0];
    } catch (error) {
      console.error('Error updating shipping status:', error);
      throw error;
    }
  }
};

module.exports = Shipping;
