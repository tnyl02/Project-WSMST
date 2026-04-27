import React, { useState, useRef, useEffect } from "react";
import './styles/UserManagement.css';


// ===== Mock Data =====
const MOCK_USERS = [
  { id: 1, username: "JohnDoe",    apiKey: "mov_a1b2c3", plan: "Premium", requests: 1240, status: "Active" },
  { id: 2, username: "FilmMaster", apiKey: "mov_d4e5f6", plan: "Premium", requests: 980,  status: "Active" },
  { id: 3, username: "CineFan99",  apiKey: "mov_g7h8i9", plan: "Medium",  requests: 300,  status: "Active" },
  { id: 4, username: "MovieBuff",  apiKey: "mov_j1k2l3", plan: "Medium",  requests: 250,  status: "Active" },
  { id: 5, username: "TestUser",   apiKey: "mov_m4n5o6", plan: "Free",    requests: 100,  status: "Limit"  },
];

const PLAN_OPTIONS   = ["Premium", "Medium", "Free"];
const STATUS_OPTIONS = ["Active", "Limit", "Block"];

// ===== Plan Badge =====
const PlanBadge = ({ plan }) => (
  <span className={`plan-badge plan-${plan.toLowerCase()}`}>{plan}</span>
);

// ===== Status Badge =====
const StatusBadge = ({ status }) => (
  <span className={`status-badge status-${status.toLowerCase()}`}>{status}</span>
);

// ===== Action Dropdown =====
const ActionDropdown = ({ userId, currentPlan, currentStatus, onUpdate }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Click outside → close
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="action-dropdown" ref={ref}>
      <button className="action-btn" onClick={() => setOpen((p) => !p)}>
        ⚙️
      </button>

      {open && (
        <div className="dropdown-menu">
          {/* Plan Section */}
          <p className="dropdown-section-label">Plan</p>
          {PLAN_OPTIONS.map((p) => (
            <button
              key={p}
              className={`dropdown-item ${currentPlan === p ? "active" : ""}`}
              onClick={() => { onUpdate(userId, "plan", p); setOpen(false); }}
            >
              {p}
            </button>
          ))}

          <div className="dropdown-divider" />

          {/* Status Section */}
          <p className="dropdown-section-label">Status</p>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              className={`dropdown-item ${currentStatus === s ? "active" : ""}`}
              onClick={() => { onUpdate(userId, "status", s); setOpen(false); }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ===== Main =====
export default function UsersManagement() {
  const [users, setUsers]   = useState(MOCK_USERS);
  const [search, setSearch] = useState("");

  // Filter
  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.apiKey.toLowerCase().includes(search.toLowerCase())
  );

  // Update plan / status
  const handleUpdate = (userId, field, value) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, [field]: value } : u))
    );
  };

  return (
    <div className="um-wrapper">

      {/* Header */}
      <div className="um-header">
        <h1 className="um-title">Users Management</h1>

        {/* Search */}
        <div className="um-search-box">
          <span className="um-search-icon-left">☰</span>
          <input
            className="um-search-input"
            type="text"
            placeholder="Hinted search text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="um-search-icon-right">🔍</span>
        </div>
      </div>

      {/* Table */}
      <div className="um-table-wrapper">
        <table className="um-table">
          <thead>
            <tr>
              <th>User Name</th>
              <th>API Key</th>
              <th>Plan</th>
              <th>Requests</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((user) => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>
                    <span className="apikey-text">{user.apiKey}</span>
                  </td>
                  <td><PlanBadge plan={user.plan} /></td>
                  <td>{user.requests.toLocaleString()}</td>
                  <td><StatusBadge status={user.status} /></td>
                  <td>
                    <ActionDropdown
                      userId={user.id}
                      currentPlan={user.plan}
                      currentStatus={user.status}
                      onUpdate={handleUpdate}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="um-empty">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}