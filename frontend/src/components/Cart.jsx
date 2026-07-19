import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Trash2, Plus, Minus, CreditCard, Loader2, ArrowRight } from 'lucide-react';

export default function Cart({ token, onCheckoutSuccess, onCartUpdated }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCart = async () => {
    setLoading(true);
    setError('');
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get('http://localhost:8083/api/cart', { headers });
      setCartItems(response.data || []);
    } catch (err) {
      setError('Failed to fetch cart. Is shopping-service running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [token]);

  const updateQuantity = async (productId, currentQty, amount) => {
    const newQty = currentQty + amount;
    if (newQty <= 0) return;

    try {
      const headers = { Authorization: `Bearer ${token}` };
      // Cart POST updates/sets quantity
      await axios.post('http://localhost:8083/api/cart', {
        productId,
        quantity: newQty
      }, { headers });
      
      // Update state locally
      setCartItems(prev => prev.map(item => item.productId === productId ? { ...item, quantity: newQty } : item));
      onCartUpdated();
    } catch (err) {
      alert(err.response?.data || 'Failed to update quantity');
    }
  };

  const removeItem = async (productId) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`http://localhost:8083/api/cart/${productId}`, { headers });
      setCartItems(prev => prev.filter(item => item.productId !== productId));
      onCartUpdated();
    } catch (err) {
      alert('Failed to remove item');
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    setCheckoutLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.post('http://localhost:8083/api/orders', {}, { headers });
      if (response.status === 200) {
        onCheckoutSuccess();
      }
    } catch (err) {
      alert(err.response?.data || 'Checkout failed');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const totalAmount = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="animate-fade-in" style={{ padding: '0 20px 40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Shopping Cart</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Review your selected items and complete your order</p>
      </header>

      {error && (
        <div className="glass-card" style={{ padding: '24px', textAlign: 'center', borderColor: 'var(--color-danger)' }}>
          <p style={{ color: '#f87171' }}>{error}</p>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
          <Loader2 size={30} className="animate-spin" style={{ color: 'var(--color-accent)', animation: 'spin 1.8s linear infinite' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Loading cart...</span>
        </div>
      ) : (
        <>
          {cartItems.length === 0 ? (
            <div className="glass-card" style={{ padding: '60px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <ShoppingCart size={48} style={{ color: 'var(--text-muted)' }} />
              <span style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Your shopping cart is empty</span>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
              {/* Items List */}
              <div style={{ flex: '2 1 600px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {cartItems.map(item => (
                  <div key={item.id} className="glass-card" style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '20px',
                    gap: '20px',
                    flexWrap: 'wrap'
                  }}>
                    <img 
                      src={item.imageUrl || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=150&auto=format&fit=crop'} 
                      alt={item.productName} 
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                    
                    <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{item.productName}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxLines: 1 }}>{item.productDescription}</p>
                      <span style={{ color: 'var(--color-accent)', fontWeight: 700 }}>${item.price.toFixed(2)} each</span>
                    </div>

                    {/* Quantity controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '4px' }}>
                      <button 
                        onClick={() => updateQuantity(item.productId, item.quantity, -1)}
                        className="btn" 
                        style={{ padding: '6px', background: 'none', color: 'var(--text-primary)' }}
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={14} />
                      </button>
                      <span style={{ width: '24px', textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.productId, item.quantity, 1)}
                        className="btn" 
                        style={{ padding: '6px', background: 'none', color: 'var(--text-primary)' }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.1rem', minWidth: '80px', textAlign: 'right' }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                      <button 
                        onClick={() => removeItem(item.productId)}
                        className="btn btn-danger" 
                        style={{ padding: '8px 10px' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary Card */}
              <div style={{ flex: '1 1 300px' }}>
                <div className="glass-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '100px' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
                    Order Summary
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                      <span>Subtotal</span>
                      <span>${totalAmount.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                      <span>Shipping</span>
                      <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>FREE</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                      <span>Taxes</span>
                      <span>$0.00</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-glass)', paddingTop: '16px', fontWeight: 800, fontSize: '1.25rem' }}>
                    <span>Total</span>
                    <span style={{ color: 'var(--color-accent)' }}>${totalAmount.toFixed(2)}</span>
                  </div>

                  <button 
                    onClick={handleCheckout}
                    className="btn btn-primary"
                    disabled={checkoutLoading}
                    style={{ height: '48px', marginTop: '10px' }}
                  >
                    {checkoutLoading ? (
                      <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                    ) : (
                      <>
                        <CreditCard size={18} />
                        Checkout Now
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
