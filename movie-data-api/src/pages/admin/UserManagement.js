import React, { useState, useRef, useEffect, useCallback } from "react";
import './styles/UserManagement.css';

const PLAN_OPTIONS   = ["premium", "medium", "free"];
const STATUS_OPTIONS = ["active", "limit", "block"];

// ===== Plan Badge =====
const PlanBadge = ({ plan }) => (
  <span className={`plan-badge plan-${plan?.toLowerCase()}`}>
    {plan?.charAt(0).toUpperCase() + plan?.slice(1)}
  </span>
);

// ===== Status Badge =====
const StatusBadge = ({ status }) => (
  <span className={`status-badge status-${status?.toLowerCase()}`}>
    {status?.charAt(0).toUpperCase() + status?.slice(1)}
  </span>
);

// ===== Action Dropdown =====
const ActionDropdown = ({ userId, currentPlan, currentStatus, onUpdate }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

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
              className={`dropdown-item ${currentPlan?.toLowerCase() === p ? "active" : ""}`}
              onClick={() => { onUpdate(userId, "plan", p); setOpen(false); }}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}

          <div className="dropdown-divider" />

          {/* Status Section */}
          <p className="dropdown-section-label">Status</p>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              className={`dropdown-item ${currentStatus?.toLowerCase() === s ? "active" : ""}`}
              onClick={() => { onUpdate(userId, "status", s); setOpen(false); }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ===== Main =====
export default function UsersManagement() {
  const [users, setUsers]     = useState([]);
  const [search, setSearch]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  // ดึง Token จาก localStorage
  const getToken = () => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      return user.token || null;
    }
    return null;
  };

  // ===== Fetch Users =====
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getToken();
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/admin/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ===== Update Plan / Status =====
  const handleUpdate = async (userId, field, value) => {
    // Optimistic update (อัปเดต UI ก่อน)
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, [field]: value } : u))
    );

    try {
      const token = getToken();
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/admin/users/${userId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ [field]: value }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update: ${response.status}`);
      }

      // แสดง Success Message
      setSuccessMsg(`Updated ${field} successfully!`);
      setTimeout(() => setSuccessMsg(""), 3000);

    } catch (err) {
      // Rollback ถ้า error
      setError(err.message);
      fetchUsers();
    }
  };

  // ===== Filter =====
  const filtered = users.filter((u) =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.api_key?.toLowerCase().includes(search.toLowerCase())
  );

  // ===== Render =====
  return (
    <div className="um-wrapper">

      {/* Header */}
      <div className="um-header">
        <h1 className="um-title">Users Management</h1>

        <div className="um-search-box">
          <span className="um-search-icon-left">☰</span>
          <input
            className="um-search-input"
            type="text"
            placeholder="Search by username or API key..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="um-search-icon-right">🔍</span>
        </div>
      </div>

      {/* Success Message */}
      {successMsg && (
        <div className="um-success-msg">
          ✅ {successMsg}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="um-error-msg">
          ❌ {error}
          <button onClick={fetchUsers}>Retry</button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="um-loading">Loading users...</div>
      ) : (
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
                      <span className="apikey-text">
                        {user.api_key || "—"}
                      </span>
                    </td>
                    <td><PlanBadge plan={user.subscription} /></td>
                    <td>{user.total_requests?.toLocaleString() ?? 0}</td>
                    <td><StatusBadge status={user.status} /></td>
                    <td>
                      <ActionDropdown
                        userId={user.id}
                        currentPlan={user.subscription}
                        currentStatus={user.status}
                        onUpdate={handleUpdate}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="um-empty">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}