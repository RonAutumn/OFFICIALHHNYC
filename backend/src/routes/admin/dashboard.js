const express = require('express');
const router = express.Router();
const { getAirtableBase } = require('../../config/airtable');

const base = getAirtableBase();
const ORDERS_TABLE = 'Orders';
const PRODUCTS_TABLE = 'Products';

router.get('/', async (req, res) => {
  try {
    // Fetch recent orders
    const ordersResponse = await base(ORDERS_TABLE)
      .select({
        sort: [{ field: 'Timestamp', direction: 'desc' }],
        maxRecords: 100
      })
      .all();

    const recentOrders = ordersResponse.map(record => ({
      id: record.id,
      orderId: record.get('Order ID'),
      customerName: record.get('Customer Name'),
      status: record.get('Status') || 'pending',
      total: record.get('Total'),
      items: record.get('Items'),
      timestamp: record.get('Timestamp'),
      phone: record.get('Phone'),
      address: record.get('address'),
      type: record.get('Type'),
      paymentMethod: record.get('Payment Method')
    }));

    // Fetch products
    const productsResponse = await base(PRODUCTS_TABLE)
      .select({
        filterByFormula: "{Status} = 'active'"
      })
      .all();

    const products = productsResponse.map(record => ({
      id: record.id,
      name: record.get('Name'),
      category: record.get('Category'),
      price: record.get('Price'),
      description: record.get('Description'),
      stock: record.get('Stock'),
      image: record.get('Image URL'),
      weight: record.get('Weight/Size')
    }));

    // Get unique categories
    const categories = [...new Set(products.map(product => product.category))];

    res.json({
      recentOrders,
      products,
      categories
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch dashboard data'
    });
  }
});

module.exports = router;
