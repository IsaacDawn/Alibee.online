import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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
    
    // Handle specific error cases
    if (error.response?.status === 404) {
      throw new Error('منبع مورد نظر یافت نشد');
    } else if (error.response?.status === 500) {
      throw new Error('خطای سرور. لطفاً بعداً تلاش کنید');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('زمان اتصال به سرور تمام شد');
    } else if (!navigator.onLine) {
      throw new Error('اتصال اینترنت برقرار نیست');
    }
    
    throw new Error(error.response?.data?.message || 'خطای نامشخص رخ داده است');
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

      console.log('productService sending params:', JSON.stringify(params, null, 2));
      const response = await api.get('/api/products/comprehensive-filter', {
        params
      });
      
      console.log('Raw API response:', response);
      console.log('Response data:', response.data);

      // Handle different response structures
      let products = [];
      let hasMore = false;
      let total = 0;
      let page = 1;

      if (Array.isArray(response.data)) {
        products = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data.products)) {
        // Handle the actual API response structure: {data: {products: [...], total: 40}, status: "success"}
        products = response.data.data.products;
        total = response.data.data.total || 0;
        hasMore = products.length < total;
      } else if (response.data && Array.isArray(response.data.products)) {
        products = response.data.products;
        hasMore = response.data.hasMore || false;
        total = response.data.total || 0;
        page = response.data.page || 1;
      } else if (response.data && Array.isArray(response.data.data)) {
        products = response.data.data;
        hasMore = response.data.hasMore || false;
        total = response.data.total || 0;
        page = response.data.page || 1;
      } else {
        console.log('Unexpected API response structure:', response.data);
        console.log('Full response object:', response);
        products = [];
      }

      console.log('Parsed products:', products.length, 'Total:', total);

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
   * Search products by query
   * @param {string} query - Search query
   * @param {Object} filters - Additional filters
   * @returns {Promise<Object>} Search results
   */
  async searchProducts(query, filters = {}) {
    try {
      const params = {
        q: query,
        ...filters
      };

      const response = await api.get('/api/products/search', { params });
      return {
        products: response.data.products || response.data || [],
        hasMore: response.data.hasMore || false,
        total: response.data.total || 0
      };
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
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
  }
};

export default productService;
