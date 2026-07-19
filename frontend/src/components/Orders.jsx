import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Package, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

export default function Orders({ token }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get('http://localhost:8083/api/orders', { headers });
      setOrders(response.data || []);
    } catch (err) {
      setError('Failed to fetch orders. Check if shopping-service is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const toggleExpand = (orderId) => {
    setExpandedOrder(prev => (prev === orderId ? null : orderId));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="animate-fade-in" style={{ padding: '0 20px 40px 20px', maxWidth: '900px', margin: '0 auto' }}>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Order History</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Track and manage your past purchases</p>
      </header>

      {error && (
        <div className="glass-card" style={{ padding: '24px', textAlign: 'center', borderColor: 'var(--color-danger)' }}>
          <p style={{ color: '#f87171' }}>{error}</p>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
          <Loader2 size={30} className="animate-spin" style={{ color: 'var(--color-accent)', animation: 'spin 1.8s linear infinite' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Loading history...</span>
        </div>
      ) : (
        <>
          {orders.length === 0 ? (
            <div className="glass-card" style={{ padding: '60px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <Package size={48} style={{ color: 'var(--text-muted)' }} />
              <span style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>You haven't placed any orders yet</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {orders.map(order => {
                const isExpanded = expandedOrder === order.id;
                return (
                  <div key={order.id} className="glass-card" style={{ overflow: 'hidden' }}>
                    {/* Header */}
                    <div 
                      onClick={() => toggleExpand(order.id)}
                      style={{
                        padding: '24px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        flexWrap: 'wrap',
                        gap: '16px',
                        background: isExpanded ? 'rgba(255, 255, 255, 0.01)' : 'transparent',
                        transition: 'var(--transition-smooth)'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                        <div>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                            Order ID
                          </span>
                          <span style={{ fontWeight: 600, fontSize: '1rem' }}>#NEX-{order.id}</span>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                            Date Placed
                          </span>
                          <span style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={14} style={{ color: 'var(--color-accent)' }} />
                            {formatDate(order.createdAt)}
                          </span>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                            Total Price
                          </span>
                          <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-accent)' }}>
                            ${order.totalAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span className="badge badge-success" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                          {order.status}
                        </span>
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>

                    {/* Expanded Items */}
                    {isExpanded && (
                      <div style={{
                        padding: '0 24px 24px 24px',
                        borderTop: '1px solid var(--border-glass)',
                        background: 'rgba(0, 0, 0, 0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px'
                      }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '20px' }}>
                          Items Purchased:
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {order.items && order.items.map(item => (
                            <div key={item.id} style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '12px',
                              background: 'rgba(255, 255, 255, 0.02)',
                              border: '1px solid var(--border-glass)',
                              borderRadius: '8px',
                              flexWrap: 'wrap',
                              gap: '12px'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <img 
                                  src={item.imageUrl || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=150&auto=format&fit=crop'} 
                                  alt={item.productName} 
                                  style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }}
                                />
                                <div>
                                  <span style={{ fontWeight: 600, fontSize: '0.95rem', display: 'block' }}>{item.productName}</span>
                                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    Qty: {item.quantity} × ${item.price.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                              <span style={{ fontWeight: 700, fontSize: '1rem' }}>
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
