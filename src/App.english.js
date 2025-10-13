import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import ProductImageCarousel from './components/ProductImageCarousel';

const AppContainer = styled.div`
  height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  overflow: hidden;
  position: relative;
`;

const Header = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  background: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  z-index: 1000;
  border-bottom: 1px solid #e9ecef;
`;

const Logo = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const LogoIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(45deg, #3498db, #2980b9);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
`;

const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const Select = styled.select`
  background: #ffffff;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  color: #2c3e50;
  padding: 10px 15px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;

  &:hover {
    border-color: #3498db;
  }

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  }

  option {
    background: #ffffff;
    color: #2c3e50;
  }
`;

const FilterButton = styled.button`
  background: linear-gradient(45deg, #3498db, #2980b9);
  border: none;
  border-radius: 8px;
  color: white;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
  }
`;

const MainContent = styled.div`
  height: calc(100vh - 70px);
  overflow-y: auto;
  padding-top: 70px;
  scroll-snap-type: y mandatory;
`;

const ProductContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  scroll-snap-align: start;
  padding: 30px;
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
`;

const ProductCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  min-height: 500px;
  display: flex;
  flex-direction: column;
  border: 1px solid #e9ecef;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 300px;
  overflow: hidden;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;

  ${ProductCard}:hover & {
    transform: scale(1.05);
  }
`;


const ContentContainer = styled.div`
  padding: 25px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const ProductTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CategoryTag = styled.span`
  background: #e8f4fd;
  color: #3498db;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  align-self: flex-start;
`;

const RatingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Stars = styled.div`
  display: flex;
  gap: 2px;
`;

const Star = styled.span`
  color: ${props => props.filled ? '#f39c12' : '#bdc3c7'};
  font-size: 16px;
`;

const RatingText = styled.span`
  font-size: 14px;
  color: #7f8c8d;
`;

const VolumeText = styled.span`
  font-size: 14px;
  color: #27ae60;
  font-weight: 500;
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: auto;
`;

const CurrentPrice = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #e74c3c;
`;

const OriginalPrice = styled.div`
  font-size: 18px;
  color: #95a5a6;
  text-decoration: line-through;
`;

const CurrencySymbol = styled.span`
  font-size: 16px;
  margin-left: 4px;
  color: #7f8c8d;
`;

const ProductId = styled.div`
  font-size: 12px;
  color: #95a5a6;
  margin-top: 5px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 20px;
`;

const PurchaseButton = styled.button`
  flex: 1;
  padding: 15px 20px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background: linear-gradient(45deg, #27ae60, #2ecc71);
  color: white;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);
  }
`;

const ShareButton = styled.button`
  padding: 15px 20px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #ffffff;
  color: #2c3e50;

  &:hover {
    border-color: #3498db;
    color: #3498db;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #7f8c8d;
  font-size: 18px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: #7f8c8d;
  text-align: center;
  padding: 40px;
`;

const EmptyStateTitle = styled.h2`
  font-size: 24px;
  margin-bottom: 16px;
  color: #2c3e50;
`;

const EmptyStateText = styled.p`
  font-size: 16px;
  line-height: 1.5;
  max-width: 400px;
`;

function App() {
  const [language, setLanguage] = useState('en');
  const [currency, setCurrency] = useState('USD');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'he', name: 'עברית', flag: '🇮🇱' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ];

  const currencies = [
    { code: 'USD', symbol: '$', name: 'Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'ILS', symbol: '₪', name: 'Shekel' }
  ];

  // Mock products with the correct structure
  const mockProducts = [
    {
      product_title: 'Wireless Bluetooth Headphones with Noise Cancellation',
      product_small_image_urls: [
        'https://via.placeholder.com/400x300/3498db/ffffff?text=Headphone+1',
        'https://via.placeholder.com/400x300/2980b9/ffffff?text=Headphone+2',
        'https://via.placeholder.com/400x300/34495e/ffffff?text=Headphone+3'
      ],
      product_video_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      target_original_price_currency: 'USD',
      target_original_price: 99.99,
      target_sale_price: 59.99,
      discount: 40,
      lastest_volume: 1250,
      first_level_category_name: 'Electronics',
      product_id: '1005009902825566',
      evaluate_rate: 4.5
    },
    {
      product_title: 'Smart Fitness Watch with Heart Rate Monitor',
      product_small_image_urls: [
        'https://via.placeholder.com/400x300/e74c3c/ffffff?text=Watch+1',
        'https://via.placeholder.com/400x300/c0392b/ffffff?text=Watch+2'
      ],
      product_video_url: null,
      target_original_price_currency: 'USD',
      target_original_price: 199.99,
      target_sale_price: 149.99,
      discount: 25,
      lastest_volume: 890,
      first_level_category_name: 'Wearables',
      product_id: '1005009902825567',
      evaluate_rate: 4.2
    },
    {
      product_title: 'Portable Phone Charger 20000mAh Power Bank',
      product_small_image_urls: [
        'https://via.placeholder.com/400x300/27ae60/ffffff?text=Charger+1',
        'https://via.placeholder.com/400x300/2ecc71/ffffff?text=Charger+2',
        'https://via.placeholder.com/400x300/16a085/ffffff?text=Charger+3',
        'https://via.placeholder.com/400x300/1abc9c/ffffff?text=Charger+4'
      ],
      product_video_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      target_original_price_currency: 'USD',
      target_original_price: 49.99,
      target_sale_price: 29.99,
      discount: 40,
      lastest_volume: 2100,
      first_level_category_name: 'Accessories',
      product_id: '1005009902825568',
      evaluate_rate: 4.7
    }
  ];

  useEffect(() => {
    // Simulate loading products
    setLoading(true);
    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 1500);
  }, []);

  const formatPrice = (price, currencyCode) => {
    const symbols = {
      'USD': '$',
      'EUR': '€',
      'ILS': '₪'
    };
    
    const symbol = symbols[currencyCode] || '$';
    return `${symbol}${parseFloat(price).toFixed(2)}`;
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} filled>★</Star>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} filled>★</Star>);
      } else {
        stars.push(<Star key={i}>☆</Star>);
      }
    }
    return stars;
  };

  const handlePurchase = (product) => {
    // In a real app, this would use the promotion_link
    const promotionLink = `https://affiliate.alibee.online/product/${product.product_id}`;
    window.open(promotionLink, '_blank');
  };

  const handleShare = (product) => {
    if (navigator.share) {
      navigator.share({
        title: product.product_title,
        text: `Check out this product: ${product.product_title}`,
        url: `https://affiliate.alibee.online/product/${product.product_id}`
      });
    } else {
      navigator.clipboard.writeText(`https://affiliate.alibee.online/product/${product.product_id}`);
      alert('Product link copied to clipboard!');
    }
  };

  if (error) {
    return (
      <AppContainer>
        <Header>
          <Logo>
            <LogoIcon>🛍️</LogoIcon>
            Alibee Client
          </Logo>
        </Header>
        <EmptyState>
          <EmptyStateTitle>Error Loading Products</EmptyStateTitle>
          <EmptyStateText>{error}</EmptyStateText>
        </EmptyState>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <Header>
        <Logo>
          <LogoIcon>🛍️</LogoIcon>
          Alibee Client
        </Logo>

        <ControlsContainer>
          <Select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </Select>

          <Select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {currencies.map(curr => (
              <option key={curr.code} value={curr.code}>
                {curr.symbol} {curr.code}
              </option>
            ))}
          </Select>

          <FilterButton onClick={() => setShowFilterModal(true)}>
            🔍 Filter
          </FilterButton>
        </ControlsContainer>
      </Header>

      <MainContent>
        <ProductContainer>
          {loading ? (
            <LoadingContainer>
              <div>⏳ Loading products...</div>
            </LoadingContainer>
          ) : products.length === 0 ? (
            <EmptyState>
              <EmptyStateTitle>No Products Found</EmptyStateTitle>
              <EmptyStateText>
                Try adjusting your filters or search criteria to find more products.
              </EmptyStateText>
            </EmptyState>
          ) : (
            products.map((product, index) => (
              <ProductCard key={product.product_id || index}>
                <ImageContainer>
                  <ProductImageCarousel
                    images={product.product_small_image_urls}
                    videoUrl={product.product_video_url}
                    discount={product.discount}
                    autoPlay={true}
                    autoPlayInterval={4000}
                  />
                </ImageContainer>
                
                <ContentContainer>
                  <ProductTitle>{product.product_title}</ProductTitle>
                  
                  <CategoryTag>{product.first_level_category_name}</CategoryTag>

                  <RatingContainer>
                    <Stars>
                      {renderStars(product.evaluate_rate)}
                    </Stars>
                    <RatingText>({product.evaluate_rate.toFixed(1)})</RatingText>
                    <VolumeText>• {product.lastest_volume} sold</VolumeText>
                  </RatingContainer>

                  <PriceContainer>
                    <CurrentPrice>
                      {formatPrice(product.target_sale_price, currency)}
                      <CurrencySymbol>{currency}</CurrencySymbol>
                    </CurrentPrice>
                    {product.target_original_price && product.target_original_price > product.target_sale_price && (
                      <OriginalPrice>
                        {formatPrice(product.target_original_price, currency)}
                      </OriginalPrice>
                    )}
                  </PriceContainer>

                  <ProductId>ID: {product.product_id}</ProductId>

                  <ActionButtons>
                    <PurchaseButton onClick={() => handlePurchase(product)}>
                      🛒 Buy Now
                    </PurchaseButton>
                    <ShareButton onClick={() => handleShare(product)}>
                      📤 Share
                    </ShareButton>
                  </ActionButtons>
                </ContentContainer>
              </ProductCard>
            ))
          )}
        </ProductContainer>
      </MainContent>

      {showFilterModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '30px',
            width: '100%',
            maxWidth: '500px',
            color: '#2c3e50',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
          }}>
            <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>Filter Products</h2>
            <p style={{ color: '#7f8c8d' }}>Advanced filters will be implemented in the full version</p>
            <button 
              onClick={() => setShowFilterModal(false)}
              style={{
                marginTop: '20px',
                padding: '12px 24px',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </AppContainer>
  );
}

export default App;
