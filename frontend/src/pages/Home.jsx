import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from '../components/HeroSection';

const Home = () => {
  const [cars, setCars] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch((import.meta.env.VITE_API_URL) + '/cars')
      .then(res => res.ok ? res.json() : { content: [] })
      .then(data => {
        const carsData = data.content || data || [];
        if (Array.isArray(carsData)) {
          setCars(carsData.filter(c => c.available).slice(0, 6));
        }
      })
      .catch(err => {
        console.error('Error fetching cars:', err);
        setCars([]);
      });
  }, []);

  const typeColor = (type) => {
    switch (type) {
      case 'SUV': return 'var(--success)';
      case 'Sedan': return 'var(--accent-primary)';
      case 'Hatchback': return 'var(--warning)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <HeroSection />

      {/* Packages Section */}
      <div className="container mx-auto py-20" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ width: '100%', margin: '0 auto', textAlign: 'left' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Special <span className="text-gradient">Rental Packages</span></h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Exclusive deals for extended trips and special occasions.</p>
          
          <div style={{ display: 'flex', overflowX: 'auto', gap: '2rem', paddingBottom: '1rem', scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }} className="no-scrollbar">
            
            <div className="card" style={{ flex: '0 0 320px', scrollSnapAlign: 'start', padding: '2rem' }}>
              <div style={{ background: 'var(--accent-gradient)', color: 'white', display: 'inline-block', padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>20% OFF</div>
              <h4 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Weekend Getaway</h4>
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Rent any SUV for the weekend and save on total pricing.</p>
              <button onClick={() => navigate('/cars')} className="btn btn-outline" style={{ width: '100%' }}>Browse SUVs</button>
            </div>

            <div className="card" style={{ flex: '0 0 320px', scrollSnapAlign: 'start', padding: '2rem' }}>
              <div style={{ background: 'var(--warning)', color: 'white', display: 'inline-block', padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>POPULAR</div>
              <h4 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Monthly Commuter</h4>
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Flat-rate sedans with unlimited mileage for monthly rentals.</p>
              <button onClick={() => navigate('/cars')} className="btn btn-outline" style={{ width: '100%' }}>Browse Sedans</button>
            </div>

            <div className="card" style={{ flex: '0 0 320px', scrollSnapAlign: 'start', padding: '2rem' }}>
              <div style={{ background: 'var(--success)', color: 'white', display: 'inline-block', padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>NEW</div>
              <h4 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>City Explorer</h4>
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Compact hatchbacks perfect for navigating city streets.</p>
              <button onClick={() => navigate('/cars')} className="btn btn-outline" style={{ width: '100%' }}>Browse Hatchbacks</button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Featured Cars Section */}
      <div className="snap-section container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--spacing-lg)', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '2rem' }}>Featured <span className="text-gradient">Fleet</span></h2>
            <p style={{ color: 'var(--text-secondary)' }}>Top picks from our live inventory.</p>
          </div>
          <button onClick={() => navigate('/cars')} className="btn btn-outline" style={{ fontSize: '0.9rem' }}>View All Cars →</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {cars.map(car => (
            <div key={car.id} className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '1.5rem 1.5rem 1rem', background: 'linear-gradient(135deg, var(--bg-secondary) 0%, transparent 100%)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '600', color: typeColor(car.type), background: `${typeColor(car.type)}15`, padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)' }}>{car.type}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>📍 {car.location}</span>
                </div>
                <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{car.name}</h3>
                <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0', fontSize: '0.95rem' }}>{car.brand} • {car.fuelType}</p>
              </div>
              <div style={{ padding: '0 1.5rem 1.5rem', marginTop: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--accent-primary)' }}>₹{car.pricePerDay}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}> / day</span>
                  </div>
                </div>
                <button onClick={() => navigate('/cars')} className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {cars.length === 0 && (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--text-secondary)' }}>
            <p>No cars available. Start the backend to load inventory.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
