import React from 'react';
import './PricingCard.css';

const CheckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    style={{ flexShrink: 0, marginTop: 2 }}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const PricingCard = ({
  plan,
  isPrimary,
  isCurrent,
  loading,
  onClick,
}) => {
  return (
    <div
      className={`pricing-card 
      ${isPrimary ? 'pricing-card-primary' : ''} 
      ${isCurrent ? 'pricing-card-current' : ''}`}
    >
      {plan.badge && (
        <span className="pricing-badge">{plan.badge}</span>
      )}

      <h3 className="pricing-title">{plan.title}</h3>

      <div className="pricing-price">
        <span className="price-amount">฿{plan.price}</span>
        <span className="price-period">/ month</span>
      </div>

      <div className="pricing-features">
        {plan.features.map((feature, index) => (
          <div key={index} className="pricing-feature">
            <CheckIcon />
            <span>{feature}</span>
          </div>
        ))}
      </div>

      {isCurrent ? (
        <div className="current-label">Current plan</div>
      ) : (
        <button
          className={`pricing-button ${
            isPrimary ? 'pricing-button-primary' : ''
          }`}
          onClick={onClick}
          disabled={loading}
        >
          {loading ? 'Loading...' : plan.buttonText}
        </button>
      )}
    </div>
  );
};

export default PricingCard;