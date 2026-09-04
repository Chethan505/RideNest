import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const Host = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [myCars, setMyCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [form, setForm] = useState({
    name: '',
    brand: '',
    type: 'Sedan',
    fuelType: 'Petrol',
    pricePerDay: '',
    location: '',
    image: ''
  });
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  useEffect(() => {
    if (!userString || !token) {
      navigate('/login');
      return;
    }
    fetchMyCars();
  }, [navigate]);

  const fetchMyCars = async () => {
    try {
      const res = await fetch(`${API}/host/my-cars`, { headers });
      const data = await res.json();
      setMyCars(data);
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch(`${API}/host/submit`, {
        method: 'POST',
        headers,
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: 'Car submitted successfully! Waiting for admin approval.', type: 'success' });
        setForm({ name: '', brand: '', type: 'Sedan', fuelType: 'Petrol', pricePerDay: '', location: '', image: '' });
        fetchMyCars();
        setTimeout(() => setActiveTab('listings'), 2000);
      } else {
        setMessage({ text: data.message || 'Submission failed', type: 'error' });
      }
    } catch (e) {
      console.error('Submission error:', e);
      setMessage({ text: 'Network error occurred', type: 'error' });
    }
    setLoading(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size too large. Please select an image under 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'var(--warning)';
      case 'APPROVED': return 'var(--success)';
      case 'REJECTED': return 'var(--danger)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div style={{ padding: 'var(--spacing-xl) 0', minHeight: '100vh' }}>
      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          Host Your <span className="text-gradient">Car</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Turn your vehicle into an earning machine
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--glass-border)', marginBottom: 'var(--spacing-lg)' }}>
        <button 
          onClick={() => setActiveTab('list')}
          style={{ padding: '0.75rem 1.5rem', border: 'none', background: 'none', cursor: 'pointer', borderBottom: activeTab === 'list' ? '3px solid var(--accent-primary)' : 'none', color: activeTab === 'list' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: '700', fontSize: '1rem' }}
        >
          List a Car
        </button>
        <button 
          onClick={() => setActiveTab('listings')}
          style={{ padding: '0.75rem 1.5rem', border: 'none', background: 'none', cursor: 'pointer', borderBottom: activeTab === 'listings' ? '3px solid var(--accent-primary)' : 'none', color: activeTab === 'listings' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: '700', fontSize: '1rem' }}
        >
          My Listings ({myCars.length})
        </button>
      </div>

      {message.text && (
        <div style={{ padding: '1rem', marginBottom: '1.5rem', backgroundColor: message.type === 'error' ? 'var(--danger)' : 'var(--success)', color: 'white', borderRadius: 'var(--radius-sm)', textAlign: 'center', animation: 'fadeInUp 0.3s ease-out' }}>
          {message.text}
        </div>
      )}

      {activeTab === 'list' ? (
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Car Model Name</label>
                <input type="text" className="input" placeholder="e.g. Civic, Fortuner" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Brand</label>
                <input type="text" className="input" placeholder="e.g. Honda, Toyota" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} required />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Vehicle Type</label>
                <select className="input" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  <option>SUV</option><option>Sedan</option><option>Hatchback</option><option>Luxury</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Fuel Type</label>
                <select className="input" value={form.fuelType} onChange={e => setForm({...form, fuelType: e.target.value})}>
                  <option>Petrol</option><option>Diesel</option><option>Electric</option><option>Hybrid</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Price Per Day (₹)</label>
                <input type="number" className="input" placeholder="e.g. 2500" value={form.pricePerDay} onChange={e => setForm({...form, pricePerDay: e.target.value})} required />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Location (City)</label>
                <input type="text" className="input" placeholder="e.g. Mumbai, Bangalore" value={form.location} onChange={e => setForm({...form, location: e.target.value})} required />
              </div>
              
              {/* File Upload Section */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Vehicle Photo</label>
                <div style={{ 
                  border: '2px dashed var(--glass-border)', 
                  borderRadius: 'var(--radius-sm)', 
                  padding: '2rem', 
                  textAlign: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  background: form.image ? 'none' : 'var(--bg-secondary)',
                  minHeight: '150px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease'
                }}>
                  {form.image ? (
                    <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
                      <img src={form.image} alt="Preview" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-md)' }} />
                      <button 
                        type="button" 
                        onClick={() => setForm({ ...form, image: '' })}
                        style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '50%', width: '25px', height: '25px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                      >✕</button>
                    </div>
                  ) : (
                    <>
                      <span style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📸</span>
                      <p style={{ color: 'var(--text-primary)', fontWeight: '600', marginBottom: '0.25rem' }}>Click to upload vehicle photo</p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>PNG, JPG or JPEG (Max. 5MB)</p>
                    </>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} 
                  />
                </div>
              </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }} disabled={loading}>
                {loading ? 'Submitting...' : 'Submit for Approval'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {myCars.length === 0 ? (
            <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--spacing-xl)' }}>
              <h3 style={{ color: 'var(--text-secondary)' }}>You haven't listed any cars yet.</h3>
              <button onClick={() => setActiveTab('list')} className="btn btn-primary" style={{ marginTop: '1.5rem' }}>List Your First Car</button>
            </div>
          ) : (
            myCars.map(car => (
              <div key={car.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {car.image ? (
                  <img src={car.image} alt={car.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '200px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>No Image Provided</div>
                )}
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ margin: 0 }}>{car.brand} {car.name}</h3>
                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: '800', backgroundColor: `${statusColor(car.approvalStatus)}15`, color: statusColor(car.approvalStatus), border: `1px solid ${statusColor(car.approvalStatus)}30` }}>
                      {car.approvalStatus}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>{car.type} • {car.fuelType} • {car.location}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '700', fontSize: '1.2rem' }}>₹{car.pricePerDay}<small style={{ fontWeight: '400', fontSize: '0.8rem' }}>/day</small></span>
                    {car.approvalStatus === 'APPROVED' && <span style={{ color: 'var(--success)', fontSize: '0.8rem', fontWeight: '600' }}>● Live on platform</span>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Host;
