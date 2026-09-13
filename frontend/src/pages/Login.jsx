import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from "@react-oauth/google";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: credentialResponse.credential,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("user", JSON.stringify(data.user));

        setMessage({
          text: "Google login successful!",
          type: "success",
        });

        setTimeout(() => {
          navigate("/");
          window.location.reload();
        }, 1000);
      } else {
        setMessage({
          text: data.error || "Google login failed.",
          type: "error",
        });
      }
    } catch (err) {
      console.error(err);
      setMessage({
        text: "Unable to login with Google.",
        type: "error",
      });
    }
  };

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
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        setMessage({ text: 'Login successful! Welcome ' + data.user.name, type: 'success' });
        setTimeout(() => {
          navigate('/');
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
    <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-xl) 0' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>Welcome Back</h2>

        {message.text && (
          <div style={{ padding: '0.75rem', marginBottom: '1rem', borderRadius: '4px', backgroundColor: message.type === 'error' ? 'var(--danger)' : 'var(--success)', color: 'white', textAlign: 'center' }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleLogin}>
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
          <div className="text-right mt-2">
            <Link
              to="/forgot-password"
              className="text-blue-600 hover:underline text-sm"
            >
              Forgot Password?
            </Link>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Login
          </button>
          <div
            style={{
              margin: "20px 0",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() =>
                setMessage({
                  text: "Google login failed.",
                  type: "error",
                })
              }
            />
          </div>
        </form>
        <p style={{ textAlign: 'center', marginTop: 'var(--spacing-md)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Don't have an account? <Link to="/signup" style={{ fontWeight: '500' }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
