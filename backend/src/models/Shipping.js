const base = require('../config/airtable');

const ORDERS_TABLE = 'Order Details';
const SETTINGS_TABLE = 'Settings';

const Shipping = {
  // Get all shipping orders
  getAll: async () => {
    try {
      const records = await base(ORDERS_TABLE)
        .select({
          filterByFormula: "{Type} = 'shipping'"
        })
        .all();
      
      return records.map(record => ({
        id: record.id,
        orderId: record.fields['Order ID'],
        customerName: record.fields['Customer Name'],
        email: record.fields.Email,
        phone: record.fields.Phone,
        shippingAddress: record.fields.shippingAddress,
        shippingCity: record.fields.shippingCity,
        shippingState: record.fields.shippingState,
        shippingZipCode: record.fields.shippingZipCode,
        shippingFee: parseFloat(record.fields['Shipping Fee']) || 0,
        status: record.fields.Status,
        items: record.fields.Items,
        total: parseFloat(record.fields.Total) || 0,
        timestamp: record.fields.Timestamp
      }));
    } catch (error) {
      console.error('Error in getAll shipping:', error);
      throw error;
    }
  },

  // Get shipping order by ID
  getById: async (id) => {
    try {
      const record = await base(ORDERS_TABLE).find(id);
      return {
        id: record.id,
        orderId: record.fields['Order ID'],
        customerName: record.fields['Customer Name'],
        email: record.fields.Email,
        phone: record.fields.Phone,
        shippingAddress: record.fields.shippingAddress,
        shippingCity: record.fields.shippingCity,
        shippingState: record.fields.shippingState,
        shippingZipCode: record.fields.shippingZipCode,
        shippingFee: parseFloat(record.fields['Shipping Fee']) || 0,
        status: record.fields.Status,
        items: record.fields.Items,
        total: parseFloat(record.fields.Total) || 0,
        timestamp: record.fields.Timestamp
      };
    } catch (error) {
      console.error('Error in getById shipping:', error);
      throw error;
    }
  },

  // Create new shipping order
  create: async (orderData) => {
    try {
      const record = await base(ORDERS_TABLE).create([
        {
          fields: {
            'Order ID': orderData.orderId,
            'Customer Name': orderData.customerName,
            Email: orderData.email,
            Phone: orderData.phone,
            Items: orderData.items,
            'Payment Method': orderData.paymentMethod,
            Timestamp: orderData.timestamp || new Date().toISOString(),
            Total: orderData.total,
            Type: 'shipping',
            shippingAddress: orderData.shippingAddress,
            shippingCity: orderData.shippingCity,
            shippingState: orderData.shippingState,
            shippingZipCode: orderData.shippingZipCode,
            'Shipping Fee': orderData.shippingFee,
            Status: orderData.status || 'pending'
          }
        }
      ]);
      return record[0];
    } catch (error) {
      console.error('Error creating shipping order:', error);
      throw error;
    }
  },

  // Update shipping order status
  updateStatus: async (id, status) => {
    try {
      const record = await base(ORDERS_TABLE).update([
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
  },

  // Get shipping settings
  getSettings: async () => {
    try {
      const records = await base(SETTINGS_TABLE)
        .select({
          filterByFormula: "{borough} = 'Shipping Fee'"
        })
        .all();

      if (!records || records.length === 0) {
        return {
          shippingFee: 25,
          freeShippingMinimum: 150
        };
      }

      const settings = records[0].fields;
      return {
        shippingFee: parseFloat(settings.deliveryFee) || 25,
        freeShippingMinimum: parseFloat(settings.freeDeliveryMinimum) || 150
      };
    } catch (error) {
      console.error('Error getting shipping settings:', error);
      throw error;
    }
  },

  // Calculate shipping fee
  calculateFee: async (subtotal) => {
    try {
      const settings = await Shipping.getSettings();
      return subtotal >= settings.freeShippingMinimum ? 0 : settings.shippingFee;
    } catch (error) {
      console.error('Error calculating shipping fee:', error);
      throw error;
    }
  }
};

module.exports = Shipping;
