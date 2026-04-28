export const pricingPlans = [
  {
    id: 'starter',
    title: "Starter",
    price: "0",
    badge: null,
    features: [
      "1,000 requests/month",
      "Rate limit: 10 req/min",
      "Basic search (title only)",
      "Data: title, year, genre, runtime (no synopsis or images)",
      "Export: not available",
      "Support: community forum"
    ],
    buttonText: "Get started"
  },
  {
    id: 'developer',
    badge: "Medium",
    title: "Developer",
    price: "299",
    features: [
      "50,000 requests/month",
      "Rate limit: 50 req/min",
      "Search: advanced (filter by genre, year, sort)",
      "Data: full (includes synopsis & image URL)",
      "Export: not available",
      "Support: email (reply within 24h)"
    ],
    buttonText: "Subscribe to Developer"
  },
  {
    id: 'enterprise',
    badge: "Premium",
    title: "Enterprise",
    price: "990",
    features: [
      "Requests: unlimited",
      "Rate limit: 100 req/min",
      "Search: full-text (incl. synopsis)",
      "Data: full (synopsis & image URL)",
      "Export: bulk up to 1,000 titles/call",
      "Support: 24/7 priority consultant"
    ],
    buttonText: "Contact Enterprise sales"
  }
];