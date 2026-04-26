import React from 'react';
import '../styles/Home.css';
import { pricingPlans } from '../data/plans';
import { Link } from "react-router-dom";


// Icons Components
const DatabaseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <ellipse cx="12" cy="5" rx="9" ry="3"/>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
  </svg>
);

const KeyIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
  </svg>
);

const ChartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 20V10"/>
    <path d="M12 20V4"/>
    <path d="M6 20v-6"/>
  </svg>
);

const ShieldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const DocIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

// Feature Card Component
const FeatureCard = ({ icon, title, description }) => (
  <div className="feature-card">
    <div className="feature-icon">{icon}</div>
    <h3 className="feature-title">{title}</h3>
    <p className="feature-description">{description}</p>
  </div>
);

// Pricing Feature Item
const PricingFeature = ({ children }) => (
  <div className="pricing-feature">
    <CheckIcon />
    <span>{children}</span>
  </div>
);

// Pricing Card Component
const PricingCard = ({ badge, title, price, features, buttonText, isPrimary }) => (
  <div className={`pricing-card ${isPrimary ? 'pricing-card-primary' : ''}`}>
    {badge && <span className="pricing-badge">{badge}</span>}
    <h3 className="pricing-title">{title}</h3>
    <div className="pricing-price">
      <span className="price-amount">฿{price}</span>
      <span className="price-period">/ month</span>
    </div>
    <div className="pricing-features">
      {features.map((feature, index) => (
        <PricingFeature key={index}>{feature}</PricingFeature>
      ))}
    </div>
    <button className={`pricing-button ${isPrimary ? 'pricing-button-primary' : ''}`}>
      {buttonText}
    </button>
  </div>
);

// Main Component
const Home = () => {
  const features = [
    {
      icon: <DatabaseIcon />,
      title: "Rich Movie Data",
      description: "Access 30+ curated titles with synopses, ratings, and genres."
    },
    {
      icon: <KeyIcon />,
      title: "Instant API Keys",
      description: "Generate, reveal, or revoke your keys with a single click."
    },
    {
      icon: <ChartIcon />,
      title: "Real-time Analytics",
      description: "Monitor your API usage and quota limits via live dashboard."
    },
    {
      icon: <ShieldIcon />,
      title: "Smart Rate Limits",
      description: "Tiered access with 429 error handling for stable integration."
    },
    {
      icon: <DocIcon />,
      title: "Developer-First Docs",
      description: "Ready-to-use snippets in cURL, JavaScript, and Node.js."
    }
  ];

  const pricingPlans = [
    {
      title: "Starter",
      price: "0",
      features: [
        "1,000 requests/month",
        "Rate limit: 5 req/min",
        "Basic search (title only)",
        "Data: title, year, genre, runtime (no synopsis or images)",
        "Export: not available",
        "Support: community forum"
      ],
      buttonText: "Get started"
    },
    {
      badge: "Medium",
      title: "Developer",
      price: "299",
      features: [
        "50,000 requests/month",
        "Rate limit: 60 req/min",
        "Search: advanced (filter by genre, year, sort)",
        "Data: full (includes synopsis & image URL)",
        "Export: not available",
        "Support: email (reply within 24h)"
      ],
      buttonText: "Subscribe to Developer"
    },
    {
      badge: "Premium",
      title: "Enterprise",
      price: "990",
      features: [
        "Requests: unlimited",
        "Rate limit: 300 req/min",
        "Search: full-text (incl. synopsis)",
        "Data: full (synopsis & image URL)",
        "Export: bulk up to 1,000 titles/call",
        "Support: 24/7 priority consultant"
      ],
      buttonText: "Contact Enterprise sales",
      isPrimary: false
    }
  ];

  return (
    <div className="api-landing">
      {/* Hero Section */}
      <header className="hero">
        <p className="hero-label">MOVIE DATA API</p>
        <h1 className="hero-title">
          The Movie Data API<br />for Developers
        </h1>
        <p className="hero-description">
          Access a curated database of films with real-time rate limiting, usage tracking, and
          developer-friendly authentication. Start querying in minutes.
        </p>
        <div className="hero-buttons">
          <button className="btn btn-primary">Get started for free</button>
          <Link to="/docs">
  <button className="btn btn-secondary">View Document</button>
</Link>
        </div>
      </header>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Key Features</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section">
        <h2 className="section-title">Simple Pricing</h2>
        <p className="section-subtitle">Start free, scale as you grow</p>
        <div className="pricing-grid">
          {pricingPlans.map((plan, index) => (
            <PricingCard key={index} {...plan} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;