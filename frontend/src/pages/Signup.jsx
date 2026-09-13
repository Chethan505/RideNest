import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showErrorModal, setShowErrorModal] = useState({ show: false, title: '', desc: '' });
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    try {
      const response = await fetch((import.meta.env.VITE_API_URL) + '/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        setMessage({ text: 'Registration successful! Redirecting...', type: 'success' });
        setTimeout(() => { navigate('/'); window.location.reload(); }, 1500);
      } else {
        if (data.details) {
          setMessage({ text: data.details.join(' | '), type: 'error' });
        } else if (data.error && data.error.toLowerCase().includes('email')) {
            setShowErrorModal({ show: true, title: 'User Already Exists', desc: 'An account with this email address has already been registered. Please use a different email or log in to your existing account.' });
        } else {
            setMessage({ text: data.error || 'Registration failed', type: 'error' });
        }
      }
    } catch (error) {
      console.error('Error during signup:', error);
      setMessage({ text: 'Network error. Is backend running?', type: 'error' });
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-xl) 0' }}>
      
      {/* Duplicate Email Error Modal */}
      {showErrorModal.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, backdropFilter: 'blur(5px)' }}>
          <div className="card" style={{ maxWidth: '400px', width: '100%', position: 'relative', margin: '1rem', textAlign: 'center', padding: 'var(--spacing-xl)' }}>
            <h2 style={{ marginBottom: '1rem', color: 'var(--danger)' }}>{showErrorModal.title}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
              {showErrorModal.desc}
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button type="button" onClick={() => setShowErrorModal({ show: false, title: '', desc: '' })} className="btn btn-outline" style={{ flex: 1 }}>Close</button>
              <Link to="/login" className="btn btn-primary" style={{ flex: 1 }}>Go to Login</Link>
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>Create Account</h2>
        
        {message.text && (
          <div style={{ padding: '0.75rem', marginBottom: '1rem', borderRadius: '4px', backgroundColor: message.type === 'error' ? 'var(--danger)' : 'var(--success)', color: 'white', textAlign: 'center' }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSignup}>
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>Full Name</label>
            <input 
              type="text" 
              className="input" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>Email Address</label>
            <input 
              type="email" 
              className="input" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>Password</label>
            <input 
              type="password" 
              className="input" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Sign Up
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 'var(--spacing-md)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ fontWeight: '500' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
