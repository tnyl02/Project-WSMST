import React, { useState } from 'react';
import { pricingPlans } from '../data/plans';
import '../styles/Subscription.css';

const Subscription = ({ setCurrentPlan }) => {
  const [currentPlan, setLocalPlan] = useState(() => {
    return localStorage.getItem('currentPlan') || 'starter';
  });

  const handleUpgrade = (planId) => {
    setLocalPlan(planId);
    setCurrentPlan(planId);
    localStorage.setItem('currentPlan', planId);
  };

  return (
    <div className="subscription-container">
      <h1 className="page-title">Subscription</h1>
      <p className="page-sub">Choose the plan that fits your needs.</p>

      <div className="plans-grid">
        {pricingPlans.map(plan => {
          const isCurrent = currentPlan === plan.id;
          return (
            <div key={plan.id} className={`plan-card ${isCurrent ? 'plan-current' : ''}`}>
              {plan.badge && (
                <span className={`plan-badge badge-${plan.id}`}>{plan.badge}</span>
              )}
              <p className="plan-name">{plan.title}</p>
              <div className="plan-price">
                <span className="price-amount">฿{plan.price}</span>
                <span className="price-period">/ month</span>
              </div>
              <ul className="plan-features">
                {plan.features.map((f, i) => (
                  <li key={i}>
                    <span className="check-icon">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <div className="current-label">Current plan</div>
              ) : (
                <button className="btn-upgrade" onClick={() => handleUpgrade(plan.id)}>
                  {plan.buttonText}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Subscription;