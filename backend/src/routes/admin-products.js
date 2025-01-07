const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get all products
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all products for admin...');
    const products = await Product.getAll();
    console.log('Fetched products:', products.length);
    res.json({ products });
  } catch (error) {
    console.error('Error in GET /api/admin/products:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new product
router.post('/', async (req, res) => {
  try {
    console.log('Creating new product:', req.body);
    const product = await Product.create(req.body);
    console.log('Created product:', product);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error in POST /api/admin/products:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update a product
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Updating product:', id, req.body);
    const product = await Product.update(id, req.body);
    console.log('Updated product:', product);
    res.json(product);
  } catch (error) {
    console.error('Error in PUT /api/admin/products/:id:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a product
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Deleting product:', id);
    await Product.delete(id);
    console.log('Product deleted successfully');
    res.status(204).end();
  } catch (error) {
    console.error('Error in DELETE /api/admin/products/:id:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
