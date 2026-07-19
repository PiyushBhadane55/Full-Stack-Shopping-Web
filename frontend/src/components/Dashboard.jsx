import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, ShoppingCart, Loader2, RefreshCw } from 'lucide-react';

export default function Dashboard({ user, token, onAddToCartSuccess }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('none');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:8083/api/products');
      setProducts(response.data);
    } catch (err) {
      setError('Failed to fetch products. Check if shopping-service is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddToCart = async (product) => {
    if (!user) {
      alert('Please log in first to purchase products.');
      return;
    }

    setActionLoading(prev => ({ ...prev, [product.id]: true }));
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      // In cart service, adding quantity. We'll find current quantity in user's cart (handled internally or we send 1)
      // Since our CartService addToCart handles setting quantity, wait! In CartService:
      // "item.setQuantity(newQuantity)" where quantity is passed.
      // Wait, if it sets quantity directly, does the frontend need to get the cart first and add 1, or can we send the new target quantity?
      // Let's check the cart first!
      // In our CartService addToCart, if the item exists, we set:
      // "item.setQuantity(quantity)"
      // Ah! That means if we want to add 1 to the existing cart, we should check if it's already in the cart and send the currentQuantity + 1.
      // Wait, let's fetch the current cart, see if the product is in it, and send the currentQuantity + 1, or we can write a simple endpoint or handle it in state.
      // Wait! Let's check what our CartService does:
      // "existingItem.get().setQuantity(quantity);" where quantity is the absolute new quantity.
      // So if the product is NOT in the cart, we send quantity=1.
      // If the product IS in the cart with quantity N, we send quantity=N+1.
      // Let's implement this logic:
      // 1. Fetch current cart from API.
      // 2. Check if product is in it.
      // 3. Send the updated quantity.
      // Let's write this helper inside `handleAddToCart`.
      
      const cartResponse = await axios.get('http://localhost:8083/api/cart', { headers });
      const currentCartItems = cartResponse.data || [];
      const existingItem = currentCartItems.find(item => item.productId === product.id);
      const newQuantity = existingItem ? existingItem.quantity + 1 : 1;

      if (product.stock < newQuantity) {
        alert(`Insufficient stock. Only ${product.stock} items left.`);
        return;
      }

      await axios.post('http://localhost:8083/api/cart', {
        productId: product.id,
        quantity: newQuantity
      }, { headers });

      onAddToCartSuccess();
      
      // Refresh stock values locally (just decrement by 1 for immediate visual feedback, or refetch)
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock: p.stock - 1 } : p));
      
    } catch (err) {
      alert(err.response?.data || 'Failed to add item to cart');
    } finally {
      setActionLoading(prev => ({ ...prev, [product.id]: false }));
    }
  };

  // Filter & Sort
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.description.toLowerCase().includes(search.toLowerCase())
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOrder === 'asc') return a.price - b.price;
    if (sortOrder === 'desc') return b.price - a.price;
    return 0;
  });

  return (
    <div className="animate-fade-in" style={{ padding: '0 20px 40px 20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Explore Products</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Find top tier technology gear below</p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', width: '100%', maxWidth: '600px' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '48px' }}
            />
          </div>

          <select
            className="input-field"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            style={{ width: '180px', appearance: 'none', cursor: 'pointer' }}
          >
            <option value="none">Sort: Default</option>
            <option value="asc">Price: Low to High</option>
            <option value="desc">Price: High to Low</option>
          </select>

          <button onClick={fetchProducts} className="btn btn-secondary" style={{ padding: '12px' }}>
            <RefreshCw size={18} />
          </button>
        </div>
      </header>

      {error && (
        <div className="glass-card" style={{ padding: '30px', textAlign: 'center', borderColor: 'var(--color-danger)', maxWidth: '500px', margin: '40px auto' }}>
          <p style={{ color: '#f87171', marginBottom: '15px' }}>{error}</p>
          <button onClick={fetchProducts} className="btn btn-primary">Try Again</button>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
          <Loader2 size={36} className="animate-spin" style={{ color: 'var(--color-accent)', animation: 'spin 1.8s linear infinite' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Loading catalog...</span>
        </div>
      ) : (
        <>
          {sortedProducts.length === 0 ? (
            <div className="glass-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No products found matching your search.
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '30px'
            }}>
              {sortedProducts.map(product => (
                <div key={product.id} className="glass-card animate-fade-in" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  {/* Image container */}
                  <div style={{ position: 'relative', height: '200px', background: '#0e1121', overflow: 'hidden' }}>
                    <img 
                      src={product.imageUrl || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=400&auto=format&fit=crop'} 
                      alt={product.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'var(--transition-smooth)'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    />
                    {product.stock === 0 && (
                      <div style={{
                        position: 'absolute',
                        top: 0, right: 0, bottom: 0, left: 0,
                        background: 'rgba(11, 13, 25, 0.75)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ef4444',
                        fontWeight: 700,
                        letterSpacing: '1px'
                      }}>
                        OUT OF STOCK
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.2 }}>{product.name}</h3>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-accent)' }}>
                        ${product.price.toFixed(2)}
                      </span>
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', flex: 1, lineBreak: 'anywhere' }}>
                      {product.description}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Stock status</span>
                      <span style={{ 
                        fontWeight: 600, 
                        color: product.stock > 10 ? 'var(--color-success)' : product.stock > 0 ? '#fbbf24' : 'var(--color-danger)'
                      }}>
                        {product.stock > 0 ? `${product.stock} units left` : 'Out of stock'}
                      </span>
                    </div>

                    {user ? (
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0 || actionLoading[product.id]}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '10px' }}
                      >
                        {actionLoading[product.id] ? (
                          <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                        ) : (
                          <>
                            <ShoppingCart size={16} />
                            Add to Cart
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        disabled
                        className="btn btn-secondary"
                        style={{ width: '100%', padding: '10px', color: 'var(--text-muted)', cursor: 'not-allowed' }}
                      >
                        Login to Purchase
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
