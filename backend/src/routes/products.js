const express = require('express');
const router = express.Router();
const { TABLES, getAllRecords, getRecord, createRecord, updateRecord, deleteRecord } = require('../services/airtable');

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let products = await getAllRecords(TABLES.PRODUCTS);
    
    if (category) {
      products = products.filter(product => product.Category === category);
    }

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await getRecord(TABLES.PRODUCTS, req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Search products
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const products = await getAllRecords(TABLES.PRODUCTS);
    const searchResults = products.filter(product => 
      product.Name.toLowerCase().includes(q.toLowerCase()) ||
      product.Description?.toLowerCase().includes(q.toLowerCase())
    );

    res.json(searchResults);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ error: 'Failed to search products' });
  }
});

// Create product
router.post('/', async (req, res) => {
  try {
    const product = await createRecord(TABLES.PRODUCTS, req.body);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const product = await updateRecord(TABLES.PRODUCTS, req.params.id, req.body);
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    await deleteRecord(TABLES.PRODUCTS, req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;
