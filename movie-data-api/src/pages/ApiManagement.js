import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import '../styles/ApiManagement.css';


const ApiManagementPage = () => {
  const [keyData, setKeyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [show, setShow]       = useState(false);

  const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  });

  // โหลด key จาก backend
  const fetchKey = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/key/`, { headers: authHeader() });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setKeyData(data);
    } catch {
      toast.error('Failed to load API Key');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchKey(); }, []);

  // Regenerate key
  const handleRegenerate = async () => {
    if (!window.confirm('Create new API Key? The old key will stop working immediately.')) return;
    try {
      const res = await fetch(`/api/key/regenerate`, {
        method: 'POST',
        headers: authHeader(),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setKeyData(prev => ({ ...prev, api_key: data.new_key, status: 'Active' }));
      setShow(false);
      toast.success('Successfully created new API Key');
    } catch {
      toast.error('Failed to create new API Key');
    }
  };

  // Revoke key
  const handleRevoke = async () => {
    if (!window.confirm('Revoke this API Key? It will not be able to be used until regenerated.')) return;
    try {
      const res = await fetch(`/api/key/revoke`, {
        method: 'POST',
        headers: authHeader(),
      });
      if (!res.ok) throw new Error();
      setKeyData(prev => ({ ...prev, api_key: 'REVOKED', status: 'Revoked (ถูกระงับ)' }));
      setShow(false);
      toast.success('Successfully revoked API Key');
    } catch {
      toast.error('Failed to revoke API Key');
    }
  };

  // Copy key
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(keyData.api_key);
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Failed to copy API Key');
    }
  };

  const isRevoked = keyData?.status !== 'Active';

  return (
    <div className="api-management-container">
      <div className="api-management-header">
        <h2>API Keys</h2>
      </div>

      {loading ? (
        <div className="empty-state">
          <p>Loading...</p>
        </div>
      ) : !keyData ? (
        <div className="empty-state">
          <span className="empty-icon">🔑</span>
          <h3>No API Key found</h3>
          <p>Contact system administrator</p>
        </div>
      ) : (
        <div className="key-card-item">
          <div className="key-info-left">
            <span className="key-label">
              API Key
              <span style={{
                marginLeft: 8,
                fontSize: 12,
                color: isRevoked ? '#e74c3c' : '#27ae60',
                fontWeight: 500,
              }}>
                ● {keyData.status}
              </span>
            </span>
            <div className="key-value-row">
              <span className="key-string">
                {show ? keyData.api_key : 'mov_••••••••••••••••'}
              </span>
            </div>
            <span className="key-timestamp">
              Retrieved at {keyData.retrieved_at}
            </span>
          </div>

          <div className="key-actions-right">
            <button className="btn-outline" onClick={() => setShow(!show)}>
              {show ? 'Hide' : 'Reveal'}
            </button>
            <button className="btn-outline" onClick={handleCopy} disabled={isRevoked}>
              Copy
            </button>
            <button className="btn-outline" onClick={handleRegenerate}>
              Regenerate
            </button>
            <button
              className="btn-outline"
              onClick={handleRevoke}
              disabled={isRevoked}
              style={{ color: isRevoked ? undefined : '#e74c3c' }}
            >
              Revoke
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiManagementPage;