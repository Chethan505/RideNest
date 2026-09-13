import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    try {
      const response = await fetch((import.meta.env.VITE_API_URL) + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      
      if (response.ok) {
        if (data.user.role !== 'ADMIN') {
          setMessage({ text: 'Access Denied: This portal is for administrators only.', type: 'error' });
          return;
        }
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        setMessage({ text: 'Access Granted. Redirecting to Dashboard...', type: 'success' });
        setTimeout(() => {
          navigate('/admin');
          window.location.reload();
        }, 1500);
      } else {
        if (data.details) {
          setMessage({ text: data.details.join(' | '), type: 'error' });
        } else {
          setMessage({ text: data.error || 'Invalid credentials', type: 'error' });
        }
      }
    } catch (error) {
      console.error('Error during login:', error);
      setMessage({ text: 'Network error. Is backend running?', type: 'error' });
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="card" style={{ maxWidth: '440px', width: '100%', borderTop: '5px solid var(--accent-primary)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
            <div style={{ color: 'var(--accent-primary)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
            <h2 style={{ fontSize: '1.8rem' }}>Admin Portal</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Secure login for fleet management</p>
        </div>
        
        {message.text && (
          <div style={{ padding: '0.75rem', marginBottom: '1rem', borderRadius: 'var(--radius-sm)', backgroundColor: message.type === 'error' ? 'var(--danger)' : 'var(--success)', color: 'white', textAlign: 'center', fontSize: '0.9rem' }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: 'var(--spacing-sm)' }}>Admin Email</label>
            <input 
              type="email" 
              className="input" 
              placeholder="admin@vehiclerental.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: 'var(--spacing-sm)' }}>Secure Password</label>
            <input 
              type="password" 
              className="input" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem' }}>
            Verify & Enter Dashboard
          </button>
        </form>
        
        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <p>Protected by VehicleRental Security Engine v2.0</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
