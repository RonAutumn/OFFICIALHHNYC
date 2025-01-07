const { getAirtableBase } = require('../config/airtable');
const Category = require('./Category');
const fs = require('fs');
const path = require('path');

// Use the exact table name from Airtable
const TABLE_NAME = 'Products';
const base = getAirtableBase();

const Product = {
  // Save data to local JSON file for testing
  saveToLocal: async (data, filename) => {
    try {
      const filePath = path.join(__dirname, '..', 'data', filename);
      await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
      console.log(`Data saved to ${filePath}`);
    } catch (error) {
      console.error('Error saving data to local file:', error);
      throw error;
    }
  },

  // Test Airtable data integrity
  testDataIntegrity: async () => {
    try {
      console.log('Product.testDataIntegrity - Starting...');
      
      const products = await Product.getAll();
      
      const results = {
        totalProducts: products.length,
        missingFields: {
          name: 0,
          category: 0,
          price: 0,
          description: 0,
          image: 0,
          stock: 0
        },
        invalidPrices: 0,
        invalidStocks: 0
      };

      products.forEach(product => {
        if (!product.name) results.missingFields.name++;
        if (!product.category) results.missingFields.category++;
        if (!product.price || product.price <= 0) results.invalidPrices++;
        if (!product.description) results.missingFields.description++;
        if (!product.image) results.missingFields.image++;
        if (!product.stock || product.stock < 0) results.invalidStocks++;
      });

      console.log('Product.testDataIntegrity - Results:', results);
      return results;
    } catch (error) {
      console.error('Error testing data integrity:', error);
      throw error;
    }
  },

  // Get all products
  getAll: async (saveToFile = false) => {
    try {
      console.log('Product.getAll - Starting...');
      
      // Validate Airtable configuration
      if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
        throw new Error('Airtable configuration is missing. Please check your .env file.');
      }
      
      console.log('Product.getAll - Fetching records from table:', TABLE_NAME);
      
      const records = await base(TABLE_NAME).select({
        fields: [
          'ID',               // Product ID
          'Name',            // Product name
          'Description',     // Product description
          'Category',        // Category name
          'Price',          // Price in number
          'Weight/Size',     // Weight/Size value
          'Variations',      // JSON string of variations
          'Stock',          // Stock quantity
          'Image URL',       // Image URL
          'Status'          // Product status
        ]
      }).all();
      
      console.log('Product.getAll - Records fetched:', records.length);
      
      if (!records || records.length === 0) {
        console.log('Product.getAll - No records found');
        return [];
      }
      
      // Log the first record for debugging
      if (records[0]) {
        console.log('Product.getAll - Sample record fields:', Object.keys(records[0].fields));
      }
      
      const products = records.map(record => {
        // Parse variations from JSON string if it's a string, otherwise use as is
        let variations = record.fields.Variations || [];
        if (typeof variations === 'string') {
          try {
            variations = JSON.parse(variations);
          } catch (error) {
            console.error('Error parsing variations:', error);
            variations = [];
          }
        }

        // Transform to match frontend Product type
        const product = {
          id: record.id,
          name: record.fields.Name || '',
          category: record.fields.Category || '',
          price: parseFloat(record.fields.Price) || 0,
          description: record.fields.Description || '',
          image: record.fields['Image URL'] || '',
          stock: parseInt(record.fields.Stock) || 100,
          variations: Array.isArray(variations) ? variations : [],
          displayOptions: {
            showFlavors: variations.length > 0,
            showWeight: parseFloat(record.fields['Weight/Size']) > 0
          }
        };

        // Validate required fields
        if (!product.name || !product.category) {
          console.error('Invalid product data:', product);
          throw new Error('Product is missing required fields: name and category are required');
        }
        if (product.price < 0) {
          console.error('Invalid product price:', product);
          throw new Error('Product price cannot be negative');
        }
        
        console.log('Product.getAll - Processed product:', product.name);
        return product;
      });
      
      console.log('Product.getAll - Total products processed:', products.length);
      
      // Optionally save data to local JSON file
      if (saveToFile) {
        await Product.saveToLocal(products, 'products.json');
      }
      
      return products;
      
    } catch (error) {
      console.error('Error in getAll products:', error);
      console.error('Error details:', error.message);
      if (error.error) {
        console.error('Airtable error:', error.error);
      }
      throw error;
    }
  },

  // Get products by category
  getByCategory: async (categoryId) => {
    try {
      console.log('Product.getByCategory - Starting...');
      
      // Validate Airtable configuration
      if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
        throw new Error('Airtable configuration is missing. Please check your .env file.');
      }
      
      console.log('Product.getByCategory - Fetching records from table:', TABLE_NAME);
      
      const records = await base(TABLE_NAME).select({
        fields: [
          'ID',               // Product ID
          'Name',            // Product name
          'Description',     // Product description
          'Category',        // Category name
          'Price',          // Price in number
          'Weight/Size',     // Weight/Size value
          'Variations',      // JSON string of variations
          'Stock',          // Stock quantity
          'Image URL',       // Image URL
          'Status'          // Product status
        ],
        filterByFormula: `{Category} = '${categoryId}'`
      }).all();
      
      console.log('Product.getByCategory - Records fetched:', records.length);
      
      if (!records || records.length === 0) {
        console.log('Product.getByCategory - No records found');
        return [];
      }
      
      const products = records.map(record => {
        // Parse variations from JSON string
        let variations = [];
        try {
          variations = JSON.parse(record.fields.Variations || '[]');
        } catch (error) {
          console.error('Error parsing variations:', error);
        }

        // Transform to match frontend Product type
        const product = {
          id: record.id,
          name: record.fields.Name || '',
          category: record.fields.Category || '',
          price: parseFloat(record.fields.Price) || 0,
          description: record.fields.Description || '',
          image: record.fields['Image URL'] || '',
          stock: parseInt(record.fields.Stock) || 100,
          variations: Array.isArray(variations) ? variations : [],
          displayOptions: {
            showFlavors: variations.length > 0,
            showWeight: parseFloat(record.fields['Weight/Size']) > 0
          }
        };

        // Validate required fields
        if (!product.name || !product.category) {
          console.error('Invalid product data:', product);
          throw new Error('Product is missing required fields: name and category are required');
        }
        if (product.price < 0) {
          console.error('Invalid product price:', product);
          throw new Error('Product price cannot be negative');
        }
        
        console.log('Product.getByCategory - Processed product:', product.name);
        return product;
      });
      
      console.log('Product.getByCategory - Total products processed:', products.length);
      return products;
    } catch (error) {
      console.error('Error in getByCategory products:', error);
      console.error('Error details:', error.message);
      if (error.error) {
        console.error('Airtable error:', error.error);
      }
      throw error;
    }
  },

  // Get a single product
  getById: async (id) => {
    try {
      console.log('Product.getById - Starting...');
      
      // Validate Airtable configuration
      if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
        throw new Error('Airtable configuration is missing. Please check your .env file.');
      }
      
      console.log('Product.getById - Fetching record from table:', TABLE_NAME);
      
      const record = await base(TABLE_NAME).find(id);
      
      if (!record) {
        console.log('Product.getById - No record found');
        return null;
      }
      
      console.log('Product.getById - Record fetched:', record.id);
      
      // Parse variations from JSON string
      let variations = [];
      try {
        variations = JSON.parse(record.fields.Variations || '[]');
      } catch (error) {
        console.error('Error parsing variations:', error);
      }

      // Transform to match frontend Product type
      const product = {
        id: record.id,
        name: record.fields.Name || '',
        category: record.fields.Category || '',
        price: parseFloat(record.fields.Price) || 0,
        description: record.fields.Description || '',
        image: record.fields['Image URL'] || '',
        stock: parseInt(record.fields.Stock) || 100,
        variations: Array.isArray(variations) ? variations : [],
        displayOptions: {
          showFlavors: variations.length > 0,
          showWeight: parseFloat(record.fields['Weight/Size']) > 0
        }
      };

        // Validate required fields
        if (!product.name || !product.category) {
          console.error('Invalid product data:', product);
          throw new Error('Product is missing required fields: name and category are required');
        }
        if (product.price < 0) {
          console.error('Invalid product price:', product);
          throw new Error('Product price cannot be negative');
        }
      
      console.log('Product.getById - Processed product:', product.name);
      return product;
      
    } catch (error) {
      console.error('Error in getById product:', error);
      console.error('Error details:', error.message);
      if (error.error) {
        console.error('Airtable error:', error.error);
      }
      throw error;
    }
  },

  // Create a new product
  create: async (productData) => {
    try {
      console.log('Product.create - Starting...');
      
      // Validate Airtable configuration
      if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
        throw new Error('Airtable configuration is missing. Please check your .env file.');
      }
      
      console.log('Product.create - Creating record in table:', TABLE_NAME);
      
      const record = await base(TABLE_NAME).create([
        {
          fields: {
            'ID': productData.airtableId,
            'Name': productData.name,
            'Description': productData.description,
            'Category': productData.category,
            'Price': productData.price,
            'Weight/Size': productData.weightSize,
            'Variations': productData.variations,
            'Stock': productData.stock,
            'Image URL': productData.imageUrl,
            'Status': productData.status || 'active'
          }
        }
      ]);
      
      console.log('Product.create - Record created:', record[0].id);
      
      const product = {
        id: record[0].id,
        airtableId: record[0].fields.ID || '',
        name: record[0].fields.Name || '',
        description: record[0].fields.Description || '',
        category: record[0].fields.Category || '',
        price: parseFloat(record[0].fields.Price) || 0,
        weightSize: parseFloat(record[0].fields['Weight/Size']) || 0,
        variations: record[0].fields.Variations || '',
        stock: parseInt(record[0].fields.Stock) || 100,
        imageUrl: record[0].fields['Image URL'] || '',
        status: record[0].fields.Status || 'active'
      };
      
      console.log('Product.create - Processed product:', product.name);
      return product;
      
    } catch (error) {
      console.error('Error in create product:', error);
      console.error('Error details:', error.message);
      if (error.error) {
        console.error('Airtable error:', error.error);
      }
      throw error;
    }
  },

  // Update a product
  update: async (id, productData) => {
    try {
      console.log('Product.update - Starting...');
      
      // Validate Airtable configuration
      if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
        throw new Error('Airtable configuration is missing. Please check your .env file.');
      }
      
      console.log('Product.update - Updating record in table:', TABLE_NAME);
      
      const record = await base(TABLE_NAME).update([
        {
          id: id,
          fields: {
            'ID': productData.airtableId,
            'Name': productData.name,
            'Description': productData.description,
            'Category': productData.category,
            'Price': productData.price,
            'Weight/Size': productData.weightSize,
            'Variations': productData.variations,
            'Stock': productData.stock,
            'Image URL': productData.imageUrl,
            'Status': productData.status
          }
        }
      ]);
      
      console.log('Product.update - Record updated:', record[0].id);
      
      const product = {
        id: record[0].id,
        airtableId: record[0].fields.ID || '',
        name: record[0].fields.Name || '',
        description: record[0].fields.Description || '',
        category: record[0].fields.Category || '',
        price: parseFloat(record[0].fields.Price) || 0,
        weightSize: parseFloat(record[0].fields['Weight/Size']) || 0,
        variations: record[0].fields.Variations || '',
        stock: parseInt(record[0].fields.Stock) || 100,
        imageUrl: record[0].fields['Image URL'] || '',
        status: record[0].fields.Status || 'active'
      };
      
      console.log('Product.update - Processed product:', product.name);
      return product;
      
    } catch (error) {
      console.error('Error in update product:', error);
      console.error('Error details:', error.message);
      if (error.error) {
        console.error('Airtable error:', error.error);
      }
      throw error;
    }
  },

  // Delete a product
  delete: async (id) => {
    try {
      console.log('Product.delete - Starting...');
      
      // Validate Airtable configuration
      if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
        throw new Error('Airtable configuration is missing. Please check your .env file.');
      }
      
      console.log('Product.delete - Deleting record from table:', TABLE_NAME);
      
      await base(TABLE_NAME).destroy([id]);
      
      console.log('Product.delete - Record deleted:', id);
      return { id };
      
    } catch (error) {
      console.error('Error in delete product:', error);
      console.error('Error details:', error.message);
      if (error.error) {
        console.error('Airtable error:', error.error);
      }
      throw error;
    }
  }
};

module.exports = Product;
