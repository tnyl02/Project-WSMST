import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { pricingPlans } from '../data/plans';
import '../styles/Subscription.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// map plan id ของ frontend → ชื่อที่ backend รับ
const PLAN_ID_TO_API = {
  starter:    'free',
  developer:  'medium',
  enterprise: 'premium',
};

// map plan ที่ backend ส่งกลับ → plan id ของ frontend
const API_TO_PLAN_ID = {
  free:    'starter',
  medium:  'developer',
  premium: 'enterprise',
};

const Subscription = ({ setCurrentPlan }) => {
  const [currentPlan, setLocalPlan] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [upgrading, setUpgrading]   = useState(null); // plan id ที่กำลัง upgrade

  const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  });

  // โหลด plan ปัจจุบันจาก profile
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await fetch(`${API_URL}/api/user/profile`, {
          headers: authHeader(),
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        const planId = API_TO_PLAN_ID[data.plan] || 'starter';
        setLocalPlan(planId);
        setCurrentPlan?.(planId);
      } catch {
        // fallback จาก localStorage ถ้า fetch ไม่ได้
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
      const res = await fetch(`${API_URL}/api/subscription/upgrade`, {
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

      toast.success(`เปลี่ยนแพ็กเกจเป็น ${data.current_plan} สำเร็จ!`);
    } catch {
      toast.error('เปลี่ยนแพ็กเกจไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setUpgrading(null);
    }
  };

  if (loading) {
    return (
      <div className="subscription-container">
        <p style={{ color: 'var(--color-text-secondary)' }}>กำลังโหลด...</p>
      </div>
    );
  }

  return (
    <div className="subscription-container">
      <h1 className="page-title">Subscription</h1>
      <p className="page-sub">Choose the plan that fits your needs.</p>

      <div className="plans-grid">
        {pricingPlans.map(plan => {
          const isCurrent   = currentPlan === plan.id;
          const isUpgrading = upgrading === plan.id;

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
                <button
                  className="btn-upgrade"
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={!!upgrading}
                >
                  {isUpgrading ? 'กำลังเปลี่ยน...' : plan.buttonText}
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