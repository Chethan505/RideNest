import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Safely parse JSON from a response, returning {} on empty/invalid bodies
const safeJson = async (res) => {
  const text = await res.text();
  if (!text) return {};
  try { return JSON.parse(text); } catch { return {}; }
};

const Cars = () => {
  const [cars, setCars] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ type: '', location: '', minPrice: '', maxPrice: '', available: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [dates, setDates] = useState({ start: '', end: '' });
  const [bookingStep, setBookingStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'upi'
  const [upiQrData, setUpiQrData] = useState(null);
  const [utr, setUtr] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [alertModal, setAlertModal] = useState({ show: false, message: '', redirect: '' });
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewInput, setReviewInput] = useState({ rating: 5, comment: '' });
  const [activeTab, setActiveTab] = useState('book'); // 'book' or 'reviews'
  const [canReview, setCanReview] = useState(false);
  const [razorpayKey, setRazorpayKey] = useState('');
  const [upiConfig, setUpiConfig] = useState({ vpa: '', name: '' });
  const navigate = useNavigate();
  const [carRatings, setCarRatings] = useState({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const loc = params.get('location');
    if (loc) {
      const newFilters = { ...filters, location: loc };
      setFilters(newFilters);
      fetchCars(newFilters, 0);
    } else {
      fetchCars(filters, 0);
    }
    fetchRazorpayKey();
  }, []);

  const fetchRazorpayKey = async () => {
    try {
      const res = await fetch(`${API}/payments/key`);
      if (res.ok) {
        const data = await res.json();
        setRazorpayKey(data.keyId);
        if (data.upi) setUpiConfig(data.upi);
      }
    } catch (e) { console.error('Failed to fetch Razorpay key', e); }
  };

  const fetchCars = async (currentFilters = filters, page = 0) => {
    const params = new URLSearchParams();
    if (currentFilters.type) params.append('type', currentFilters.type);
    if (currentFilters.location) params.append('location', currentFilters.location);
    if (currentFilters.minPrice) params.append('minPrice', currentFilters.minPrice);
    if (currentFilters.maxPrice) params.append('maxPrice', currentFilters.maxPrice);
    if (currentFilters.available) params.append('available', currentFilters.available);
    params.append('page', page);
    params.append('size', 10);
    try {
      const res = await fetch(`${API}/cars/filter?${params}`);
      if (res.ok) {
        const data = await res.json();
        const carList = data.content || data || [];

        setCars(carList);
        setFiltered(carList);

        fetchCarRatings(carList);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(page);
      } else {
        console.error('Failed to fetch cars:', res.status);
        setCars([]);
        setFiltered([]);
      }
    } catch (e) {
      console.error('Error in fetchCars:', e);
      setCars([]);
      setFiltered([]);
    }
  };
  const fetchCarRatings = async (cars) => {
    const ratings = {};

    await Promise.all(
      cars.map(async (car) => {
        try {
          const res = await fetch(`${API}/reviews/car/${car.id}/average`);

          if (res.ok) {
            const data = await res.json();

            ratings[car.id] = {
              averageRating: Number(data.averageRating) || 0,
              reviewCount: data.totalReviews || 0
            };
          } else {
            ratings[car.id] = {
              averageRating: 0,
              reviewCount: 0
            };
          }
        } catch (err) {
          ratings[car.id] = {
            averageRating: 0,
            reviewCount: 0
          };
        }
      })
    );

    setCarRatings(ratings);
  };

  const applyFilters = async () => {
    fetchCars(filters, 0);
  };

  const clearFilters = () => {
    setFilters({ type: '', location: '', minPrice: '', maxPrice: '', available: '' });
    fetchCars({ type: '', location: '', minPrice: '', maxPrice: '', available: '' }, 0);
  };

  const handleBookNow = (car) => {
    const userString = localStorage.getItem('user');
    if (!userString) {
      setAlertModal({ show: true, message: 'You must be logged in to book a car. Please login or create an account.', redirect: '/login' });
      return;
    }
    setErrorMsg(''); setSuccessMsg('');
    setSelectedCar(car);
    fetchReviews(car.id);
    fetchAvgRating(car.id);
    fetchEligibility(car.id);
    setBookingStep(1);
    setDates({ start: '', end: '' });
    setPaymentMethod('card');
    setActiveTab('book');
  };

  const fetchReviews = async (carId) => {
    try {
      const res = await fetch(`${API}/reviews/car/${carId}`);
      const data = await res.json();
      setReviews(data);
    } catch (e) { console.error(e); }
  };

  const fetchAvgRating = async (carId) => {
    try {
      const res = await fetch(`${API}/reviews/car/${carId}/average`);
      const data = await res.json();

      setAvgRating(data.averageRating);
    } catch (e) { console.error(e); }
  };



  const handleAddReview = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');

    if (!token) {
      setErrorMsg('Login required to review.');
      return;
    }

    try {
      const res = await fetch(`${API}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bookingId: selectedBooking.id,
          rating: reviewInput.rating,
          comment: reviewInput.comment
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg('Review added!');
        setReviewInput({ rating: 5, comment: '' });

        fetchReviews(selectedCar.id);
        fetchAvgRating(selectedCar.id);

        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setErrorMsg(data.error || data.message || 'Review failed');
      }

    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to add review.');
    }
  };

  const calculateTotal = () => {
    if (!dates.start || !dates.end || !selectedCar) return 0;
    const days = Math.ceil((new Date(dates.end) - new Date(dates.start)) / (1000 * 60 * 60 * 24));
    return days > 0 ? (days * selectedCar.pricePerDay).toFixed(2) : 0;
  };

  const handleContinueToPayment = () => {
    setErrorMsg('');
    if (!dates.start || !dates.end) { setErrorMsg('Please select both start and end dates.'); return; }
    if (new Date(dates.end) <= new Date(dates.start)) { setErrorMsg('End date must be after start date.'); return; }
    setBookingStep(2);
  };

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);

  const createInitialBooking = async () => {
    setErrorMsg('');
    const userString = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!userString || !token) { setErrorMsg('Session expired. Please login again.'); return null; }
    const user = JSON.parse(userString);
    setIsProcessing(true);
    try {
      const res = await fetch(`${API}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ user: { id: user.id }, car: { id: selectedCar.id }, startDate: dates.start, endDate: dates.end })
      });
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('user'); localStorage.removeItem('token'); localStorage.removeItem('refreshToken');
        setErrorMsg('Session expired. Please login again.');
        setTimeout(() => navigate('/login'), 2000);
        return null;
      }
      const data = await safeJson(res);
      if (!res.ok) {
        throw new Error(data.error || 'Booking failed');
      }
      setCurrentBooking(data.booking);
      return data.booking;
    } catch (e) {
      setErrorMsg(e.message);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmBooking = async () => {
    const booking = await createInitialBooking();
    if (!booking) return;

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    setIsProcessing(true);
    try {
      // 2. Create Razorpay Order
      const orderRes = await fetch(`${API}/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ amount: booking.totalPrice })
      });
      if (orderRes.status === 401 || orderRes.status === 403) {
        localStorage.removeItem('user'); localStorage.removeItem('token'); localStorage.removeItem('refreshToken');
        setErrorMsg('Session expired. Please login again.');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }
      const orderData = await safeJson(orderRes);
      if (!orderRes.ok) throw new Error(orderData.error || 'Failed to initialize payment gateway');

      const options = {
        key: razorpayKey || 'YOUR_RAZORPAY_KEY_ID',
        amount: booking.totalPrice * 100, // paise 
        currency: "INR",
        name: "RideNest Rental",
        description: `Booking for ${selectedCar.brand} ${selectedCar.name}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            const verifyRes = await fetch(`${API}/payments/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({
                booking: { id: booking.id },
                amount: booking.totalPrice,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              })
            });
            const verifyData = await safeJson(verifyRes);
            if (verifyRes.ok) {
              setSuccessMsg(`Booking & Payment Confirmed! Txn ID: ${verifyData.transactionId}`);
              setTimeout(() => { setSelectedCar(null); fetchCars(); }, 3000);
            } else {
              setErrorMsg(verifyData.error || 'Payment verification failed.');
            }
          } catch (err) { setErrorMsg('Network error during verification.'); }
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: "#6366f1" }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (e) { setErrorMsg(e.message); } finally { setIsProcessing(false); }
  };

  const handleUpiPayment = () => {
    const total = calculateTotal();
    const vpa = upiConfig.vpa || 'chetanchetan8769-1@okaxis';
    const name = upiConfig.name || 'RideNest';
    // Generate a UPI URI
    const upiUri = `upi://pay?pa=${vpa}&pn=${encodeURIComponent(name)}&am=${total}&cu=INR&tn=Booking_${selectedCar.id}`;
    // Using a public QR code generator API
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUri)}`;
    setUpiQrData(qrUrl);
    setPaymentMethod('upi');
  };

  const verifyUpiMock = async () => {
    if (!utr || utr.length < 6) {
      setErrorMsg('Please enter a valid Transaction ID / UTR (min 6 chars)');
      return;
    }

    // 1. Create initial booking if not already created
    let booking = currentBooking;
    if (!booking) {
      booking = await createInitialBooking();
    }
    if (!booking) return;

    setIsProcessing(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API}/bookings/${booking.id}/submit-upi`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ utr: utr })
      });
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('user'); localStorage.removeItem('token'); localStorage.removeItem('refreshToken');
        setErrorMsg('Session expired. Please login again.');
        setTimeout(() => navigate('/login'), 2000);
        setIsProcessing(false);
        return;
      }
      if (res.ok) {
        setSuccessMsg('Payment submitted for verification! Your booking will be confirmed once the admin approves it.');
        setTimeout(() => { setSelectedCar(null); setUpiQrData(null); setCurrentBooking(null); setUtr(''); fetchCars(); }, 4000);
      } else {
        const data = await safeJson(res);
        setErrorMsg(data.error || 'Failed to submit payment.');
      }
    } catch (e) { setErrorMsg('Connection error during submission.'); }
    setIsProcessing(false);
  };

  const fuelIcon = (fuel) => {
    if (fuel?.toLowerCase().includes('diesel')) return '⛽';
    if (fuel?.toLowerCase().includes('electric')) return '⚡';
    return '🔵';
  };

  const typeColor = (type) => {
    switch (type) {
      case 'SUV': return 'var(--success)';
      case 'Sedan': return 'var(--accent-primary)';
      case 'Hatchback': return 'var(--warning)';
      default: return 'var(--text-secondary)';
    }
  };

  const locations = [...new Set(cars.map(c => c.location).filter(Boolean))];

  return (
    <div style={{ padding: 'var(--spacing-xl) 0', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          Browse <span className="text-gradient">Cars</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          {filtered.length} car{filtered.length !== 1 ? 's' : ''} available for rental
        </p>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '1rem 1.5rem', marginBottom: 'var(--spacing-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <button onClick={() => setShowFilters(!showFilters)} className="btn btn-outline" style={{ fontSize: '0.9rem' }}>
            {showFilters ? '✕ Hide Filters' : '⚙ Filters'}
          </button>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['SUV', 'Sedan', 'Hatchback'].map(t => (
              <button key={t} onClick={() => {
                const newFilters = {
                  ...filters,
                  type: filters.type === t ? '' : t
                };

                setFilters(newFilters);
                fetchCars(newFilters, 0);
              }}
                className={filters.type === t ? 'btn btn-primary' : 'btn btn-outline'}
                style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {showFilters && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Location</label>
              <select className="input" value={filters.location} onChange={e => setFilters({ ...filters, location: e.target.value })} style={{ cursor: 'pointer' }}>
                <option value="">All Locations</option>
                {locations.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Min Price/Day (₹)</label>
              <input type="number" className="input" placeholder="0" value={filters.minPrice} onChange={e => setFilters({ ...filters, minPrice: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Max Price/Day (₹)</label>
              <input type="number" className="input" placeholder="5000" value={filters.maxPrice} onChange={e => setFilters({ ...filters, maxPrice: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Availability</label>
              <select className="input" value={filters.available} onChange={e => setFilters({ ...filters, available: e.target.value })} style={{ cursor: 'pointer' }}>
                <option value="">All</option>
                <option value="true">Available</option>
                <option value="false">Unavailable</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
              <button onClick={applyFilters} className="btn btn-primary" style={{ flex: 1, padding: '0.7rem' }}>Apply</button>
              <button onClick={clearFilters} className="btn btn-outline" style={{ padding: '0.7rem' }}>Clear</button>
            </div>
          </div>
        )}
      </div>

      {/* Cars Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {filtered.map(car => (
          <div key={car.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Card Image */}
            <div style={{ height: '200px', width: '100%', overflow: 'hidden', background: 'var(--bg-secondary)', position: 'relative' }}>
              {car.image ? (
                <img src={car.image} alt={car.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  No Image Available
                </div>
              )}
            </div>

            {/* Card Header */}
            <div style={{ padding: '1.5rem 1.5rem 1rem', background: 'linear-gradient(135deg, var(--bg-secondary) 0%, transparent 100%)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: '600', color: typeColor(car.type), background: `${typeColor(car.type)}15`, padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)' }}>{car.type}</span>
                </div>
                <span style={{ fontSize: '0.85rem', color: car.available ? 'var(--success)' : 'var(--danger)', fontWeight: '600' }}>
                  {car.available ? '● Available' : '● Unavailable'}
                </span>
              </div>
              <h3 style={{ fontSize: '1.4rem', margin: 0 }}>{car.name}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: '0.25rem 0 0' }}>{car.brand}</p>
                <div
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    color: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  {carRatings[car.id]?.reviewCount > 0 ? (
                    <>
                      <span>⭐</span>
                      <span>{carRatings[car.id].averageRating.toFixed(1)}</span>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>
                        ({carRatings[car.id].reviewCount} Reviews)
                      </span>
                    </>
                  ) : (
                    <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>
                      No Reviews
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div style={{ padding: '0 1.5rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{fuelIcon(car.fuelType)} {car.fuelType}</span>
                {car.location && <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>📍 {car.location}</span>}
              </div>

              <div style={{ marginTop: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent-primary)' }}>₹{car.pricePerDay}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}> / day</span>
                  </div>
                </div>
                <button onClick={() => handleBookNow(car)} disabled={!car.available}
                  className={car.available ? 'btn btn-primary' : 'btn btn-outline'}
                  style={{ width: '100%', padding: '0.75rem', opacity: car.available ? 1 : 0.5, cursor: car.available ? 'pointer' : 'not-allowed' }}>
                  {car.available ? 'Book Now' : 'Not Available'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
          <button
            disabled={currentPage === 0}
            onClick={() => fetchCars(filters, currentPage - 1)}
            className="btn btn-outline"
          >
            Previous
          </button>
          <span style={{ color: 'var(--text-secondary)' }}>
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages - 1}
            onClick={() => fetchCars(filters, currentPage + 1)}
            className="btn btn-outline"
          >
            Next
          </button>
        </div>
      )}

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: '1.2rem' }}>No cars match your filters.</p>
          <button onClick={clearFilters} className="btn btn-outline" style={{ marginTop: '1rem' }}>Clear Filters</button>
        </div>
      )}

      {/* Booking Modal */}
      {selectedCar && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)', padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '440px', width: '100%', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setSelectedCar(null)} style={{ position: 'absolute', top: '12px', right: '16px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>&times;</button>

            <h2 style={{ marginBottom: '0.25rem' }}>{selectedCar.brand} {selectedCar.name}</h2>

            {/* Modal Tabs */}
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--glass-border)', marginBottom: '1.5rem' }}>
              <button
                onClick={() => setActiveTab('book')}
                style={{ padding: '0.5rem 1rem', border: 'none', background: 'none', cursor: 'pointer', borderBottom: activeTab === 'book' ? '3px solid var(--accent-primary)' : 'none', color: activeTab === 'book' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: '700' }}
              >
                Booking
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                style={{ padding: '0.5rem 1rem', border: 'none', background: 'none', cursor: 'pointer', borderBottom: activeTab === 'reviews' ? '3px solid var(--accent-primary)' : 'none', color: activeTab === 'reviews' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: '700' }}
              >
                Reviews ({reviews.length})
              </button>
            </div>

            {errorMsg && <div style={{ padding: '0.75rem', marginBottom: '1rem', backgroundColor: 'var(--danger)', color: 'white', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>{errorMsg}</div>}
            {successMsg && <div style={{ padding: '0.75rem', marginBottom: '1rem', backgroundColor: 'var(--success)', color: 'white', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', textAlign: 'center' }}><strong>{successMsg}</strong></div>}

            {activeTab === 'book' ? (
              <>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>{bookingStep === 1 ? 'Select Dates' : 'Confirm Booking'}</h3>
                {bookingStep === 1 && !successMsg && (
                  <>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Pickup Date</label>
                        <input type="date" className="input" min={new Date().toISOString().split('T')[0]} value={dates.start} onChange={e => setDates({ ...dates, start: e.target.value })} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Return Date</label>
                        <input type="date" className="input" min={dates.start || new Date().toISOString().split('T')[0]} value={dates.end} onChange={e => setDates({ ...dates, end: e.target.value })} />
                      </div>
                    </div>

                    {dates.start && dates.end && calculateTotal() > 0 && (
                      <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                          <span>₹{selectedCar.pricePerDay} × {Math.ceil((new Date(dates.end) - new Date(dates.start)) / 86400000)} days</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1.2rem' }}>
                          <span>Total</span>
                          <span className="text-gradient">₹{calculateTotal()}</span>
                        </div>
                      </div>
                    )}

                    <button onClick={handleContinueToPayment} className="btn btn-primary" style={{ width: '100%' }}>Continue to Payment →</button>
                  </>
                )}

                {bookingStep === 2 && !successMsg && (
                  <>
                    <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Dates</span>
                        <span>{dates.start} → {dates.end}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1.1rem' }}>
                        <span>Total</span>
                        <span className="text-gradient">₹{calculateTotal()}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                      <button
                        onClick={() => setPaymentMethod('card')}
                        className={paymentMethod === 'card' ? 'btn btn-primary' : 'btn btn-outline'}
                        style={{ flex: 1, fontSize: '0.8rem' }}
                      >
                        💳 Card/Netbanking
                      </button>
                      <button
                        onClick={handleUpiPayment}
                        className={paymentMethod === 'upi' ? 'btn btn-primary' : 'btn btn-outline'}
                        style={{ flex: 1, fontSize: '0.8rem' }}
                      >
                        📱 UPI QR Code
                      </button>
                    </div>

                    {paymentMethod === 'card' ? (
                      <>
                        <div style={{ padding: '1rem', background: 'rgba(99,102,241,0.1)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', border: '1px solid var(--accent-primary)20' }}>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', margin: 0 }}>
                            Secure payment via <strong>Razorpay</strong>. You can pay using Credit/Debit Card, UPI, or Netbanking in the next step.
                          </p>
                        </div>
                        <button onClick={confirmBooking} disabled={isProcessing} className="btn btn-primary" style={{ width: '100%', background: 'var(--success)', boxShadow: '0 4px 15px rgba(16,185,129,0.4)', opacity: isProcessing ? 0.7 : 1, cursor: isProcessing ? 'not-allowed' : 'pointer' }}>
                          {isProcessing ? 'Processing...' : 'Proceed to Secure Payment'}
                        </button>
                      </>
                    ) : (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'inline-block', marginBottom: '1rem', border: '1px solid var(--glass-border)' }}>
                          <img src={upiQrData} alt="UPI QR Code" style={{ width: '200px', height: '200px' }} />
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                          Scan this QR using any UPI app (GPay, PhonePe, Paytm) to pay <strong>₹{calculateTotal()}</strong>
                        </p>

                        <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
                          <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.4rem' }}>Transaction ID / UTR</label>
                          <input
                            type="text"
                            placeholder="Enter 12-digit UTR number"
                            className="input"
                            value={utr}
                            onChange={(e) => setUtr(e.target.value)}
                            style={{ width: '100%', padding: '0.8rem' }}
                          />
                        </div>

                        <button onClick={verifyUpiMock} disabled={isProcessing} className="btn btn-primary" style={{ width: '100%', background: 'var(--accent-primary)' }}>
                          {isProcessing ? 'Submitting...' : 'Submit Payment for Verification'}
                        </button>
                      </div>
                    )}
                    <button onClick={() => setBookingStep(1)} className="btn btn-outline" style={{ width: '100%', marginTop: '0.5rem' }}>
                      ← Back to Dates
                    </button>
                  </>
                )}
              </>
            ) : (
              <div style={{ paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '2rem' }}>⭐</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: '800' }}>{avgRating.toFixed(1)}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>/ 5.0 Rating</span>
                </div>

                {localStorage.getItem('user') ? (
                  canReview ? (
                    <form onSubmit={handleAddReview} className="card" style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', marginBottom: '1.5rem' }}>
                      <h4 style={{ marginBottom: '0.8rem' }}>Write a Review</h4>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        {[1, 2, 3, 4, 5].map(num => (
                          <button
                            key={num} type="button"
                            onClick={() => setReviewInput({ ...reviewInput, rating: num })}
                            style={{ fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', filter: num <= reviewInput.rating ? 'none' : 'grayscale(100%) opacity(0.3)' }}
                          >
                            ⭐
                          </button>
                        ))}
                      </div>
                      <textarea
                        className="input"
                        placeholder="Share your experience with this vehicle..."
                        rows="3"
                        style={{ marginBottom: '1rem', resize: 'none' }}
                        value={reviewInput.comment}
                        onChange={e => setReviewInput({ ...reviewInput, comment: e.target.value })}
                        required
                      />
                      <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Post Review</button>
                    </form>
                  ) : (
                    <div style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', textAlign: 'center', border: '1px dashed var(--glass-border)' }}>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Only users who have booked this car can leave a review.</p>
                      <button onClick={() => setActiveTab('book')} style={{ color: 'var(--accent-primary)', background: 'none', border: 'none', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}>Book now to share your experience!</button>
                    </div>
                  )
                ) : (
                  <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Please log in to leave a review.</p>
                  </div>
                )}

                <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                  {reviews.length > 0 ? (
                    reviews.map(r => (
                      <div key={r.id} style={{ padding: '1rem 0', borderBottom: '1px solid var(--glass-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                          <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{r.user.name}</span>
                          <span style={{ fontWeight: '700', color: 'var(--accent-primary)' }}>{'⭐'.repeat(r.rating)}</span>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{r.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0' }}>No reviews yet. Be the first!</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Alert Modal */}
      {alertModal.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, backdropFilter: 'blur(5px)' }}>
          <div className="card" style={{ maxWidth: '400px', width: '100%', margin: '1rem', textAlign: 'center', padding: 'var(--spacing-xl)' }}>
            <h2 style={{ marginBottom: '1rem', color: 'var(--danger)' }}>Action Required</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.1rem', lineHeight: '1.6' }}>{alertModal.message}</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button onClick={() => setAlertModal({ show: false, message: '', redirect: '' })} className="btn btn-outline">Cancel</button>
              <button onClick={() => navigate(alertModal.redirect)} className="btn btn-primary">Proceed</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cars;
