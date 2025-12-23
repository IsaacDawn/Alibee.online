import axios from 'axios';

// Use localhost for development, production URL for production
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://alibeeonline-backend-9cl5.onrender.com');

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    console.error('API Response Error Details:', {
      status: error.response?.status,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      method: error.config?.method,
      data: error.response?.data
    });
    
    // Don't transform the error - let the calling code handle it
    // This allows more detailed error information to be passed through
    return Promise.reject(error);
  }
);

export const productService = {
  /**
   * Get products with comprehensive filtering
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Products response
   */
  async getProducts(filters = {}) {
    try {
      const params = {
        category: filters.category || 'all',
        sort_order: filters.sort_order || 'asc',
        currency: filters.currency || 'USD',
        limit: filters.limit || 100,
        min_price: filters.min_price || 0,
        max_price: filters.max_price || 100000,
        JustVideo: filters.JustVideo || 0,
        page: filters.page || 1
      };

      // Remove empty parameters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      console.log('=== productService.getProducts DEBUG ===');
      console.log('Sending params:', JSON.stringify(params, null, 2));
      console.log('Category param:', params.category);
      console.log('Full URL:', `${API_BASE_URL}/api/products/comprehensive-filter`);
      
      const response = await api.get('/api/products/comprehensive-filter', {
        params
      });
      
      console.log('--- Raw API Response ---');
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      console.log('Response data type:', typeof response.data);
      console.log('Response data:', response.data);
      console.log('Response.data keys:', response.data ? Object.keys(response.data) : []);

      // Handle different response structures
      let products = [];
      let hasMore = false;
      let total = 0;
      let page = 1;

      console.log('--- Parsing Response Structure ---');
      
      if (Array.isArray(response.data)) {
        console.log('✓ Response.data is array');
        products = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data.products)) {
        // Handle the actual API response structure: {data: {products: [...], total: 40}, status: "success"}
        console.log('✓ Response structure: response.data.data.products');
        console.log('  Status:', response.data.status);
        console.log('  Total in response:', response.data.data.total);
        products = response.data.data.products;
        total = response.data.data.total || 0;
        hasMore = products.length < total;
      } else if (response.data && Array.isArray(response.data.products)) {
        console.log('✓ Response structure: response.data.products');
        products = response.data.products;
        hasMore = response.data.hasMore || false;
        total = response.data.total || 0;
        page = response.data.page || 1;
      } else if (response.data && Array.isArray(response.data.data)) {
        console.log('✓ Response structure: response.data.data');
        products = response.data.data;
        hasMore = response.data.hasMore || false;
        total = response.data.total || 0;
        page = response.data.page || 1;
      } else {
        console.log('✗ Unexpected API response structure');
        console.log('  Response.data type:', typeof response.data);
        console.log('  Response.data:', response.data);
        console.log('  Full response object:', response);
        if (response.data && response.data.data) {
          console.log('  Response.data.data:', response.data.data);
          console.log('  Response.data.data type:', typeof response.data.data);
          if (response.data.data.products) {
            console.log('  Response.data.data.products type:', typeof response.data.data.products);
            console.log('  Response.data.data.products is array?', Array.isArray(response.data.data.products));
            console.log('  Response.data.data.products length:', response.data.data.products?.length);
          }
        }
        products = [];
      }

      console.log('--- Parsing Result ---');
      console.log('Parsed products count:', products.length);
      console.log('Total:', total);
      console.log('HasMore:', hasMore);
      if (products.length > 0) {
        console.log('First product sample:', {
          product_id: products[0]?.product_id,
          product_title: products[0]?.product_title?.substring(0, 50),
          first_level_category_name: products[0]?.first_level_category_name,
          second_level_category_name: products[0]?.second_level_category_name,
        });
      }
      console.log('=== productService.getProducts DEBUG END ===');

      return {
        products,
        hasMore,
        total,
        page
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  /**
   * Get all categories
   * @returns {Promise<Array>} Categories array
   */
  async getCategories() {
    try {
      const response = await api.get('/api/categories');
      // Handle the API response structure: {data: {categories: [...], total: 8}, status: "success"}
      if (response.data && response.data.data && Array.isArray(response.data.data.categories)) {
        return response.data.data.categories.map(cat => ({
          id: cat.category_name,
          name: cat.category_name,
          product_count: cat.product_count
        }));
      } else if (Array.isArray(response.data.categories)) {
        return response.data.categories.map(cat => ({
          id: cat.category_name,
          name: cat.category_name,
          product_count: cat.product_count
        }));
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  /**
   * Get product by ID
   * @param {string|number} productId - Product ID
   * @returns {Promise<Object>} Product data
   */
  async getProductById(productId) {
    try {
      const response = await api.get(`/api/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  /**
   * Search products by keyword
   * @param {string} keyword - Search keyword
   * @param {Object} filters - Additional filters (sort_order, currency, limit, min_price, max_price)
   * @returns {Promise<Object>} Search results
   */
  async searchProducts(keyword, filters = {}) {
    try {
      const params = {
        keyword: keyword,
        sort_order: filters.sort_order || 'asc',
        currency: filters.currency || 'USD',
        limit: filters.limit,
        min_price: filters.min_price,
        max_price: filters.max_price
      };

      // Remove empty parameters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      console.log('Searching products with params:', params);
      console.log('API Base URL:', API_BASE_URL);
      console.log('Full URL will be:', `${API_BASE_URL}/api/products/search?${new URLSearchParams(params).toString()}`);
      
      const response = await api.get('/api/products/search', { params });
      console.log('Search response status:', response.status);
      console.log('Search response data:', response.data);
      
      // Handle the API response structure: {status: "success", data: {products: [...], total: 5, ...}}
      let products = [];
      let total = 0;

      if (response.data && response.data.status === 'error') {
        throw new Error(response.data.message || 'Search failed');
      }

      if (response.data && response.data.data && Array.isArray(response.data.data.products)) {
        products = response.data.data.products;
        total = response.data.data.total || 0;
      } else if (Array.isArray(response.data.products)) {
        products = response.data.products;
        total = response.data.total || 0;
      } else if (Array.isArray(response.data)) {
        products = response.data;
      }

      console.log('Parsed search products:', products.length, 'Total:', total);

      return {
        products,
        hasMore: false,
        total,
        page: 1
      };
    } catch (error) {
      console.error('Error searching products:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        fullURL: error.config?.baseURL ? `${error.config.baseURL}${error.config.url}` : error.config?.url
      });
      
      // Create a more informative error message
      let errorMessage = 'Failed to search products';
      
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 404) {
          errorMessage = error.response.data?.message || `Endpoint not found: ${error.config?.url || '/api/products/search'}`;
        } else if (error.response.status === 400) {
          errorMessage = error.response.data?.message || 'Invalid search request';
        } else if (error.response.status === 500) {
          errorMessage = error.response.data?.message || 'Server error occurred';
        } else {
          errorMessage = error.response.data?.message || `Request failed with status ${error.response.status}`;
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Error in setting up the request
        errorMessage = error.message || 'Failed to setup search request';
      }
      
      const searchError = new Error(errorMessage);
      searchError.originalError = error;
      searchError.status = error.response?.status;
      searchError.response = error.response;
      throw searchError;
    }
  },

  /**
   * Get products with video only
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Products with video
   */
  async getProductsWithVideo(filters = {}) {
    try {
      const params = {
        ...filters,
        JustVideo: 1
      };

      const response = await api.get('/api/products/with-video', { params });
      return {
        products: response.data.products || response.data || [],
        hasMore: response.data.hasMore || false,
        total: response.data.total || 0
      };
    } catch (error) {
      console.error('Error fetching products with video:', error);
      throw error;
    }
  },

  /**
   * Get filtered products
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Filtered products
   */
  async getFilteredProducts(filters = {}) {
    try {
      const params = {
        category: filters.category || '',
        sort_order: filters.sort_order || 'asc',
        currency: filters.currency || 'USD',
        limit: filters.limit || 5
      };

      // Remove empty parameters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await api.get('/api/products/filtered', { params });
      return {
        products: response.data.products || response.data || [],
        hasMore: response.data.hasMore || false,
        total: response.data.total || 0
      };
    } catch (error) {
      console.error('Error fetching filtered products:', error);
      throw error;
    }
  },

  /**
   * Get currency rates
   * @returns {Promise<Object>} Currency rates
   */
  async getCurrencyRates() {
    try {
      const response = await api.get('/api/currency/rates');
      return response.data;
    } catch (error) {
      console.error('Error fetching currency rates:', error);
      throw error;
    }
  },

  /**
   * Convert currency
   * @param {number} amount - Amount to convert
   * @param {string} fromCurrency - Source currency
   * @param {string} toCurrency - Target currency
   * @returns {Promise<Object>} Conversion result
   */
  async convertCurrency(amount, fromCurrency, toCurrency) {
    try {
      const response = await api.get('/api/currency/convert', {
        params: {
          amount,
          from: fromCurrency,
          to: toCurrency
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error converting currency:', error);
      throw error;
    }
  },

  /**
   * Detect currency from text
   * @param {string} text - Text to analyze
   * @returns {Promise<Object>} Detected currency
   */
  async detectCurrency(text) {
    try {
      const response = await api.post('/api/currency/detect', { text });
      return response.data;
    } catch (error) {
      console.error('Error detecting currency:', error);
      throw error;
    }
  },

  /**
   * Health check
   * @returns {Promise<Object>} Health status
   */
  async healthCheck() {
    try {
      const response = await api.get('/api/health');
      return response.data;
    } catch (error) {
      console.error('Error checking health:', error);
      throw error;
    }
  },

  /**
   * Get all products from database without any filters
   * @param {string} currency - Currency code (USD, EUR, ILS, etc.)
   * @returns {Promise<Object>} All products response
   */
  /**
   * Get products by list of product IDs
   * @param {Array<string>} productIds - Array of product IDs
   * @param {string} currency - Currency code (default: 'USD')
   * @returns {Promise<Object>} Products response
   */
  async getProductsByIds(productIds, currency = 'USD') {
    try {
      if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
        return {
          products: [],
          total: 0,
          hasMore: false,
          page: 1
        };
      }

      console.log(`productService.getProductsByIds: Requesting ${productIds.length} products with currency: ${currency}`);
      
      const response = await api.post('/api/products/by-ids', {
        product_ids: productIds,
        currency: currency
      });
      
      console.log('getProductsByIds response:', response.data);

      // Handle the API response structure: {status: "success", data: {products: [...], total: 5, ...}}
      let products = [];
      let total = 0;

      if (response.data && response.data.status === 'error') {
        throw new Error(response.data.message || 'Failed to get products by IDs');
      }

      if (response.data && response.data.data && Array.isArray(response.data.data.products)) {
        products = response.data.data.products;
        total = response.data.data.total || 0;
      } else if (Array.isArray(response.data.products)) {
        products = response.data.products;
        total = response.data.total || 0;
      } else if (Array.isArray(response.data)) {
        products = response.data;
      }

      console.log('Parsed products by IDs:', products.length, 'Total:', total);

      return {
        products,
        hasMore: false,
        total,
        page: 1
      };
    } catch (error) {
      console.error('Error getting products by IDs:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        baseURL: error.config?.baseURL
      });
      
      throw error;
    }
  },

  async getAllProducts(currency = 'USD') {
    try {
      const response = await api.get('/api/products/all-batch', {
        params: {
          currency: currency
        }
      });
      
      // Handle the API response structure
      let products = [];
      let total = 0;

      if (response.data && response.data.data && Array.isArray(response.data.data.products)) {
        products = response.data.data.products;
        total = response.data.data.total || 0;
      } else if (Array.isArray(response.data.products)) {
        products = response.data.products;
        total = response.data.total || 0;
      } else if (Array.isArray(response.data)) {
        products = response.data;
      }

      console.log('All products loaded:', products.length, 'Total:', total);

      return {
        products,
        hasMore: false,
        total,
        page: 1
      };
    } catch (error) {
      console.error('Error fetching all products:', error);
      throw error;
    }
  }
};

export default productService;
