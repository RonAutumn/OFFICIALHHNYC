const express = require('express');
const router = express.Router();
const Category = require('../../models/Category');
const Product = require('../../models/Product');
const Order = require('../../models/Order');
const Shipping = require('../../models/Shipping');
const DeliveryOrder = require('../../models/DeliveryOrder');
const ShippingOrder = require('../../models/ShippingOrder');

// Push Categories from Airtable to Admin
router.post('/categories', async (req, res) => {
  try {
    const categories = await Category.getAll();
    res.json({
      success: true,
      message: 'Categories synced successfully',
      data: categories
    });
  } catch (error) {
    console.error('Error syncing categories:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Push Products from Airtable to Admin
router.post('/products', async (req, res) => {
  try {
    const products = await Product.getAll();
    res.json({
      success: true,
      message: 'Products synced successfully',
      data: products
    });
  } catch (error) {
    console.error('Error syncing products:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Push Orders from Airtable to Admin
router.post('/orders', async (req, res) => {
  try {
    const orders = await Order.getAll();
    res.json({
      success: true,
      message: 'Orders synced successfully',
      data: orders
    });
  } catch (error) {
    console.error('Error syncing orders:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Push Delivery Orders from Airtable to Admin
router.post('/delivery-orders', async (req, res) => {
  try {
    const deliveryOrders = await DeliveryOrder.getAll();
    res.json({
      success: true,
      message: 'Delivery orders synced successfully',
      data: deliveryOrders
    });
  } catch (error) {
    console.error('Error syncing delivery orders:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Push Shipping Orders from Airtable to Admin
router.post('/shipping-orders', async (req, res) => {
  try {
    const shippingOrders = await ShippingOrder.getAll();
    res.json({
      success: true,
      message: 'Shipping orders synced successfully',
      data: shippingOrders
    });
  } catch (error) {
    console.error('Error syncing shipping orders:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
