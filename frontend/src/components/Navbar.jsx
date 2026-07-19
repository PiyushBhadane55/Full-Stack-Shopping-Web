import React from 'react';
import { ShoppingCart, LogOut, Package, User, PlusCircle, Users } from 'lucide-react';

export default function Navbar({ user, cartCount, onViewChange, currentView, onLogout }) {
  return (
    <nav className="glass-card" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      margin: '0 0 30px 0',
      borderRadius: '0 0 16px 16px',
      borderTop: 'none',
      background: 'rgba(19, 23, 45, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 40px'
    }}>
      <div 
        onClick={() => onViewChange('products')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
          background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-primary) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 800,
          fontSize: '1.5rem',
          letterSpacing: '1px'
        }}
      >
        <Package style={{ stroke: 'var(--color-primary)', width: '28px', height: '28px' }} />
        NEXUS PORTAL
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        <button 
          onClick={() => onViewChange('products')}
          style={{
            background: 'none',
            border: 'none',
            color: currentView === 'products' ? 'var(--color-accent)' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 600,
            transition: 'var(--transition-smooth)'
          }}
        >
          Products
        </button>

        {user && (
          <>
            <button 
              onClick={() => onViewChange('orders')}
              style={{
                background: 'none',
                border: 'none',
                color: currentView === 'orders' ? 'var(--color-accent)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 600,
                transition: 'var(--transition-smooth)'
              }}
            >
              My Orders
            </button>

            {user.role === 'ADMIN' && (
              <>
                <button 
                  onClick={() => onViewChange('admin')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: currentView === 'admin' ? 'var(--color-accent)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  <PlusCircle size={16} />
                  Admin Panel
                </button>

                <button 
                  onClick={() => onViewChange('userManagement')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: currentView === 'userManagement' ? 'var(--color-accent)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  <Users size={16} />
                  User Directory
                </button>
              </>
            )}

            <button 
              onClick={() => onViewChange('cart')}
              style={{
                background: 'none',
                border: 'none',
                color: currentView === 'cart' ? 'var(--color-accent)' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                position: 'relative',
                fontSize: '1rem',
                fontWeight: 600,
                transition: 'var(--transition-smooth)'
              }}
            >
              <ShoppingCart size={20} />
              Cart
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '-12px',
                  background: 'var(--color-secondary)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  fontWeight: 700
                }}>
                  {cartCount}
                </span>
              )}
            </button>
          </>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {user ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '8px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <User size={18} color="var(--color-accent)" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{user.username}</span>
                <span className={`badge badge-${user.role.toLowerCase()}`} style={{ alignSelf: 'flex-start', marginTop: '2px', fontSize: '0.65rem' }}>
                  {user.role}
                </span>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="btn btn-danger"
              style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => onViewChange('login')} className="btn btn-secondary" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
              Login
            </button>
            <button onClick={() => onViewChange('register')} className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
              Register
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
