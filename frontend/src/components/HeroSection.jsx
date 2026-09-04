import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaMap, FaLocationArrow, FaCarSide } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return position === null ? null : <Marker position={position} />;
};

const HeroSection = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(1); // Default to Monthly Subscription (Slide 2)
  const [selectedCity, setSelectedCity] = useState('');
  const [availabilityMsg, setAvailabilityMsg] = useState({ text: '', type: '' });
  const [suggestions, setSuggestions] = useState([]);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mapPin, setMapPin] = useState({ lat: 20.5937, lng: 78.9629 });

  const slides = [
    {
      image: '/mercedes.png',
      title1: 'Simplify Your Journey.',
      title2: 'Rent with Confidence.',
      subtitle: 'Discover a seamless vehicle rental experience tailored for your convenience. From luxury rides to daily commuters.'
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
      subtitle: 'Experience ownership without the commitment. Secure the lowest rates and swap luxury vehicles throughout the year.'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const availableCities = ['delhi', 'mumbai', 'bangalore', 'pune', 'hyderabad', 'chennai'];
  const allCitiesDB = ['delhi', 'mumbai', 'bangalore', 'pune', 'hyderabad', 'chennai', 'kolkata', 'ahmedabad', 'jaipur', 'surat', 'lucknow', 'kanpur'];

  const handleCheckAvailability = (e) => {
    e.preventDefault();
    if (selectedCity) {
      navigate(`/cars?location=${selectedCity}`);
    } else {
      setAvailabilityMsg({ text: 'Please select a location first.', type: 'error' });
      setTimeout(() => setAvailabilityMsg({ text: '', type: '' }), 3000);
    }
  };

  const reverseGeocode = async (lat, lon) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      const data = await res.json();
      const city = data.address.city || data.address.state_district || data.address.town || '';
      if (city) {
        setSelectedCity(city);
        setAvailabilityMsg({ text: `Located you in ${city}. Click Check to verify.`, type: 'success' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCurrentLocation = () => {
    if ("geolocation" in navigator) {

      navigator.geolocation.getCurrentPosition(
        (position) => {

          reverseGeocode(
            position.coords.latitude,
            position.coords.longitude
          );

        },

        (error) => {
          console.error(error);
          alert("Unable to get your location.");
        },

        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }

      );

    } else {

      alert("Geolocation is not supported by your browser.");

    }
  };

  const handleConfirmMapLocation = () => {
    reverseGeocode(mapPin.lat, mapPin.lng);
    setIsMapModalOpen(false);
  };

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">

      {/* Background Carousel */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${currentSlide === index ? 'opacity-100' : 'opacity-0'}`}
          style={{ zIndex: -1 }}
        >
          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 blur-[120px] rounded-full"></div>

          {/* Car Image (Right Side Overlay) */}
          <div className={`absolute top-1/2 right-0 -translate-y-1/2 w-full max-w-[800px] px-10 transition-transform duration-2000 ease-out flex justify-end ${currentSlide === index ? 'translate-x-0 scale-100' : 'translate-x-20 scale-95 opacity-0'}`}>
            <img
              src={slide.image}
              alt="Luxury Fleet"
              className="w-full h-auto object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      ))}

      {/* Dark Overlay Gradient for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent z-[-1] hidden md:block"></div>
      <div className="absolute inset-0 bg-white/70 z-[-1] md:hidden"></div>

      {/* Hero Content */}
      <div className="max-w-4xl flex flex-col items-center gap-8 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {slides[currentSlide].title1}<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600">
              {slides[currentSlide].title2}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
            {slides[currentSlide].subtitle}
          </p>
        </div>

        <div className="pt-2 w-full flex justify-center">
          {localStorage.getItem('user') ? (
            <button
              onClick={() => navigate('/cars')}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-4 px-12 rounded-full shadow-2xl shadow-indigo-100 transition-all duration-300 hover:-translate-y-1 active:scale-95 flex items-center gap-4 min-w-[280px] w-fit justify-center"
            >
              <FaCarSide size={24} />
              Browse Vehicles
            </button>
          ) : (
            <div className="flex flex-wrap justify-center gap-6">
              <button
                onClick={() => navigate('/login')}
                className="bg-white text-indigo-600 border-2 border-indigo-500 font-bold py-4 px-12 rounded-full shadow-lg hover:bg-slate-50 transition-all active:scale-95 min-w-[200px]"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-4 px-12 rounded-full shadow-xl shadow-indigo-100 hover:from-indigo-600 hover:to-purple-700 transition-all active:scale-95 min-w-[200px]"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>

        {/* Location Availability Field (Wider - max-w-3xl) */}
        <div className="w-full max-w-3xl mx-auto bg-white/95 backdrop-blur-md p-2 rounded-full shadow-2xl border border-white flex items-center gap-3 mt-8">
          <form className="flex-1 flex items-center px-6 gap-3" onSubmit={handleCheckAvailability}>
            <div className="text-indigo-400">
              <FaMapMarkerAlt size={22} />
            </div>
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Check location availability (e.g. Mumbai)..."
                value={selectedCity}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedCity(val);
                  if (val.length > 0) {
                    setSuggestions(allCitiesDB.filter(c => c.toLowerCase().startsWith(val.toLowerCase())));
                  } else {
                    setSuggestions([]);
                  }
                }}
                className="w-full bg-transparent border-none focus:ring-0 text-slate-800 placeholder:text-slate-400 text-base py-3 outline-none font-medium"
                required
              />
              {/* Autocomplete Dropdown */}
              {suggestions.length > 0 && (
                <ul className="absolute top-full left-0 right-0 mt-4 bg-white rounded-2xl shadow-2xl border border-slate-50 overflow-hidden z-[100] text-left">
                  {suggestions.map(s => (
                    <li
                      key={s}
                      onClick={() => { setSelectedCity(s.charAt(0).toUpperCase() + s.slice(1)); setSuggestions([]); }}
                      className="px-6 py-4 hover:bg-slate-50 cursor-pointer text-slate-700 font-medium border-b border-slate-50 last:border-none"
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Action Icons */}
            <div className="flex items-center gap-3 text-slate-400">
              <button type="button" onClick={handleCurrentLocation} className="hover:text-indigo-500 transition-colors" title="Use Current Location">
                <FaLocationArrow size={18} />
              </button>
              <button type="button" onClick={() => setIsMapModalOpen(true)} className="hover:text-indigo-500 transition-colors" title="Select on Map">
                <FaMap size={18} />
              </button>
            </div>

            <button type="submit" className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold px-10 py-5 rounded-full hover:shadow-lg transition-all whitespace-nowrap text-sm">
              Check Availability
            </button>
          </form>

          {/* Availability Status Message */}
          {availabilityMsg.text && (
            <div className={`absolute top-full left-0 right-0 mt-6 p-4 rounded-3xl text-sm font-bold animate-in fade-in slide-in-from-top-2 border ${availabilityMsg.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-lg shadow-emerald-50' : 'bg-rose-50 text-rose-600 border-rose-100 shadow-lg shadow-rose-50'
              }`}>
              {availabilityMsg.text}
            </div>
          )}
        </div>

        {/* Carousel Indicators */}
        <div className="flex gap-3 justify-center mt-8">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-2 rounded-full transition-all duration-500 ${currentSlide === i ? 'w-10 bg-indigo-500' : 'w-2 bg-slate-200'}`}
            />
          ))}
        </div>
      </div>

      {/* Map Modal */}
      {isMapModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[1000] p-4">
          <div className="bg-white rounded-[40px] w-full max-w-4xl h-[650px] flex flex-col overflow-hidden shadow-2xl border border-white">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-900">Choose on Map</h2>
              <button onClick={() => setIsMapModalOpen(false)} className="text-slate-300 hover:text-slate-600 font-bold text-3xl">×</button>
            </div>
            <div className="flex-1 relative">
              <MapContainer center={[mapPin.lat, mapPin.lng]} zoom={5} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationMarker position={mapPin} setPosition={setMapPin} />
              </MapContainer>
            </div>
            <div className="p-8 border-t border-slate-100 flex justify-end gap-4 bg-slate-50">
              <button onClick={() => setIsMapModalOpen(false)} className="px-8 py-3 font-bold text-slate-400 hover:text-slate-900">Cancel</button>
              <button onClick={handleConfirmMapLocation} className="bg-indigo-600 text-white px-12 py-3 rounded-full font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">Confirm Point</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroSection;