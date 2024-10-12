import React from 'react';
import './RewardsCard.css'; // Ensure this file exists for styling

const RewardsCard = ({ cardType, cardValue, coinCost, onRedeem }) => {
  return (
    <div className="rewards-card">
      <h3>{cardType} Gift Card</h3>
      <p>Value: ${cardValue}</p>
      <p>Cost: {coinCost} Coins</p>
      <button onClick={onRedeem} className="redeem-button">
        Redeem
      </button>
    </div>
  );
};

export default RewardsCard;
