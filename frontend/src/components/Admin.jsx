import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Plus, Package, FileText, DollarSign, Layers, Image, Loader2, CheckCircle2 } from 'lucide-react';

export default function Admin({ token, onProductAdded }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !description || !price || !stock) {
      setError('Please fill in all required fields');
      return;
    }

    if (isNaN(price) || parseFloat(price) <= 0) {
      setError('Please enter a valid price greater than 0');
      return;
    }

    if (isNaN(stock) || parseInt(stock) < 0) {
      setError('Please enter a valid stock amount');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.post('http://localhost:8083/api/products', {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        imageUrl: imageUrl.trim() || undefined
      }, { headers });

      if (response.status === 201) {
        setSuccess('Product added successfully!');
        setName('');
        setDescription('');
        setPrice('');
        setStock('');
        setImageUrl('');

        if (onProductAdded) {
          timeoutRef.current = setTimeout(() => {
            onProductAdded();
          }, 1000);
        }
      }
    } catch (err) {
      setError(err.response?.data || 'Failed to add product. Check authorization context.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '0 20px 40px 20px', maxWidth: '650px', margin: '0 auto' }}>
      <div className="glass-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Admin Panel</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Add a new product to the shopping portal catalog</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#f87171',
            padding: '12px 16px',
            fontSize: '0.9rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '8px',
            color: '#34d399',
            padding: '12px 16px',
            fontSize: '0.9rem',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={16} />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.85rem' }}>Product Name *</label>
            <div style={{ position: 'relative' }}>
              <Package size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="input-field"
                placeholder="Product title"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                style={{ paddingLeft: '44px', fontSize: '0.95rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.85rem' }}>Description *</label>
            <div style={{ position: 'relative' }}>
              <FileText size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
              <textarea
                className="input-field"
                placeholder="Enter detailed description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                rows={3}
                style={{ paddingLeft: '44px', fontSize: '0.95rem', resize: 'vertical' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.85rem' }}>Price ($) *</label>
              <div style={{ position: 'relative' }}>
                <DollarSign size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="number"
                  step="0.01"
                  className="input-field"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={loading}
                  style={{ paddingLeft: '44px', fontSize: '0.95rem' }}
                />
              </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.85rem' }}>Stock Quantity *</label>
              <div style={{ position: 'relative' }}>
                <Layers size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="number"
                  className="input-field"
                  placeholder="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  disabled={loading}
                  style={{ paddingLeft: '44px', fontSize: '0.95rem' }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.85rem' }}>Product Image URL</label>
            <div style={{ position: 'relative' }}>
              <Image size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="input-field"
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={loading}
                style={{ paddingLeft: '44px', fontSize: '0.95rem' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ marginTop: '15px', height: '48px' }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                Saving Product...
              </>
            ) : (
              <>
                <Plus size={18} />
                Add Product
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
