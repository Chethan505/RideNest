import React from 'react';

function VehicleCard({ vehicle }) {
  return (
    <div className="vehicle-card">
      <div className="vehicle-info">
        <h3>{vehicle.make} {vehicle.model}</h3>
        <p>Year: {vehicle.year}</p>
        <p>Price per day: ${vehicle.pricePerDay}</p>
        <span className={`status ${vehicle.status.toLowerCase()}`}>{vehicle.status}</span>
      </div>
      <button className="book-btn">Book Now</button>
    </div>
  );
}

export default VehicleCard;
