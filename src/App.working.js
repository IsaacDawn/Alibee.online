import React, { useState } from 'react';
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
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
  text-align: center;
`;

function App() {
  const [language, setLanguage] = useState('en');
  const [currency, setCurrency] = useState('USD');

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

          <FilterButton onClick={() => console.log('Filter clicked')}>
            🔍 Filter
          </FilterButton>
        </ControlsContainer>
      </Header>

      <MainContent>
        <div>
          <h1>Alibee Client - Working Version!</h1>
          <p>Language: {language}</p>
          <p>Currency: {currency}</p>
          <p>Frontend is working correctly! 🎉</p>
        </div>
      </MainContent>
    </AppContainer>
  );
}

export default App;
