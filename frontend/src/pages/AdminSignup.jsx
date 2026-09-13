import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AdminSignup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  const handleAdminSignup = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    try {
      const response = await fetch((import.meta.env.VITE_API_URL) + '/auth/register-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        setMessage({ text: data.message, type: 'success' });
        setTimeout(() => { navigate('/admin'); window.location.reload(); }, 1500);
      } else {
        if (data.details) {
          setMessage({ text: data.details.join(' | '), type: 'error' });
        } else {
          setMessage({ text: data.error || 'Registration failed', type: 'error' });
        }
      }
    } catch (error) {
      setMessage({ text: 'Network error. Is backend running?', type: 'error' });
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-xl) 0' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', border: '2px solid var(--accent-primary)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--accent-primary)' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
        </div>
        <h2 style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>Master Admin Setup</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>Only one administrator account can be created for extreme security.</p>
        
        {message.text && (
          <div style={{ padding: '0.75rem', marginBottom: '1rem', borderRadius: '4px', backgroundColor: message.type === 'error' ? 'var(--danger)' : 'var(--success)', color: 'white', textAlign: 'center' }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleAdminSignup}>
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>Full Name</label>
            <input type="text" className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>Admin Email Address</label>
            <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>Secure Password</label>
            <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create Master Account</button>
        </form>
      </div>
    </div>
  );
};

export default AdminSignup;
