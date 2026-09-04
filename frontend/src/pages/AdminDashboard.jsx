import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalBookings: 0, activeCars: 0, totalRevenue: 0 });
  const [notifications, setNotifications] = useState([]);
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [carForm, setCarForm] = useState({ name: '', brand: '', type: 'Sedan', fuelType: 'Petrol', pricePerDay: '', location: '', image: '', available: true });
  const [editingId, setEditingId] = useState(null);
  const [hostCars, setHostCars] = useState([]);
  const [sysStatus, setSysStatus] = useState({ status: 'UNKNOWN', db: 'UNKNOWN' });
  const [pendingUsers, setPendingUsers] = useState([]);
  const [metrics, setMetrics] = useState({ uptime: 0, requests: 0 });
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  useEffect(() => {
    fetchAll();
  }, [navigate]);

  const fetchAll = () => {
    fetch(`${API}/admin/stats`, { headers }).then(r => r.json()).then(setStats).catch(console.error);
    fetch(`${API}/notifications`, { headers }).then(r => r.json()).then(setNotifications).catch(console.error);
    fetch(`${API}/cars`).then(r => r.json()).then(data => setCars(data.content || data)).catch(console.error);
    fetch(`${API}/bookings`, { headers }).then(r => r.json()).then(data => setBookings(data.content || data)).catch(console.error);
    fetch(`${API}/host/pending`, { headers }).then(r => r.json()).then(setHostCars).catch(console.error);
    fetch(`${API}/admin/users/pending-verification`, { headers })
      .then(r => r.json())
      .then(setPendingUsers)
      .catch(console.error);
    fetch(`${(import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace('/api', '')}/actuator/health`, { headers }).then(r => r.json()).then(data => {
      setSysStatus({
        status: data.status,
        db: data.components?.db?.status || 'UNKNOWN'
      });
    }).catch(() => setSysStatus({ status: 'DOWN', db: 'DOWN' }));

    fetch(`${(import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace('/api', '')}/actuator/metrics/process.uptime`, { headers }).then(r => r.json()).then(data => {
      setMetrics(prev => ({ ...prev, uptime: Math.floor(data.measurements[0].value / 60) }));
    }).catch(console.error);

    fetch(`${(import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace('/api', '')}/actuator/metrics/http.server.requests`, { headers }).then(r => r.json()).then(data => {
      setMetrics(prev => ({ ...prev, requests: data.measurements[0].value }));
    }).catch(console.error);
  };

  const handleCarSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    const url = editingId ? `${API}/cars/${editingId}` : `${API}/cars`;
    const method = editingId ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, { method, headers, body: JSON.stringify(carForm) });
      if (res.ok) {
        setMessage({ text: editingId ? 'Car updated!' : 'Car added!', type: 'success' });
        resetForm();
        fetchAll();
      } else {
        setMessage({ text: 'Operation failed.', type: 'error' });
      }
    } catch (e) { setMessage({ text: 'Network error.', type: 'error' }); }
  };

  const handleEdit = (car) => {
    setEditingId(car.id);
    setCarForm({ name: car.name, brand: car.brand, type: car.type, fuelType: car.fuelType || '', pricePerDay: car.pricePerDay, location: car.location || '', available: car.available });
    setActiveTab('cars');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this car?')) return;
    try {
      const res = await fetch(`${API}/cars/${id}`, { method: 'DELETE', headers });
      if (res.ok) { setMessage({ text: 'Car deleted.', type: 'success' }); fetchAll(); }
    } catch (e) { console.error(e); }
  };

  const handleConfirmPayment = async (id) => {
    try {
      const res = await fetch(`${API}/bookings/${id}/confirm`, { method: 'PUT', headers });
      if (res.ok) {
        setMessage({ text: 'Payment confirmed and booking finalized!', type: 'success' });
        fetchAll();
      }
    } catch (e) { console.error(e); }
  };

  const handleApproveReturn = async (id) => {
    try {
      const res = await fetch(
        `${API}/bookings/${id}/approve-return`,
        {
          method: "PUT",
          headers
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMessage({
          text: data.message,
          type: "success"
        });

        fetchAll();
      } else {
        setMessage({
          text: data.error,
          type: "error"
        });
      }

    } catch (err) {
      console.error(err);

      setMessage({
        text: "Failed to approve return.",
        type: "error"
      });
    }
  };
  const handleCompleteBooking = async (id) => {
    try {
      const res = await fetch(`${API}/bookings/${id}/complete`, { method: 'PUT', headers });
      if (res.ok) fetchAll();
    } catch (e) { console.error(e); }
  };

  const resetForm = () => {
    setEditingId(null);
    setCarForm({ name: '', brand: '', type: 'Sedan', fuelType: 'Petrol', pricePerDay: '', location: '', image: '', available: true });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCarForm({ ...carForm, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHostAction = async (id, action) => {
    try {
      const res = await fetch(`${API}/host/${action}/${id}`, { method: 'PUT', headers });
      if (res.ok) {
        setMessage({ text: `Car ${action}ed successfully!`, type: 'success' });
        fetchAll();
      } else {
        setMessage({ text: 'Action failed.', type: 'error' });
      }
    } catch (e) { console.error(e); }
  };
  const handleApproveUser = async (id) => {

    try {

      const res = await fetch(
        `${API}/admin/users/${id}/approve`,
        {
          method: "PUT",
          headers
        }
      );

      if (res.ok) {

        setMessage({
          text: "User approved successfully",
          type: "success"
        });

        fetchAll();
      }

    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectUser = async (id) => {

    const reason = prompt("Enter rejection reason");

    if (!reason) return;

    try {

      const res = await fetch(
        `${API}/admin/users/${id}/reject`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify({
            reason
          })
        }
      );

      if (res.ok) {

        setMessage({
          text: "User rejected",
          type: "success"
        });

        fetchAll();
      }

    } catch (err) {
      console.error(err);
    }
  };

  const handlePurgeCache = async () => {
    try {
      const res = await fetch(`${API}/admin/stats/cache`, { method: 'DELETE', headers });
      if (res.ok) {
        const data = await res.json();
        setMessage({ text: data.message || 'Cache purged successfully', type: 'success' });
      } else {
        setMessage({ text: 'Failed to purge cache', type: 'error' });
      }
    } catch (e) {
      setMessage({ text: 'Network error purging cache', type: 'error' });
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', count: 'Live' },
    { id: 'cars', label: 'Manage Cars', count: cars.length },
    { id: 'bookings', label: 'Bookings', count: bookings.length },
    { id: 'approvals', label: 'Host Approvals', count: hostCars.length },
    {
      id: 'users',
      label: 'User Verification',
      count: pendingUsers.length
    },
    { id: 'notifications', label: 'Alerts', count: notifications.length },
    { id: 'system', label: 'System', count: sysStatus.status },
  ];

  const statusStyle = (s) => {
    if (s === "AWAITING_VERIFICATION")
      return {
        color: "var(--warning)",
        bg: "rgba(245,158,11,0.08)"
      };

    if (s === "BOOKED")
      return {
        color: "var(--accent-primary)",
        bg: "rgba(99,102,241,0.08)"
      };

    if (s === "ACTIVE")
      return {
        color: "var(--success)",
        bg: "rgba(16,185,129,0.08)"
      };

    if (s === "COMPLETED")
      return {
        color: "var(--success)",
        bg: "rgba(16,185,129,0.08)"
      };

    return {
      color: "var(--danger)",
      bg: "rgba(239,68,68,0.08)"
    };
  };

  return (
    <div style={{ padding: 'var(--spacing-xl) 0', minHeight: '100vh' }}>
      <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-sm)' }}>Admin Console</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>Manage fleet, bookings, and notifications</p>

      {message.text && (
        <div style={{ padding: '0.75rem', marginBottom: '1rem', backgroundColor: message.type === 'error' ? 'var(--danger)' : 'var(--success)', color: 'white', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: 'var(--spacing-lg)', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={activeTab === t.id ? 'btn btn-primary' : 'btn btn-outline'}
            style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
            {t.label} <span style={{ marginLeft: '0.4rem', opacity: 0.8 }}>({t.count})</span>
          </button>
        ))}
      </div>

      {/* ─── Overview Tab ───────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem', borderLeft: '4px solid var(--accent-primary)' }}>
            <div style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--accent-primary)', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.2rem', fontWeight: '500' }}>Total Users</p>
              <h3 style={{ fontSize: '1.6rem', fontWeight: '800' }}>{stats.totalUsers}</h3>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem', borderLeft: '4px solid #8b5cf6' }}>
            <div style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.2rem', fontWeight: '500' }}>System Status</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: sysStatus.status === 'UP' ? 'var(--success)' : 'var(--danger)' }}>API: {sysStatus.status}</h3>
                  <p style={{ fontSize: '0.8rem', color: sysStatus.db === 'UP' ? 'var(--success)' : 'var(--danger)', margin: 0 }}>DB: {sysStatus.db}</p>
                </div>
                <button onClick={handlePurgeCache} className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderColor: '#8b5cf6', color: '#8b5cf6' }}>
                  Purge Cache
                </button>
              </div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem', borderLeft: '4px solid var(--success)' }}>
            <div style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.2rem', fontWeight: '500' }}>Total Bookings</p>
              <h3 style={{ fontSize: '1.6rem', fontWeight: '800' }}>{stats.totalBookings}</h3>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem', borderLeft: '4px solid var(--warning)' }}>
            <div style={{ background: 'rgba(251,191,36,0.1)', color: 'var(--warning)', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path><circle cx="7" cy="17" r="2"></circle><path d="M9 17h6"></path><circle cx="17" cy="17" r="2"></circle></svg>
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.2rem', fontWeight: '500' }}>Active Fleet</p>
              <h3 style={{ fontSize: '1.6rem', fontWeight: '800' }}>{stats.activeCars}</h3>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem', borderLeft: '4px solid #f43f5e' }}>
            <div style={{ background: 'rgba(244,63,94,0.1)', color: '#f43f5e', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.2rem', fontWeight: '500' }}>Total Revenue</p>
              <h3 style={{ fontSize: '1.6rem', fontWeight: '800' }}>₹{stats.totalRevenue?.toLocaleString()}</h3>
            </div>
          </div>
        </div>
      )}

      {/* ─── Cars Tab ──────────────────────────────────────────────── */}
      {activeTab === 'cars' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
          {/* Car Form */}
          <div className="card" style={{ alignSelf: 'start' }}>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.3rem' }}>{editingId ? 'Edit Car' : 'Add Car to Fleet'}</h2>
            <form onSubmit={handleCarSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Car Name</label>
                  <input type="text" className="input" value={carForm.name} onChange={e => setCarForm({ ...carForm, name: e.target.value })} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Brand</label>
                  <input type="text" className="input" value={carForm.brand} onChange={e => setCarForm({ ...carForm, brand: e.target.value })} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Type</label>
                  <select className="input" value={carForm.type} onChange={e => setCarForm({ ...carForm, type: e.target.value })}>
                    <option>SUV</option><option>Sedan</option><option>Hatchback</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Fuel Type</label>
                  <select className="input" value={carForm.fuelType} onChange={e => setCarForm({ ...carForm, fuelType: e.target.value })}>
                    <option>Petrol</option><option>Diesel</option><option>Electric</option><option>Hybrid</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Price/Day (₹)</label>
                  <input type="number" step="0.01" className="input" value={carForm.pricePerDay} onChange={e => setCarForm({ ...carForm, pricePerDay: e.target.value })} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Location</label>
                  <input type="text" className="input" value={carForm.location} onChange={e => setCarForm({ ...carForm, location: e.target.value })} />
                </div>
              </div>

              {/* Admin Car Photo Upload */}
              <div style={{ margin: '1rem 0' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Car Photo</label>
                <div style={{ border: '1px dashed var(--glass-border)', borderRadius: 'var(--radius-sm)', padding: '1rem', textAlign: 'center', position: 'relative', background: 'var(--bg-secondary)', minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {carForm.image ? (
                    <div style={{ position: 'relative' }}>
                      <img src={carForm.image} alt="Preview" style={{ height: '80px', borderRadius: '4px' }} />
                      <button type="button" onClick={() => setCarForm({ ...carForm, image: '' })} style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer' }}>×</button>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Click to upload car image</span>
                  )}
                  <input type="file" accept="image/*" onChange={handleFileChange} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1rem 0' }}>
                <input type="checkbox" id="available" checked={carForm.available} onChange={e => setCarForm({ ...carForm, available: e.target.checked })} />
                <label htmlFor="available" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>Available for booking</label>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editingId ? 'Update Car' : 'Add Car'}</button>
                {editingId && <button type="button" onClick={resetForm} className="btn btn-outline">Cancel</button>}
              </div>
            </form>
          </div>

          {/* Car List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Fleet ({cars.length})</h2>
            {cars.map(car => (
              <div key={car.id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h4 style={{ margin: 0 }}>{car.brand} {car.name}</h4>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{car.type} • {car.fuelType} • {car.location} • ₹{car.pricePerDay}/day</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: car.available ? 'var(--success)' : 'var(--danger)', fontWeight: '600' }}>
                    {car.available ? '● Live' : '● Off'}
                  </span>
                  <button onClick={() => handleEdit(car)} className="btn btn-outline" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}>Edit</button>
                  <button onClick={() => handleDelete(car.id)} className="btn btn-outline" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Bookings Tab ──────────────────────────────────────────── */}
      {activeTab === 'bookings' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1rem' }}>
          {bookings.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No bookings yet.</p>
          ) : (
            bookings.map(b => (
              <div key={b.id} className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div>
                    <h4 style={{ margin: 0 }}>{b.car?.brand} {b.car?.name}</h4>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>by {b.user?.name || `User #${b.user?.id}`}</span>
                  </div>
                  <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', letterSpacing: '0.05rem', fontWeight: '700', color: statusStyle(b.status).color, backgroundColor: statusStyle(b.status).bg, border: `1px solid ${statusStyle(b.status).color}20` }}>
                    {b.returnRequestedAt
                      ? "RETURN REQUESTED"
                      : b.status}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>

                  <span>{b.startDate} → {b.endDate}</span>
                  <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>₹{b.totalPrice}</span>
                </div>
                {b.returnRequestedAt && (
                  <div
                    style={{
                      marginTop: "12px",
                      padding: "10px",
                      background: "#fff8e6",
                      border: "1px solid #ffd54f",
                      borderRadius: "8px",
                      fontSize: "0.9rem"
                    }}
                  >
                    <strong>🟠 Return Requested</strong>

                    <br />

                    <small>
                      {new Date(b.returnRequestedAt).toLocaleString()}
                    </small>
                  </div>
                )}
                {b.utr && (
                  <div style={{ padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: '4px', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontWeight: 'bold' }}>UTR:</span> {b.utr}
                  </div>
                )}
                {b.status === 'AWAITING_VERIFICATION' && (
                  <button onClick={() => handleConfirmPayment(b.id)} className="btn btn-primary" style={{ width: '100%', fontSize: '0.85rem', padding: '0.5rem', marginTop: '0.5rem', background: 'var(--success)' }}>
                    Confirm Payment & Book
                  </button>
                )}
                {b.status === "ACTIVE" && b.returnRequestedAt && (

                  <button
                    className="btn btn-primary"
                    style={{
                      width: "100%",
                      marginTop: "10px",
                      background: "var(--success)"
                    }}
                    onClick={() => handleApproveReturn(b.id)}
                  >
                    ✅ Approve Return
                  </button>

                )}

              </div>
            ))
          )}
        </div>
      )}

      {/* ─── Notifications Tab ─────────────────────────────────────── */}
      {activeTab === 'notifications' && (
        <div className="card" style={{ maxHeight: '600px', overflowY: 'auto' }}>
          <h2 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', fontSize: '1.3rem' }}>System Alerts</h2>
          {notifications.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No alerts.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {notifications.map(n => (
                <li key={n.id} style={{ padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', marginBottom: '0.5rem', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--accent-primary)' }}>
                  <p style={{ margin: 0, fontWeight: '500' }}>{n.message}</p>
                  <small style={{ color: 'var(--text-secondary)' }}>{new Date(n.createdAt).toLocaleString()}</small>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {/* ─── Host Approvals Tab ────────────────────────────────────── */}
      {activeTab === 'approvals' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {hostCars.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>No pending host approvals.</p>
          ) : (
            hostCars.map(car => (
              <div key={car.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {car.image && <img src={car.image} alt={car.name} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />}
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <h4 style={{ margin: 0 }}>{car.brand} {car.name}</h4>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--warning)', background: 'rgba(245,158,11,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>PENDING</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Owner: {car.owner?.name} ({car.owner?.email})</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{car.type} • {car.fuelType} • {car.location} • ₹{car.pricePerDay}/day</p>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleHostAction(car.id, 'approve')} className="btn btn-primary" style={{ flex: 1, background: 'var(--success)', boxShadow: 'none', padding: '0.5rem', fontSize: '0.85rem' }}>Approve</button>
                    <button onClick={() => handleHostAction(car.id, 'reject')} className="btn btn-outline" style={{ flex: 1, borderColor: 'var(--danger)', color: 'var(--danger)', padding: '0.5rem', fontSize: '0.85rem' }}>Reject</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      {/* ─── User Verification Tab ───────────────────────────────────── */}

      {activeTab === "users" && (

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(350px,1fr))",
            gap: "1rem"
          }}
        >

          {pendingUsers.length === 0 ? (

            <p>No pending user verification requests.</p>

          ) : (

            pendingUsers.map(user => (

              <div
                key={user.id}
                className="card"
                style={{ padding: "1.5rem" }}
              >

                <h3>{user.name}</h3>

                <p>{user.email}</p>

                <p>
                  <strong>License Number</strong>
                  <br />
                  {user.drivingLicenseNumber}
                </p>

                {/* Driving License */}

                <div style={{ marginTop: "15px" }}>

                  <strong>Driving License</strong>

                  <br />

                  {user.drivingLicenseImage ? (

                    <a
                      href={user.drivingLicenseImage.startsWith('http') ? user.drivingLicenseImage : `${(import.meta.env.VITE_API_URL || "http://localhost:8080/api").replace("/api", "")}/licenses/${user.drivingLicenseImage}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline"
                      style={{ marginTop: "10px" }}
                    >
                      👁 View License
                    </a>

                  ) : (

                    <p style={{ color: "gray" }}>
                      Not Uploaded
                    </p>

                  )}

                </div>

                {/* Government ID */}

                <div style={{ marginTop: "20px" }}>

                  <strong>Government ID</strong>

                  <br />

                  {user.idProofImage ? (

                    <a
                      href={user.idProofImage.startsWith('http') ? user.idProofImage : `${(import.meta.env.VITE_API_URL || "http://localhost:8080/api").replace("/api", "")}/licenses/${user.idProofImage}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline"
                      style={{ marginTop: "10px" }}
                    >
                      🪪 View ID Proof
                    </a>

                  ) : (

                    <p style={{ color: "gray" }}>
                      Not Uploaded
                    </p>

                  )}

                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "20px"
                  }}
                >

                  <button
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    onClick={() => handleApproveUser(user.id)}
                  >

                    Approve

                  </button>

                  <button
                    className="btn btn-outline"
                    style={{
                      flex: 1,
                      borderColor: "red",
                      color: "red"
                    }}
                    onClick={() => handleRejectUser(user.id)}
                  >

                    Reject

                  </button>

                </div>

              </div>

            ))

          )}

        </div>

      )}

      {/* ─── System Tab ────────────────────────────────────────────── */}
      {activeTab === 'system' && (
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>System Health & Monitoring</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--success)' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>API Status</p>
              <h3 style={{ color: sysStatus.status === 'UP' ? 'var(--success)' : 'var(--danger)' }}>{sysStatus.status}</h3>
            </div>
            <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--accent-primary)' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>DB Connection</p>
              <h3 style={{ color: sysStatus.db === 'UP' ? 'var(--success)' : 'var(--danger)' }}>{sysStatus.db}</h3>
            </div>
            <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--warning)' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Server Uptime</p>
              <h3>{metrics.uptime} mins</h3>
            </div>
            <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid #f43f5e' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Total HTTP Requests</p>
              <h3>{metrics.requests}</h3>
            </div>
          </div>

          <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(99,102,241,0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)' }}>
            <h4 style={{ marginBottom: '1rem' }}>Cache Management</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              The application uses Redis to cache car listings and search results for optimal performance.
              If you update the database manually, you can purge the cache here.
            </p>
            <button onClick={handlePurgeCache} className="btn btn-primary" style={{ background: 'var(--accent-primary)' }}>
              Purge All Caches
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
