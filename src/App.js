import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import FilterModal from './components/FilterModal';
import { useInView } from 'react-intersection-observer';
import { productService } from './services/productService';

const AppContainer = styled.div`
  height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #000 0%, #1a1a1a 100%);
  overflow: hidden;
  position: relative;
`;

const MainContent = styled.div`
  height: calc(100vh - 60px);
  overflow-y: auto;
  padding-top: 60px;
  scroll-snap-type: y mandatory;
`;

const ProductContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  scroll-snap-align: start;
  padding: 20px;
  gap: 20px;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #666;
  font-size: 18px;
`;

const ErrorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #ff4444;
  font-size: 18px;
  text-align: center;
  padding: 20px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: #666;
  text-align: center;
  padding: 40px;
`;

const EmptyStateTitle = styled.h2`
  font-size: 24px;
  margin-bottom: 16px;
  color: #fff;
`;

const EmptyStateText = styled.p`
  font-size: 16px;
  line-height: 1.5;
  max-width: 400px;
`;

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    category: '',
    sort_order: 'asc',
    currency: 'USD',
    limit: 100,
    min_price: 0,
    max_price: 1000000,
    JustVideo: 0
  });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [language, setLanguage] = useState('en');
  const [categories, setCategories] = useState([]);

  // Intersection observer for infinite scroll
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: '100px'
  });

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await productService.getCategories();
        setCategories(categoriesData);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    loadCategories();
  }, []);

  // Load products
  const loadProducts = useCallback(async (reset = false) => {
    if (loading && !reset) return;
    
    setLoading(true);
    setError(null);

    try {
      const currentPage = reset ? 1 : page;
      const response = await productService.getProducts({
        ...filters,
        page: currentPage
      });

      if (reset) {
        setProducts(response.products || []);
        setPage(2);
      } else {
        setProducts(prev => [...prev, ...(response.products || [])]);
        setPage(prev => prev + 1);
      }

      setHasMore(response.hasMore || false);
    } catch (err) {
      setError(err.message || 'Failed to load products');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, page, loading]);

  // Load products when filters change
  useEffect(() => {
    loadProducts(true);
  }, [filters]);

  // Load more products when scrolling
  useEffect(() => {
    if (inView && hasMore && !loading) {
      loadProducts();
    }
  }, [inView, hasMore, loading, loadProducts]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setShowFilterModal(false);
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    // Update document direction based on language
    document.dir = newLanguage === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLanguage;
  };

  const handleCurrencyChange = (newCurrency) => {
    setFilters(prev => ({ ...prev, currency: newCurrency }));
  };

  const handleShowAllProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPage(1);
    setHasMore(false);

    try {
      const response = await productService.getAllProducts(filters.currency);
      
      // Transform products to match ProductCard format
      const transformedProducts = (response.products || []).map(product => {
        // Parse discount percentage
        let discountPercentage = 0;
        if (product.discount) {
          const discountStr = String(product.discount).replace('%', '').trim();
          discountPercentage = parseFloat(discountStr) || 0;
        }
        
        // Parse rating
        let rating = 0;
        if (product.evaluate_rate) {
          rating = parseFloat(product.evaluate_rate) || 0;
        } else if (product.rating_weighted) {
          rating = parseFloat(product.rating_weighted) || 0;
        } else if (product.rating) {
          rating = parseFloat(product.rating) || 0;
        }
        
        return {
          id: product.product_id,
          title: product.custom_title || product.product_title || '',
          image_url: product.product_main_image_url || '',
          current_price: parseFloat(product.target_sale_price || product.sale_price || 0),
          original_price: parseFloat(product.target_original_price || product.original_price || 0),
          discount_percentage: discountPercentage,
          rating: rating,
          store_name: product.shop_name || '',
          product_url: product.promotion_link || product.product_detail_url || '',
          has_video: !!(product.product_video_url && product.product_video_url.trim()),
          product_video_url: product.product_video_url || '',
          product_small_image_urls: product.product_small_image_urls || {}
        };
      });

      setProducts(transformedProducts);
      setPage(1);
      setHasMore(false);
    } catch (err) {
      setError(err.message || 'Failed to load all products');
      console.error('Error loading all products:', err);
    } finally {
      setLoading(false);
    }
  }, [filters.currency]);

  

  if (error && products.length === 0) {
    return (
      <AppContainer>
        <Header
          language={language}
          currency={filters.currency}
          onLanguageChange={handleLanguageChange}
          onCurrencyChange={handleCurrencyChange}
          onFilterClick={() => setShowFilterModal(true)}
        />
        <ErrorContainer>
          <div>
            <h3>Error loading products</h3>
            <p>{error}</p>
            <button 
              onClick={() => loadProducts(true)}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        </ErrorContainer>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <Header
        language={language}
        currency={filters.currency}
        onLanguageChange={handleLanguageChange}
        onCurrencyChange={handleCurrencyChange}
        onFilterClick={() => setShowFilterModal(true)}
      />
      
      <MainContent>
        {products.length === 0 && !loading ? (
          <EmptyState>
            <EmptyStateTitle>No products found</EmptyStateTitle>
            <EmptyStateText>
              Try changing filters or searching for new products to discover more
            </EmptyStateText>
          </EmptyState>
        ) : (
          <ProductContainer>
            {products.map((product, index) => (
              <ProductCard
                key={`${product.id}-${index}`}
                product={product}
                currency={filters.currency}
                language={language}
              />
            ))}
            
            {loading && (
              <LoadingContainer>
                <div className="loading">⏳</div>
                <span style={{ marginLeft: '10px' }}>Loading...</span>
              </LoadingContainer>
            )}
            
            {hasMore && !loading && (
              <div ref={loadMoreRef} style={{ height: '20px' }} />
            )}
          </ProductContainer>
        )}
      </MainContent>

      

      {showFilterModal && (
        <FilterModal
          filters={filters}
          categories={categories}
          onClose={() => setShowFilterModal(false)}
          onApply={handleFilterChange}
          onShowAll={handleShowAllProducts}
        />
      )}
    </AppContainer>
  );
}

export default App;
