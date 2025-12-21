/**
 * Utility functions for filtering and managing liked products
 */

/**
 * Filter products to show only liked ones
 * @param {Array} allProducts - All available products
 * @param {Set} likedProductIds - Set of liked product IDs
 * @returns {Array} Filtered products that are liked
 */
export const filterLikedProducts = (allProducts, likedProductIds) => {
  if (!allProducts || !Array.isArray(allProducts)) {
    return [];
  }
  
  if (!likedProductIds || likedProductIds.size === 0) {
    return [];
  }
  
  return allProducts.filter(product => {
    if (!product || !product.product_id) {
      return false;
    }
    return likedProductIds.has(product.product_id);
  });
};

/**
 * Get count of liked products
 * @param {Set} likedProductIds - Set of liked product IDs
 * @returns {number} Count of liked products
 */
export const getLikedProductsCount = (likedProductIds) => {
  if (!likedProductIds) {
    return 0;
  }
  return likedProductIds.size;
};

/**
 * Check if a product is liked
 * @param {Object} product - Product object
 * @param {Set} likedProductIds - Set of liked product IDs
 * @returns {boolean} True if product is liked
 */
export const isProductLiked = (product, likedProductIds) => {
  if (!product || !product.product_id || !likedProductIds) {
    return false;
  }
  return likedProductIds.has(product.product_id);
};

