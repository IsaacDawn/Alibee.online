import React, { useState } from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.header`
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

const LogoIcon = styled.div`
  width: 32px;
  height: 32px;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
`;

const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const SelectContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
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

  &:focus {
    outline: none;
    border-color: #4ecdc4;
    box-shadow: 0 0 0 2px rgba(78, 205, 196, 0.2);
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
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const Header = ({ 
  language, 
  currency, 
  onLanguageChange, 
  onCurrencyChange, 
  onFilterClick 
}) => {
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
    <HeaderContainer>
      <Logo>
        <LogoIcon>🛍️</LogoIcon>
        Alibee
      </Logo>

      <ControlsContainer>
        <SelectContainer>
          <span style={{ color: '#666' }}>🌍</span>
          <Select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </Select>
        </SelectContainer>

        <SelectContainer>
          <span style={{ color: '#666' }}>💰</span>
          <Select
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value)}
          >
            {currencies.map(curr => (
              <option key={curr.code} value={curr.code}>
                {curr.symbol} {curr.code}
              </option>
            ))}
          </Select>
        </SelectContainer>

        <FilterButton onClick={onFilterClick}>
          <span>🔍</span>
          Filter
        </FilterButton>
      </ControlsContainer>
    </HeaderContainer>
  );
};

export default Header;
