import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';

const AppContainer = styled.div`
  height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #000 0%, #1a1a1a 100%);
  overflow: hidden;
  position: relative;
`;

const Header = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #333;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 1000;
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Select = styled.select`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid #333;
  border-radius: 8px;
  color: #fff;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 80px;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: #555;
  }

  option {
    background: #1a1a1a;
    color: #fff;
  }
`;

const FilterButton = styled.button`
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  border: none;
  border-radius: 8px;
  color: white;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
  }
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

const ProductCard = styled.div`
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  position: relative;
  min-height: 400px;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.4);
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 250px;
  overflow: hidden;
  background: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 48px;
`;

const ContentContainer = styled.div`
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ProductTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  line-height: 1.4;
  margin: 0;
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: auto;
`;

const CurrentPrice = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: #4ecdc4;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &.primary {
    background: linear-gradient(45deg, #4ecdc4, #44a08d);
    color: white;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(78, 205, 196, 0.3);
    }
  }

  &.secondary {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    border: 1px solid #333;

    &:hover {
      background: rgba(255, 255, 255, 0.15);
      border-color: #555;
    }
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #666;
  font-size: 18px;
`;

function App() {
  const [language, setLanguage] = useState('en');
  const [currency, setCurrency] = useState('USD');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

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

  // Mock products for demonstration
  const mockProducts = [
    {
      id: 1,
      title: 'Wireless Bluetooth Headphones',
      current_price: 29.99,
      original_price: 49.99,
      image_url: null,
      store_name: 'TechStore',
      rating: 4.5,
      has_video: true
    },
    {
      id: 2,
      title: 'Smart Watch with Fitness Tracker',
      current_price: 89.99,
      original_price: 129.99,
      image_url: null,
      store_name: 'GadgetWorld',
      rating: 4.2,
      has_video: false
    },
    {
      id: 3,
      title: 'Portable Phone Charger 20000mAh',
      current_price: 19.99,
      original_price: 35.99,
      image_url: null,
      store_name: 'PowerUp',
      rating: 4.7,
      has_video: true
    }
  ];

  useEffect(() => {
    // Simulate loading products
    setLoading(true);
    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 1000);
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
        stars.push('★');
      } else if (i === fullStars && hasHalfStar) {
        stars.push('★');
      } else {
        stars.push('☆');
      }
    }
    return stars.join('');
  };

  return (
    <AppContainer>
      <Header>
        <Logo>
          🛍️ Alibee
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
              <div>⏳ Loading...</div>
            </LoadingContainer>
          ) : (
            products.map((product) => (
              <ProductCard key={product.id}>
                <ImageContainer>
                  {product.has_video ? '🎥' : '📱'}
                </ImageContainer>
                
                <ContentContainer>
                  <ProductTitle>{product.title}</ProductTitle>
                  
                  {product.store_name && (
                    <p style={{ fontSize: '14px', color: '#888', margin: 0 }}>
                      {product.store_name}
                    </p>
                  )}

                  {product.rating && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#ffd700' }}>{renderStars(product.rating)}</span>
                      <span style={{ fontSize: '14px', color: '#888' }}>
                        ({product.rating.toFixed(1)})
                      </span>
                    </div>
                  )}

                  <PriceContainer>
                    <CurrentPrice>
                      {formatPrice(product.current_price, currency)}
                    </CurrentPrice>
                    {product.original_price && product.original_price > product.current_price && (
                      <div style={{ 
                        fontSize: '16px', 
                        color: '#888', 
                        textDecoration: 'line-through' 
                      }}>
                        {formatPrice(product.original_price, currency)}
                      </div>
                    )}
                  </PriceContainer>

                  <ActionButtons>
                    <ActionButton className="primary">
                      🔗 View Product
                    </ActionButton>
                    <ActionButton className="secondary">
                      📤 Share
                    </ActionButton>
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
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
            borderRadius: '20px',
            padding: '30px',
            width: '100%',
            maxWidth: '500px',
            color: '#fff'
          }}>
            <h2 style={{ marginBottom: '20px' }}>Filter Products</h2>
            <p>Filters will be implemented in the full version</p>
            <button 
              onClick={() => setShowFilterModal(false)}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                backgroundColor: '#4ecdc4',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
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
