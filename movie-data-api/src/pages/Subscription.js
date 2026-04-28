import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import PricingCard from '../components/pricing/PricingCard';
import { pricingPlans } from '../data/plans';
import '../styles/Home.css';
import '../styles/Subscription.css';

const PLAN_ID_TO_API = { starter: 'free', developer: 'medium', enterprise: 'premium' };
const API_TO_PLAN_ID = { free: 'starter', medium: 'developer', premium: 'enterprise' };

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const Subscription = ({ setCurrentPlan }) => {
  const [currentPlan, setLocalPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(null);

  const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  });

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await fetch('/api/user/profile', { headers: authHeader() });
        if (!res.ok) throw new Error();
        const data = await res.json();
        const planId = API_TO_PLAN_ID[data.plan] || 'starter';
        setLocalPlan(planId);
        setCurrentPlan?.(planId);
      } catch {
        setLocalPlan(localStorage.getItem('currentPlan') || 'starter');
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, []);

  const handleUpgrade = async (planId) => {
    const apiPlan = PLAN_ID_TO_API[planId];
    setUpgrading(planId);
    try {
      const res = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ plan: apiPlan }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const newPlanId = API_TO_PLAN_ID[data.current_plan] || planId;
      setLocalPlan(newPlanId);
      setCurrentPlan?.(newPlanId);
      localStorage.setItem('currentPlan', newPlanId);
      localStorage.setItem('plan', data.current_plan);
      toast.success(`Successfully upgraded to ${data.current_plan}!`);
    } catch {
      toast.error('Package change failed. Please try again.');
    } finally {
      setUpgrading(null);
    }
  };

  if (loading) {
    return (
      <div className="subscription-container">
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="subscription-container">
      <h1 className="page-title">Subscription</h1>
      <p className="page-sub">Choose the plan that fits your needs.</p>

      <div className="pricing-grid">
        {pricingPlans.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const isUpgrading = upgrading === plan.id;
       

          return (
            <PricingCard
  key={plan.id}
  plan={plan}
  isCurrent={isCurrent}
  loading={isUpgrading}
  onClick={() => handleUpgrade(plan.id)}
/>
          );
        })}
      </div>
    </div>
  );
};

export default Subscription;