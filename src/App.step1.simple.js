import React, { useState } from 'react';
import styled from 'styled-components';
import Header from './components/Header.simple';

const AppContainer = styled.div`
  height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #000 0%, #1a1a1a 100%);
  overflow: hidden;
  position: relative;
`;

function App() {
  const [language, setLanguage] = useState('en');
  const [currency, setCurrency] = useState('USD');

  return (
    <AppContainer>
      <Header
        language={language}
        currency={currency}
        onLanguageChange={setLanguage}
        onCurrencyChange={setCurrency}
        onFilterClick={() => console.log('Filter clicked')}
      />
      <div style={{ 
        color: '#fff', 
        padding: '80px 20px 20px',
        fontSize: '24px',
        textAlign: 'center'
      }}>
        <h1>Alibee Client - Step 1 Simple (No Icons)</h1>
        <p>Language: {language}</p>
        <p>Currency: {currency}</p>
      </div>
    </AppContainer>
  );
}

export default App;
