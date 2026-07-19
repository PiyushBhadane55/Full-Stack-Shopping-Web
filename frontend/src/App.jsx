import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Cart from './components/Cart';
import Orders from './components/Orders';
import Admin from './components/Admin';
import UserManagement from './components/UserManagement';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [currentView, setCurrentView] = useState('products');
  const [cartCount, setCartCount] = useState(0);

  // Restore session from localStorage on load
  useEffect(() => {
    const savedUser = localStorage.getItem('nexus_user');
    const savedToken = localStorage.getItem('nexus_token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
  }, []);

  // Fetch cart count when user or token updates
  const fetchCartCount = async () => {
    if (!token) {
      setCartCount(0);
      return;
    }
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get('http://localhost:8083/api/cart', { headers });
      const items = response.data || [];
      const totalCount = items.reduce((acc, item) => acc + item.quantity, 0);
      setCartCount(totalCount);
    } catch (err) {
      console.error('Failed to fetch cart count:', err);
    }
  };

  useEffect(() => {
    fetchCartCount();
  }, [token]);

  const handleLoginSuccess = (loginResponse) => {
    // loginResponse structure from AuthController: { token, username, email, role, userId, expiresAt }
    const userData = {
      username: loginResponse.username,
      email: loginResponse.email,
      role: loginResponse.role,
      userId: loginResponse.userId
    };
    
    setUser(userData);
    setToken(loginResponse.token);
    localStorage.setItem('nexus_user', JSON.stringify(userData));
    localStorage.setItem('nexus_token', loginResponse.token);
    setCurrentView('products');
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setCartCount(0);
    localStorage.removeItem('nexus_user');
    localStorage.removeItem('nexus_token');
    setCurrentView('products');
  };

  const renderView = () => {
    switch (currentView) {
      case 'products':
        return (
          <Dashboard 
            user={user} 
            token={token} 
            onAddToCartSuccess={fetchCartCount} 
          />
        );
      case 'login':
        return (
          <Login 
            onLoginSuccess={handleLoginSuccess} 
            onRegisterRedirect={() => setCurrentView('register')} 
          />
        );
      case 'register':
        return (
          <Register 
            onRegisterSuccess={() => setCurrentView('login')} 
            onLoginRedirect={() => setCurrentView('login')} 
          />
        );
      case 'cart':
        return token ? (
          <Cart 
            token={token} 
            onCartUpdated={fetchCartCount}
            onCheckoutSuccess={() => {
              alert('Order placed successfully!');
              fetchCartCount();
              setCurrentView('orders');
            }} 
          />
        ) : (
          <Login onLoginSuccess={handleLoginSuccess} onRegisterRedirect={() => setCurrentView('register')} />
        );
      case 'orders':
        return token ? (
          <Orders token={token} />
        ) : (
          <Login onLoginSuccess={handleLoginSuccess} onRegisterRedirect={() => setCurrentView('register')} />
        );
      case 'admin':
        return (token && user?.role === 'ADMIN') ? (
          <Admin token={token} user={user} onProductAdded={() => setCurrentView('products')} />
        ) : (
          <Dashboard user={user} token={token} onAddToCartSuccess={fetchCartCount} />
        );
      case 'userManagement':
        return (token && user?.role === 'ADMIN') ? (
          <UserManagement token={token} currentUser={user} />
        ) : (
          <Dashboard user={user} token={token} onAddToCartSuccess={fetchCartCount} />
        );
      default:
        return <Dashboard user={user} token={token} onAddToCartSuccess={fetchCartCount} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar 
        user={user} 
        cartCount={cartCount} 
        currentView={currentView}
        onViewChange={setCurrentView} 
        onLogout={handleLogout} 
      />
      <main style={{ flex: 1, paddingBottom: '40px' }}>
        {renderView()}
      </main>
    </div>
  );
}
