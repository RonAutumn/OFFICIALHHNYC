const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const DeliveryOrder = require('../models/DeliveryOrder');
const ShippingOrder = require('../models/ShippingOrder');

// Get admin dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const [orders, deliveryOrders, shippingOrders] = await Promise.all([
      Order.getAll(),
      DeliveryOrder.getAll(),
      ShippingOrder.getAll()
    ]);

    const stats = {
      totalOrders: orders.length,
      totalDeliveryOrders: deliveryOrders.length,
      totalShippingOrders: shippingOrders.length,
      recentOrders: orders.slice(-5),
      recentDeliveryOrders: deliveryOrders.slice(-5),
      recentShippingOrders: shippingOrders.slice(-5)
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get order analytics
router.get('/analytics/orders', async (req, res) => {
  try {
    const [orders, deliveryOrders, shippingOrders] = await Promise.all([
      Order.getAll(),
      DeliveryOrder.getAll(),
      ShippingOrder.getAll()
    ]);

    const analytics = {
      ordersByStatus: {
        pending: orders.filter(o => o.status === 'pending').length,
        processing: orders.filter(o => o.status === 'processing').length,
        completed: orders.filter(o => o.status === 'completed').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length
      },
      deliveryOrdersByStatus: {
        pending: deliveryOrders.filter(o => o.status === 'pending').length,
        outForDelivery: deliveryOrders.filter(o => o.status === 'out_for_delivery').length,
        delivered: deliveryOrders.filter(o => o.status === 'delivered').length,
        cancelled: deliveryOrders.filter(o => o.status === 'cancelled').length
      },
      shippingOrdersByStatus: {
        pending: shippingOrders.filter(o => o.status === 'pending').length,
        processing: shippingOrders.filter(o => o.status === 'processing').length,
        shipped: shippingOrders.filter(o => o.status === 'shipped').length,
        delivered: shippingOrders.filter(o => o.status === 'delivered').length,
        cancelled: shippingOrders.filter(o => o.status === 'cancelled').length
      }
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error getting order analytics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get revenue analytics
router.get('/analytics/revenue', async (req, res) => {
  try {
    const [orders, deliveryOrders, shippingOrders] = await Promise.all([
      Order.getAll(),
      DeliveryOrder.getAll(),
      ShippingOrder.getAll()
    ]);

    const calculateTotal = (orders) => {
      return orders.reduce((total, order) => {
        const itemsTotal = order.items.reduce((sum, item) => {
          return sum + (item.price * item.quantity);
        }, 0);
        return total + itemsTotal;
      }, 0);
    };

    const analytics = {
      totalRevenue: {
        orders: calculateTotal(orders),
        deliveryOrders: calculateTotal(deliveryOrders),
        shippingOrders: calculateTotal(shippingOrders)
      },
      averageOrderValue: {
        orders: orders.length ? calculateTotal(orders) / orders.length : 0,
        deliveryOrders: deliveryOrders.length ? calculateTotal(deliveryOrders) / deliveryOrders.length : 0,
        shippingOrders: shippingOrders.length ? calculateTotal(shippingOrders) / shippingOrders.length : 0
      }
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error getting revenue analytics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
