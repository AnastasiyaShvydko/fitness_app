// client/src/components/LoginButton.jsx
import React from 'react';

const LoginButton = () => {
  const handleLogin = () => {
    window.location.href = 'http://localhost:5000/auth/google';
  };

  return (
    <button onClick={handleLogin} style={{
      padding: '10px 20px',
      fontSize: '16px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      backgroundColor: '#4285F4',
      color: '#fff'
    }}>
      Login with Google
    </button>
  );
};

export default LoginButton;
