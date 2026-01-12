import React, { useState } from 'react';
import styled from 'styled-components';

const AppContainer = styled.div`
  height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #000 0%, #1a1a1a 100%);
  overflow: hidden;
  position: relative;
`;

function App() {
  const [test, setTest] = useState('Hello World');

  return (
    <AppContainer>
      <div style={{ 
        color: '#fff', 
        padding: '20px',
        fontSize: '24px',
        textAlign: 'center'
      }}>
        <h1>Alibee Client - Minimal Test</h1>
        <p>{test}</p>
        <button 
          onClick={() => setTest('Button clicked!')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4ecdc4',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test Button
        </button>
      </div>
    </AppContainer>
  );
}

export default App;
