import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    phoneNumber: '',
    address: ''

  });

  const navigate = useNavigate();

  useEffect(() => {

    const loadProfile = async () => {

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/auth/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (!res.ok) {
          navigate("/login");
          return;
        }

        const latestUser = await res.json();

        setUser(latestUser);

        localStorage.setItem(
          "user",
          JSON.stringify(latestUser)
        );

        setPreview(
          latestUser.profilePicture ||
          `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`
        );

        setFormData({
          name: latestUser.name || "",
          dateOfBirth: latestUser.dateOfBirth || "",
          phoneNumber: latestUser.phoneNumber || "",
          address: latestUser.address || ""
        });

      } catch (err) {
        console.error(err);
      }

    };

    loadProfile();

  }, [navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const saveProfile = async () => {
    const token = localStorage.getItem('token');
    try {
      // Save profile picture
      await fetch(`${import.meta.env.VITE_API_URL}/auth/${user.id}/picture`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ profilePicture: preview })
      });

      // Save profile data
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/${user.id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Profile updated successfully!');
        const updatedUser = { ...data.user, profilePicture: preview };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      } else {
        setMessage('Failed to update profile.');
      }
    } catch (err) {
      setMessage('Network error.');
    }
  };




  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
    window.location.reload();
  };

  if (!user) return null;

  // Calculate profile progress
  let isPicDefault = !user.profilePicture;
  const actualFilled = [user.name, user.dateOfBirth, user.phoneNumber, user.address].filter(field => field && field.trim() !== '').length + (isPicDefault ? 0 : 1);
  const progressPercent = Math.round((actualFilled / 5) * 100);

  return (
    <div style={{ padding: 'var(--spacing-xl) 0', maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%', marginBottom: '1rem' }}>
        <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>
          &larr; Back
        </button>
      </div>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{ marginBottom: 'var(--spacing-sm)' }}>My Profile</h2>

        {/* Progress Bar */}
        <div style={{ width: '100%', marginBottom: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Profile Completion</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{progressPercent}%</span>
          </div>
          <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: progressPercent === 100 ? 'var(--success)' : 'var(--accent-primary)', transition: 'width 0.3s ease' }}></div>
          </div>
        </div>

        {message && (
          <div style={{ padding: '0.5rem', marginBottom: '1rem', backgroundColor: 'var(--success)', color: 'white', borderRadius: '4px', width: '100%', textAlign: 'center' }}>
            {message}
          </div>
        )}

        <div style={{ position: 'relative', marginBottom: 'var(--spacing-md)' }}>
          <img
            src={preview}
            alt="Profile"
            style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent-primary)', backgroundColor: 'var(--bg-secondary)' }}
          />
        </div>

        <div style={{ marginBottom: 'var(--spacing-md)', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', width: '100%' }}>
          <label htmlFor="profileData" className="btn btn-outline" style={{ cursor: 'pointer', display: 'block', width: '100%', textAlign: 'center' }}>
            Choose Profile Picture
          </label>
          <input
            id="profileData"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />
        </div>

        <div style={{ width: '100%', borderTop: '1px solid var(--glass-border)', paddingTop: 'var(--spacing-md)', paddingBottom: 'var(--spacing-md)' }}>
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Email Address</label>
            <input type="email" className="input" value={user.email} readOnly style={{ backgroundColor: 'var(--bg-secondary)', opacity: 0.7, cursor: 'not-allowed' }} />
          </div>
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Full Name</label>
            <input type="text" name="name" className="input" value={formData.name} onChange={handleInputChange} style={{ backgroundColor: 'transparent' }} />
          </div>
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Date of Birth</label>
            <input type="date" name="dateOfBirth" className="input" value={formData.dateOfBirth} onChange={handleInputChange} style={{ backgroundColor: 'transparent' }} />
          </div>
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Phone Number</label>
            <input type="tel" name="phoneNumber" className="input" value={formData.phoneNumber} onChange={handleInputChange} style={{ backgroundColor: 'transparent' }} placeholder="+1 (555) 000-0000" />
          </div>
          <div style={{ marginBottom: 'var(--spacing-sm)' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Address</label>
            <input type="text" name="address" className="input" value={formData.address} onChange={handleInputChange} style={{ backgroundColor: 'transparent' }} placeholder="123 Main St, City, State" />
          </div>
        </div>
        <div
          className="card"
          style={{
            marginTop: "2rem",
            marginBottom: "2rem",
            width: "100%",
            padding: "2rem"
          }}
        >

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px"
            }}
          >
            <h3 style={{ margin: 0 }}>
              🪪 Driving License Verification
            </h3>

            {user.verificationStatus === "APPROVED" && (
              <span
                style={{
                  background: "#dcfce7",
                  color: "#15803d",
                  padding: "6px 14px",
                  borderRadius: "999px",
                  fontWeight: "600",
                  fontSize: ".85rem"
                }}
              >
                ✔ VERIFIED
              </span>
            )}

            {user.verificationStatus === "PENDING" && (
              <span
                style={{
                  background: "#fef3c7",
                  color: "#b45309",
                  padding: "6px 14px",
                  borderRadius: "999px",
                  fontWeight: "600",
                  fontSize: ".85rem"
                }}
              >
                🟡 PENDING
              </span>
            )}

            {user.verificationStatus === "REJECTED" && (
              <span
                style={{
                  background: "#fee2e2",
                  color: "#b91c1c",
                  padding: "6px 14px",
                  borderRadius: "999px",
                  fontWeight: "600",
                  fontSize: ".85rem"
                }}
              >
                ✖ REJECTED
              </span>
            )}
          </div>

          <p style={{ color: "var(--text-secondary)" }}>

            {user.verificationStatus === "APPROVED" &&
              "Your driving license has been successfully verified."}

            {user.verificationStatus === "PENDING" &&
              "Your documents are currently under review."}

            {user.verificationStatus === "REJECTED" &&
              "Your verification request was rejected."}

            {!user.verificationStatus &&
              "Verify your driving license before booking a vehicle."}

          </p>

          {user.drivingLicenseNumber && (
            <div style={{ marginTop: "15px" }}>
              <strong>License Number</strong>
              <br />
              {user.drivingLicenseNumber}
            </div>
          )}

          {user.rejectionReason && (
            <div
              style={{
                marginTop: "15px",
                color: "#dc2626"
              }}
            >
              <strong>Reason:</strong> {user.rejectionReason}
            </div>
          )}

          <button
            className="btn btn-primary"
            style={{
              width: "100%",
              marginTop: "25px"
            }}
            onClick={() => navigate("/license-verification")}
          >
            {user.verificationStatus === "APPROVED"
              ? "Edit Documents"
              : user.verificationStatus === "REJECTED"
                ? "Upload Again"
                : user.verificationStatus === "PENDING"
                  ? "View Details"
                  : "Verify Documents"}
          </button>

        </div>

        <button className="btn btn-primary" onClick={saveProfile} style={{ width: '100%' }}>
          Save Profile
        </button>

        <button className="btn btn-outline" onClick={handleLogout} style={{ marginTop: 'var(--spacing-lg)', width: '100%', borderColor: 'var(--danger)', color: 'var(--danger)' }}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
