import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL;

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returnLoading, setReturnLoading] = useState({});
  const [cancellingId, setCancellingId] = useState(null);
  const navigate = useNavigate();
  const [pickupOtp, setPickupOtp] = useState({});

  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (!userString) { navigate('/login'); return; }
    const user = JSON.parse(userString);
    fetchBookings(user.id);
  }, [navigate]);

  const fetchBookings = async (userId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/bookings/user/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      const bookingList = data.content || data;

      setBookings(bookingList);

      checkReviewedBookings(bookingList);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleCancel = async (bookingId) => {
    const token = localStorage.getItem('token');
    setCancellingId(bookingId);
    try {
      const res = await fetch(`${API}/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b));
      }
    } catch (e) { console.error(e); }
    setCancellingId(null);
  };

  const verifyPickupOtp = async (bookingId) => {

    const token = localStorage.getItem("token");

    try {

      const res = await fetch(
        `${API}/bookings/${bookingId}/verify-pickup-otp`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            otp: pickupOtp[bookingId]
          })
        }
      );

      const data = await res.json();

      if (res.ok) {

        alert(data.message);

        window.location.reload();

      } else {

        alert(data.error);

      }

    } catch (err) {

      console.error(err);

    }

  };

  const [accessLoading, setAccessLoading] = useState({});

  const [reviewBooking, setReviewBooking] = useState(null);
  const [reviewedBookings, setReviewedBookings] = useState({});

  const [review, setReview] = useState({
    rating: 5,
    comment: ""
  });

 const openReviewModal = (booking) => {
  console.log(
    "OPENING REVIEW FOR BOOKING:",
    booking.id,
    booking
  );

  setReviewBooking(booking);
};


  const submitReview = async () => {
    // Frontend validation
    console.log(
  "SUBMITTING REVIEW FOR BOOKING:",
  reviewBooking.id
);
    if (!review.comment.trim()) {
      alert("Please enter your review comment.");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          bookingId: reviewBooking.id,
          rating: review.rating,
          comment: review.comment.trim()
        })
      });

      const data = await res.json();

      // SUCCESS
      console.log("REVIEW RESPONSE:", data);
      if (res.ok) {
        alert("Review submitted successfully!");

        setReviewedBookings(prev => ({
          ...prev,
          [reviewBooking.id]: true
        }));

        setReviewBooking(null);

        setReview({
          rating: 5,
          comment: ""
        });

      } else {

        // REVIEW ALREADY EXISTS
        if (
          data.error === "You have already reviewed this booking." ||
          data === "You have already reviewed this booking."
        ) {

          setReviewedBookings(prev => ({
            ...prev,
            [reviewBooking.id]: true
          }));

          setReviewBooking(null);

          alert("This booking has already been reviewed.");

          return;
        }

        // OTHER ERRORS
        if (data.details && Array.isArray(data.details)) {
          alert(data.details.join("\n"));
        } else {
          alert(data.error || "Failed to submit review.");
        }
      }

    } catch (error) {
      console.error("Review Error:", error);
      alert("Something went wrong. Please try again.");
    }
  };


  const checkReviewedBookings = async (bookings) => {
  const completedBookings = bookings.filter(
    booking => booking.status === "COMPLETED"
  );

  try {
    const results = await Promise.all(
      completedBookings.map(async (booking) => {
        const res = await fetch(
          `${API}/reviews/booking/${booking.id}/exists`
        );

        const reviewed = await res.json();

        console.log(
          "Booking:",
          booking.id,
          "Status:",
          booking.status,
          "API reviewed:",
          reviewed
        );

        return [booking.id, reviewed];
      })
    );

    const reviewMap = Object.fromEntries(results);

    console.log("FINAL REVIEW MAP:", reviewMap);

    setReviewedBookings(reviewMap);

  } catch (error) {
    console.error("Error checking reviewed bookings:", error);
  }
};
  const handleAccess = async (carId, action) => {
    const token = localStorage.getItem('token');
    setAccessLoading(prev => ({ ...prev, [carId]: true }));
    try {
      const res = await fetch(`${API}/access/${action}/${carId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setBookings(prev => prev.map(b =>
          b.car?.id === carId ? { ...b, car: { ...b.car, locked: data.locked } } : b
        ));
      } else {
        alert(data.error || "Access Denied");
      }
    } catch (e) { console.error(e); }
    setAccessLoading(prev => ({ ...prev, [carId]: false }));
  };

  const handleRequestReturn = async (bookingId) => {

    const confirmReturn = window.confirm(
      "Are you sure you want to return this vehicle?"
    );

    if (!confirmReturn) return;

    const token = localStorage.getItem("token");

    setReturnLoading(prev => ({
      ...prev,
      [bookingId]: true
    }));

    try {

      const res = await fetch(
        `${API}/bookings/${bookingId}/request-return`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await res.json();

      if (res.ok) {

        alert(data.message);

        setBookings(prev =>
          prev.map(b =>
            b.id === bookingId
              ? {
                ...b,
                returnRequestedAt:
                  data.booking.returnRequestedAt
              }
              : b
          )
        );

      } else {

        alert(data.error);

      }

    } catch (err) {

      console.error(err);

    }

    setReturnLoading(prev => ({
      ...prev,
      [bookingId]: false
    }));
  };



  const statusStyle = (status) => {
    switch (status) {
      case 'BOOKED': return { color: 'var(--accent-primary)', bg: 'rgfba(99,102,241,0.1)' };
      case "ACTIVE":
        return {
          color: "var(--success)",
          bg: "rgba(16,185,129,0.1)"
        };
      case 'COMPLETED': return { color: 'var(--success)', bg: 'rgba(16,185,129,0.1)' };
      case 'CANCELLED': return { color: 'var(--danger)', bg: 'rgba(239,68,68,0.1)' };
      default: return { color: 'var(--text-secondary)', bg: 'var(--bg-secondary)' };
    }
  };

  if (loading) return <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading bookings...</div>;

  const bookedBookings =
    bookings.filter(b => b.status === "BOOKED");

  const activeBookings =
    bookings.filter(b => b.status === "ACTIVE");

  const pastBookings =
    bookings.filter(b =>
      b.status === "COMPLETED" ||
      b.status === "CANCELLED"
    );
  console.table(
    bookings.map(b => ({
      id: b.id,
      status: b.status,
      car: b.car?.name
    }))
  );

  // Only BOOKED and COMPLETED count as actual bookings
  const actualBookings = bookings.filter(b => b.status === 'BOOKED' || b.status === 'COMPLETED');

  return (
    <div style={{ padding: 'var(--spacing-xl) 0', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>
            My <span className="text-gradient">Bookings</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>{actualBookings.length} total booking{actualBookings.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => navigate('/cars')} className="btn btn-primary">+ Book a Car</button>
      </div>

      {actualBookings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>No bookings yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Browse our fleet and book your first car!</p>
          <button onClick={() => navigate('/cars')} className="btn btn-primary">Browse Cars</button>
        </div>
      ) : (
        <>
          {/* Booked Bookings */}
          {bookedBookings.length > 0 && (
            <>
              <h2
                style={{
                  fontSize: "1.3rem",
                  marginBottom: "1rem",
                  color: "var(--accent-primary)"
                }}
              >
                Booked Bookings
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                  gap: "1.5rem",
                  marginBottom: "var(--spacing-xl)"
                }}
              >
                {bookedBookings.map((b) => (
                  <div
                    key={b.id}
                    className="card"
                    style={{
                      padding: 0,
                      overflow: "hidden",
                      borderLeft: "4px solid var(--accent-primary)"
                    }}
                  >
                    <div style={{ padding: "1.5rem" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "1rem"
                        }}
                      >
                        <div>
                          <h3 style={{ margin: 0, fontSize: "1.2rem" }}>
                            {b.car?.brand} {b.car?.name}
                          </h3>

                          <span
                            style={{
                              fontSize: "0.85rem",
                              color: "var(--text-secondary)"
                            }}
                          >
                            {b.car?.type} • {b.car?.fuelType}
                          </span>
                        </div>

                        <span
                          style={{
                            padding: "0.2rem 0.6rem",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            letterSpacing: "0.05rem",
                            fontWeight: "700",
                            color: statusStyle(b.status).color,
                            backgroundColor: statusStyle(b.status).bg,
                            border: `1px solid ${statusStyle(b.status).color}20`
                          }}
                        >
                          {b.status}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "0.75rem",
                          marginBottom: "1rem"
                        }}
                      >
                        <div
                          style={{
                            padding: "0.6rem",
                            background: "var(--bg-secondary)",
                            borderRadius: "var(--radius-sm)"
                          }}
                        >
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--text-secondary)"
                            }}
                          >
                            Pickup
                          </div>

                          <div
                            style={{
                              fontWeight: "600",
                              fontSize: "0.9rem"
                            }}
                          >
                            {b.startDate}
                          </div>
                        </div>

                        <div
                          style={{
                            padding: "0.6rem",
                            background: "var(--bg-secondary)",
                            borderRadius: "var(--radius-sm)"
                          }}
                        >
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--text-secondary)"
                            }}
                          >
                            Return
                          </div>

                          <div
                            style={{
                              fontWeight: "600",
                              fontSize: "0.9rem"
                            }}
                          >
                            {b.endDate}
                          </div>
                        </div>
                      </div>

                      <div style={{ marginBottom: "1.5rem" }}>
                        <div style={{ marginBottom: "15px" }}>
                          <span
                            className="text-gradient"
                            style={{
                              fontSize: "1.3rem",
                              fontWeight: "700"
                            }}
                          >
                            ₹{b.totalPrice}
                          </span>

                          <span
                            style={{
                              fontSize: "0.85rem",
                              color: "var(--text-secondary)",
                              marginLeft: "5px"
                            }}
                          >
                            total
                          </span>
                        </div>

                        <input
                          className="input"
                          placeholder="Enter Pickup OTP"
                          value={pickupOtp[b.id] || ""}
                          onChange={(e) =>
                            setPickupOtp({
                              ...pickupOtp,
                              [b.id]: e.target.value
                            })
                          }
                        />

                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            marginTop: "10px"
                          }}
                        >
                          <button
                            className="btn btn-primary"
                            onClick={() => verifyPickupOtp(b.id)}
                          >
                            Verify Pickup
                          </button>

                          <button
                            className="btn btn-outline"
                            onClick={() => handleCancel(b.id)}
                            disabled={cancellingId === b.id}
                          >
                            {cancellingId === b.id
                              ? "Cancelling..."
                              : "Cancel"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          {/* Active Bookings */}
          {activeBookings.length > 0 && (
            <>
              <h2
                style={{
                  fontSize: "1.3rem",
                  marginBottom: "1rem",
                  color: "var(--success)"
                }}
              >
                Active Bookings
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                  gap: "1.5rem",
                  marginBottom: "var(--spacing-xl)"
                }}
              >
                {activeBookings.map((b) => (
                  <div
                    key={b.id}
                    className="card"
                    style={{
                      padding: 0,
                      overflow: "hidden",
                      borderLeft: "4px solid var(--success)"
                    }}
                  >
                    <div style={{ padding: "1.5rem" }}>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "1rem"
                        }}
                      >
                        <div>
                          <h3 style={{ margin: 0 }}>
                            {b.car?.brand} {b.car?.name}
                          </h3>

                          <span
                            style={{
                              fontSize: "0.85rem",
                              color: "var(--text-secondary)"
                            }}
                          >
                            {b.car?.type} • {b.car?.fuelType}
                          </span>
                        </div>

                        <span
                          style={{
                            padding: "0.2rem 0.6rem",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            fontWeight: "700",
                            color: statusStyle(b.status).color,
                            backgroundColor: statusStyle(b.status).bg
                          }}
                        >
                          {b.status}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "0.75rem",
                          marginBottom: "1rem"
                        }}
                      >
                        <div
                          style={{
                            padding: "0.6rem",
                            background: "var(--bg-secondary)",
                            borderRadius: "var(--radius-sm)"
                          }}
                        >
                          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                            Pickup
                          </div>
                          <div style={{ fontWeight: "600" }}>{b.startDate}</div>
                        </div>

                        <div
                          style={{
                            padding: "0.6rem",
                            background: "var(--bg-secondary)",
                            borderRadius: "var(--radius-sm)"
                          }}
                        >
                          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                            Return
                          </div>
                          <div style={{ fontWeight: "600" }}>{b.endDate}</div>
                        </div>
                      </div>

                      <div style={{ marginBottom: "1rem" }}>
                        <span
                          className="text-gradient"
                          style={{ fontSize: "1.3rem", fontWeight: "700" }}
                        >
                          ₹{b.totalPrice}
                        </span>
                      </div>

                      <div
                        style={{
                          padding: "1rem",
                          background: "var(--bg-secondary)",
                          borderRadius: "var(--radius-sm)"
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                          }}
                        >
                          <span>
                            {b.returnRequestedAt
                              ? "⏳ Waiting for Admin Approval"
                              : b.car?.locked
                                ? "🔒 Vehicle Locked"
                                : "🔓 Vehicle Unlocked"}
                          </span>

                          <div
                            style={{
                              display: "flex",
                              gap: "10px"
                            }}
                          >
                            <button
                              className="btn btn-primary"
                              onClick={() =>
                                handleAccess(
                                  b.car.id,
                                  b.car.locked ? "unlock" : "lock"
                                )
                              }
                              disabled={
                                accessLoading[b.car.id] ||
                                b.returnRequestedAt
                              }
                            >
                              {accessLoading[b.car.id]
                                ? "..."
                                : b.car.locked
                                  ? "Unlock"
                                  : "Lock"}
                            </button>

                            {!b.returnRequestedAt && (
                              <button
                                className="btn btn-outline"
                                onClick={() => handleRequestReturn(b.id)}
                                disabled={returnLoading[b.id]}
                              >
                                {returnLoading[b.id]
                                  ? "Submitting..."
                                  : "Return Vehicle"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          {/* Past Bookings */}
          {pastBookings.length > 0 && (
            <>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Past Bookings</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
                {pastBookings.map(b => (
                  <div key={b.id} className="card" style={{ padding: '1.5rem', opacity: 0.75 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{b.car?.brand} {b.car?.name}</h3>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{b.startDate} → {b.endDate}</span>
                      </div>
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', letterSpacing: '0.05rem', fontWeight: '700', color: statusStyle(b.status).color, backgroundColor: statusStyle(b.status).bg, border: `1px solid ${statusStyle(b.status).color}20` }}>
                        {b.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '600' }}>₹{b.totalPrice}</span>

                      {b.status === "COMPLETED" && (
                        reviewedBookings[b.id] ? (
                          <span
                            style={{
                              color: "green",
                              fontWeight: "bold"
                            }}
                          >
                            ✅ Reviewed
                          </span>
                        ) : (
                          <button
                            className="btn btn-primary"
                            onClick={() => openReviewModal(b)}
                          >
                            ⭐ Review
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
      {reviewBooking && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999
          }}
        >
          <div className="card" style={{ width: "450px", padding: "20px" }}>

            <h2>Review {reviewBooking.car.name}</h2>

            <label>Rating</label>

            <select
              className="input"
              value={review.rating}
              onChange={(e) =>
                setReview({
                  ...review,
                  rating: Number(e.target.value)
                })
              }
            >
              <option value={5}>⭐⭐⭐⭐⭐</option>
              <option value={4}>⭐⭐⭐⭐</option>
              <option value={3}>⭐⭐⭐</option>
              <option value={2}>⭐⭐</option>
              <option value={1}>⭐</option>
            </select>

            <br />
            <br />

            <textarea
              className="input"
              rows="5"
              placeholder="Write your review..."
              value={review.comment}
              onChange={(e) =>
                setReview({
                  ...review,
                  comment: e.target.value
                })
              }
            />

            <br />
            <br />

            <div
              style={{
                display: "flex",
                gap: "10px"
              }}
            >
              <button
                className="btn btn-primary"
                onClick={submitReview}
              >
                Submit
              </button>
              <button
                className="btn btn-outline"
                onClick={() => setReviewBooking(null)}
              >
                Cancel
              </button>
















            </div>

          </div>
        </div>



      )}
    </div>
  );
};

export default MyBookings;
