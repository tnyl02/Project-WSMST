import React, { useState, useEffect, useRef } from 'react';
import '../styles/UsageLogs.css';


const getStatusClass = (s) => {
  if (s >= 500) return 'status-5xx';
  if (s >= 400) return 'status-4xx';
  return 'status-2xx';
};

const Dropdown = ({ value, onChange, options }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div className="custom-dropdown" ref={ref}>
      <button className="dropdown-trigger" onClick={() => setOpen(!open)}>
        <span>{selected?.label}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="dropdown-menu">
          {options.map(o => (
            <button
              key={o.value}
              className={`dropdown-option ${o.value === value ? 'active' : ''}`}
              onClick={() => { onChange(o.value); setOpen(false); }}
            >
              {o.value !== 'ALL' && <span className={`dot dot-${o.value}`} />}
              {o.label}
              {o.value === value && (
                <svg className="check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const UsageLogs = () => {
  const [logs, setLogs]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        const res = await fetch(`/api/logs`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error(`Error ${res.status}`);

        const data = await res.json();

        // backend ส่ง { logs: [{ time, endpoint, status_code }] }
        // normalize ให้ตรงกับที่ UI ใช้ (status_code → status)
        const normalized = (data.logs || []).map(l => ({
          time:     l.time,
          endpoint: l.endpoint,
          status:   l.status_code,
          method:   'GET', // backend ยังไม่ส่ง method มา — default ไว้ก่อน
        }));

        setLogs(normalized);
      } catch (err) {
        console.error('UsageLogs fetch error:', err);
        setError('Unable to load logs.');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const filtered = logs.filter((l) => {
    const matchSearch = l.endpoint?.toLowerCase().includes(search.toLowerCase());
    const matchMethod = methodFilter === 'ALL' || l.method === methodFilter;
    const matchStatus =
      statusFilter === 'ALL' ||
      (statusFilter === '2xx' && l.status >= 200 && l.status < 300) ||
      (statusFilter === '4xx' && l.status >= 400 && l.status < 500) ||
      (statusFilter === '5xx' && l.status >= 500);
    return matchSearch && matchMethod && matchStatus;
  });

  return (
    <div className="usage-logs-container">
      <h1 className="page-title">Usage logs</h1>
      <p className="page-sub">Recent API calls made with your key.</p>

      <div className="toolbar">
        <div className="search-wrap">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search endpoint..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Dropdown
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'ALL', label: 'ALL status' },
            { value: '2xx', label: '2xx Success' },
            { value: '4xx', label: '4xx Client error' },
            { value: '5xx', label: '5xx Server error' },
          ]}
        />

        <Dropdown
          value={methodFilter}
          onChange={setMethodFilter}
          options={[
            { value: 'ALL',    label: 'ALL methods' },
            { value: 'GET',    label: 'GET' },
            { value: 'POST',   label: 'POST' },
            { value: 'DELETE', label: 'DELETE' },
            { value: 'PUT',    label: 'PUT' },
          ]}
        />
      </div>

      <div className="table-wrap">
        {loading ? (
          <div className="state-msg">Loading...</div>
        ) : error ? (
          <div className="state-msg error">Error: {error}</div>
        ) : logs.length === 0 ? (
          <div className="state-msg">No usage history yet</div>
        ) : filtered.length === 0 ? (
          <div className="state-msg">No logs found</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Method</th>
                <th>Endpoint</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l, i) => (
                <tr key={i}>
                  <td className="timestamp">{l.time}</td>
                  <td><span className={`method-badge method-${l.method}`}>{l.method}</span></td>
                  <td className="endpoint">{l.endpoint}</td>
                  <td><span className={`status-badge ${getStatusClass(l.status)}`}>{l.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && !error && (
        <p className="footer">Showing {filtered.length} of {logs.length} entries</p>
      )}
    </div>
  );
};

export default UsageLogs;