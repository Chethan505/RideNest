import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return position === null ? null : <Marker position={position} />;
};

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCity, setSelectedCity] = useState('');
  const [availabilityMsg, setAvailabilityMsg] = useState({ text: '', type: '' });
  
  // New State variables for autocomplete and mapping
  const [suggestions, setSuggestions] = useState([]);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mapPin, setMapPin] = useState({ lat: 20.5937, lng: 78.9629 }); // Default center: India

  const availableCities = ['delhi', 'mumbai', 'bangalore', 'pune', 'hyderabad', 'chennai'];
  const allCitiesDB = ['delhi', 'mumbai', 'bangalore', 'pune', 'hyderabad', 'chennai', 'kolkata', 'ahmedabad', 'jaipur', 'surat', 'lucknow', 'kanpur'];

  const slides = [
    {
      image: '/mercedes.png',
      title1: 'Simplify Your Journey.',
      title2: 'Rent with Confidence.',
      subtitle: 'Discover a seamless vehicle rental experience tailored for your convenience. From practical commuters to luxury rides, we have you covered.'
    },
    {
      image: '/audi.png',
      title1: 'Monthly Subscription.',
      title2: 'Drive Without Limits.',
      subtitle: 'Need a vehicle long-term? Enjoy flexible, flat-rate monthly subscription plans featuring premium maintenance and unlimited mileage packages.'
    },
    {
      image: '/bmw.png',
      title1: 'Yearly Subscription.',
      title2: 'Ultimate Freedom.',
      subtitle: 'Experience ownership without the commitment. Secure the lowest rates and swap between our luxury vehicles throughout the year with annual plans.'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const scrollToVehicles = () => {
    document.getElementById('vehicles-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCheckAvailability = (e) => {
    e.preventDefault();
    if (!selectedCity) return;
    if (availableCities.includes(selectedCity.toLowerCase().trim())) {
      setAvailabilityMsg({ text: `Great news! We are currently operating a fleet in ${selectedCity.charAt(0).toUpperCase() + selectedCity.slice(1)}.`, type: 'success' });
    } else {
      setAvailabilityMsg({ text: `Sorry, we are not currently available in ${selectedCity.charAt(0).toUpperCase() + selectedCity.slice(1)}. We are expanding soon!`, type: 'error' });
    }
  };

  const reverseGeocode = async (lat, lon) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      const data = await res.json();
      const city = data.address.city || data.address.state_district || data.address.town || '';
      if (city) {
        setSelectedCity(city);
        setAvailabilityMsg({ text: `Located you in ${city}. Click Check to verify availability.`, type: 'success' });
      }
    } catch(err) {
      console.error(err);
    }
  };

  const handleCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        reverseGeocode(position.coords.latitude, position.coords.longitude);
      });
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleConfirmMapLocation = () => {
    reverseGeocode(mapPin.lat, mapPin.lng);
    setIsMapModalOpen(false);
  };

  return (
    <div className="hero-section" style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', paddingTop: 0, overflow: 'hidden' }}>
      
      {/* Background Carousel Effect */}
      {slides.map((slide, index) => (
        <div 
          key={index} 
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            opacity: currentSlide === index ? 0.85 : 0,
            transition: 'opacity 1.5s ease-in-out',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            paddingRight: '5%',
            zIndex: -1,
            pointerEvents: 'none'
          }}
        >
          {/* Accent glow behind car */}
          <div style={{ position: 'absolute', width: '600px', height: '600px', background: 'var(--accent-gradient)', filter: 'blur(100px)', opacity: 0.15, borderRadius: '50%', right: '10%' }}></div>
          <img 
            src={slide.image} 
            alt="Luxury Fleet Background" 
            style={{ width: '100%', maxWidth: '750px', objectFit: 'contain', transform: currentSlide === index ? 'scale(1) translateX(0)' : 'scale(0.95) translateX(50px)', transition: 'transform 2s ease-out, opacity 1.5s ease', filter: 'drop-shadow(0 20px 25px rgba(0,0,0,0.15))' }}
          />
        </div>
      ))}

      <div style={{ zIndex: 2, padding: '0 5%' }}>
        <h1 className="hero-title" key={`title-${currentSlide}`} style={{ animation: 'fadeInUp 0.8s ease-out', marginTop: '-12px' }}>
          {slides[currentSlide].title1}<br />
          <span className="text-gradient">{slides[currentSlide].title2}</span>
        </h1>
        <p className="hero-subtitle" key={`sub-${currentSlide}`} style={{ animation: 'fadeInUp 1s ease-out' }}>
          {slides[currentSlide].subtitle}
        </p>
        <div className="hero-actions" style={{ justifyContent: 'flex-start', marginTop: '1rem' }}>
          {localStorage.getItem('user') ? (
            <button onClick={scrollToVehicles} className="btn btn-primary hero-btn" style={{ padding: '0.85rem 1.5rem' }}>Browse Vehicles</button>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline hero-btn" style={{ padding: '0.85rem 1.5rem' }}>Login</Link>
              <Link to="/signup" className="btn btn-primary hero-btn" style={{ padding: '0.85rem 1.5rem' }}>Sign Up</Link>
            </>
          )}
        </div>

        {/* Sleek, Narrow Availability Checker Widget */}
        <div style={{ marginTop: '1.5rem', maxWidth: '550px', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', position: 'relative' }}>
          <form style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', position: 'relative' }} onSubmit={handleCheckAvailability}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Check location availability (e.g. Mumbai)..." 
                value={selectedCity}
                onChange={(e) => { 
                  const val = e.target.value; 
                  setSelectedCity(val); 
                  setAvailabilityMsg({text:'', type:''}); 
                  if(val.length > 0) {
                     setSuggestions(allCitiesDB.filter(c => c.toLowerCase().startsWith(val.toLowerCase())));
                  } else {
                     setSuggestions([]);
                  }
                }}
                style={{ width: '100%', padding: '0.7rem 1.2rem', borderRadius: '50px', border: 'none', background: 'rgba(255,255,255,0.95)', color: '#111', outline: 'none', fontSize: '0.9rem' }}
                required 
              />
              {suggestions.length > 0 && (
                <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', listStyle: 'none', padding: 0, margin: '0.5rem 0 0 0', borderRadius: '12px', boxShadow: '0 10px 20px rgba(0,0,0,0.2)', overflow: 'hidden', zIndex: 20 }}>
                  {suggestions.map(s => (
                    <li key={s} onClick={() => { setSelectedCity(s.charAt(0).toUpperCase() + s.slice(1)); setSuggestions([]); }} style={{ padding: '0.75rem 1.25rem', cursor: 'pointer', borderBottom: '1px solid #eee', color: '#111', fontSize: '0.9rem' }}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <button type="button" onClick={handleCurrentLocation} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0 0.25rem', opacity: 0.8, display: 'flex' }} title="Use Current Location">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            </button>
            
            <button type="button" onClick={(e) => { e.preventDefault(); setIsMapModalOpen(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0 0.25rem', marginRight: '0.25rem', opacity: 0.8, display: 'flex' }} title="Choose on Interactive Map">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
            </button>

            <button type="submit" className="btn btn-primary" style={{ padding: '0.7rem 1.7rem', borderRadius: '50px', fontSize: '0.9rem' }}>Check</button>
          </form>
          
          {availabilityMsg.text && (
            <div style={{ position: 'absolute', top: '120%', left: 0, right: 0, padding: '0.75rem', borderRadius: '12px', fontSize: '0.85rem', backgroundColor: availabilityMsg.type === 'success' ? 'rgba(40, 167, 69, 0.95)' : 'rgba(220, 53, 69, 0.95)', color: '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', zIndex: 10 }}>
              {availabilityMsg.text}
            </div>
          )}
        </div>
        
        {/* Carousel Indicators */}
        <div style={{ position: 'absolute', bottom: '2rem', right: '5%', display: 'flex', gap: '0.5rem', zIndex: 10 }}>
          {slides.map((_, i) => (
            <div 
              key={i} 
              onClick={() => setCurrentSlide(i)}
              style={{
                width: currentSlide === i ? '30px' : '10px',
                height: '10px',
                borderRadius: '5px',
                background: currentSlide === i ? 'var(--accent-primary)' : 'rgba(150, 150, 150, 0.4)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Dark overlay gradient to ensure text readability */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: '40%', bottom: 0, background: 'linear-gradient(to right, var(--bg-primary) 40%, transparent 100%)', zIndex: -1 }}></div>

      {/* Map Modal for Selection */}
      {isMapModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, backdropFilter: 'blur(5px)' }}>
          <div className="card" style={{ width: '90%', maxWidth: '800px', height: '600px', position: 'relative', margin: '1rem', padding: 'var(--spacing-md)', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Select Location on Map</h2>
            <div style={{ flex: 1, borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
              <MapContainer center={[mapPin.lat, mapPin.lng]} zoom={5} style={{ height: '100%', width: '100%', borderRadius: '8px' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={mapPin} setPosition={setMapPin} />
              </MapContainer>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', zIndex: 2 }}>
              <button type="button" onClick={() => setIsMapModalOpen(false)} className="btn btn-outline">Cancel</button>
              <button onClick={handleConfirmMapLocation} className="btn btn-primary">Confirm Location</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};


export default Hero;
