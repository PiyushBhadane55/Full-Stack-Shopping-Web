import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Shield, UserCheck, ShieldAlert, Search, RefreshCw, Loader2 } from 'lucide-react';

export default function UserManagement({ token, currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get('http://localhost:8081/api/users', { headers });
      setUsers(response.data || []);
    } catch (err) {
      setError('Failed to fetch user list. Check if user-service is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleUpdateRole = async (userId, targetRole) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.put(`http://localhost:8081/api/users/${userId}/role`, {
        role: targetRole
      }, { headers });
      
      if (response.status === 200) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: targetRole } : u));
      }
    } catch (err) {
      alert(err.response?.data || 'Failed to update user role');
    }
  };

  // Filter users based on query
  const filteredUsers = users.filter(u => 
    (u.fullName && u.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Compute stats
  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === 'ADMIN').length;
  const standardUsersCount = totalUsers - adminCount;

  return (
    <div className="animate-fade-in" style={{ padding: '0 20px 40px 20px', maxWidth: '1100px', margin: '0 auto' }}>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>User Directory & Access Control</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage user registration roles, promote accounts, and review database directory profiles.</p>
        </div>
        <button onClick={fetchUsers} className="btn btn-secondary" style={{ padding: '12px' }}>
          <RefreshCw size={18} />
        </button>
      </header>

      {/* Stats row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '12px', borderRadius: '12px' }}>
            <Users size={24} color="var(--color-primary)" />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block' }}>Total Users</span>
            <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>{totalUsers}</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(168, 85, 247, 0.15)', padding: '12px', borderRadius: '12px' }}>
            <Shield size={24} color="var(--color-secondary)" />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block' }}>Administrators</span>
            <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>{adminCount}</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '12px', borderRadius: '12px' }}>
            <UserCheck size={24} color="var(--color-success)" />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block' }}>Standard Users</span>
            <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>{standardUsersCount}</span>
          </div>
        </div>
      </div>

      {/* Directory Management Table */}
      <div className="glass-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Search */}
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search name, username, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '48px' }}
          />
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

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
            <Loader2 size={30} className="animate-spin" style={{ color: 'var(--color-accent)', animation: 'spin 1.8s linear infinite' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Loading directory...</span>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            {filteredUsers.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No users match your filter criteria.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <th style={{ padding: '12px 8px' }}>User Profile</th>
                    <th style={{ padding: '12px 8px' }}>Username</th>
                    <th style={{ padding: '12px 8px' }}>Active Role</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => {
                    const isSelf = currentUser && u.username === currentUser.username;
                    return (
                      <tr key={u.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)', fontSize: '0.95rem' }}>
                        <td style={{ padding: '16px 8px' }}>
                          <span style={{ fontWeight: 600, display: 'block' }}>{u.fullName || 'Unnamed User'}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{u.email}</span>
                        </td>
                        <td style={{ padding: '16px 8px', color: 'var(--text-secondary)' }}>@{u.username}</td>
                        <td style={{ padding: '16px 8px' }}>
                          <span className={`badge badge-${u.role.toLowerCase()}`} style={{ fontSize: '0.7rem' }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                          {isSelf ? (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                              <ShieldAlert size={12} />
                              Current Account
                            </span>
                          ) : (
                            <select
                              value={u.role}
                              onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                              style={{
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-glass)',
                                borderRadius: '6px',
                                color: 'white',
                                padding: '6px 12px',
                                fontSize: '0.85rem',
                                cursor: 'pointer'
                              }}
                            >
                              <option value="USER">USER</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
