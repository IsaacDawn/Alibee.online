import React from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border-bottom: 1px solid #333;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 1000;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Logo = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
  loading: eager;
  decoding: sync;
`;

const AppTitle = styled.h1`
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const ControlsSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const SearchButton = styled.button`
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border: none;
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const SelectContainer = styled.div`
  position: relative;
`;

const Select = styled.select`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #fff;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  min-width: 80px;
  height: 36px;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }

  option {
    background: #1a1a1a;
    color: #fff;
    padding: 8px;
  }
`;

const CurrencySelect = styled.select`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: #fff;
  padding: 6px 8px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  min-width: 50px;
  height: 32px;
  text-align: center;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }

  option {
    background: #1a1a1a;
    color: #fff;
    padding: 6px;
    text-align: center;
  }
`;

const LanguageSelect = styled.select`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: #fff;
  padding: 6px 8px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  min-width: 50px;
  height: 32px;
  text-align: center;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }

  option {
    background: #1a1a1a;
    color: #fff;
    padding: 6px;
    text-align: center;
  }
`;


const Header = ({ 
  onSearchClick, 
  selectedLanguage, 
  onLanguageChange, 
  selectedCurrency, 
  onCurrencyChange,
  showSearch = true
}) => {
  const languages = [
    { code: 'en', display: 'EN' },
    { code: 'he', display: 'HE' },
    { code: 'ar', display: 'AR' }
  ];

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'ILS', symbol: '₪', name: 'Israeli Shekel' }
  ];

  return (
    <HeaderContainer>
      <LogoSection>
                <Logo 
                  src="/Logo.png" 
                  alt="Alibee Logo"
                />
        <AppTitle>Alibee Online</AppTitle>
      </LogoSection>

      <ControlsSection>

        <SelectContainer>
          <LanguageSelect value={selectedLanguage} onChange={(e) => onLanguageChange(e.target.value)}>
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.display}
              </option>
            ))}
          </LanguageSelect>
        </SelectContainer>

        <SelectContainer>
          <CurrencySelect value={selectedCurrency} onChange={(e) => onCurrencyChange(e.target.value)}>
            {currencies.map(currency => (
              <option key={currency.code} value={currency.code}>
                {currency.symbol}
              </option>
            ))}
          </CurrencySelect>
        </SelectContainer>
      </ControlsSection>
    </HeaderContainer>
  );
};

export default Header;