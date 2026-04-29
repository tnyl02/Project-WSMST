export const pricingPlans = [
  {
    id: 'free',
    title: "Free",
    price: "0",
    badge: "Free",
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
    id: 'medium',
    badge: "Medium",
    title: "Medium",
    price: "299",
    features: [
      "50,000 requests/month",
      "Rate limit: 50 req/min",
      "Search: advanced (filter by genre, year, sort)",
      "Data: full (includes synopsis & image URL)",
      "Export: not available",
      "Support: email (reply within 24h)"
    ],
    buttonText: "Get started"
  },
  {
    id: 'premium',
    badge: "Premium",
    title: "Premium",
    price: "990",
    features: [
      "Requests: unlimited",
      "Rate limit: 100 req/min",
      "Search: full-text (incl. synopsis)",
      "Data: full (synopsis & image URL)",
      "Export: bulk up to 1,000 titles/call",
      "Support: 24/7 priority consultant"
    ],
    buttonText: "Get started"
  }
];