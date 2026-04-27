import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import '../styles/ApiManagement.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

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
      const res = await fetch(`${API_URL}/api/key/`, { headers: authHeader() });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setKeyData(data);
    } catch {
      toast.error('โหลด API Key ไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchKey(); }, []);

  // Regenerate key
  const handleRegenerate = async () => {
    if (!window.confirm('สร้าง API Key ใหม่? Key เดิมจะหยุดทำงานทันที')) return;
    try {
      const res = await fetch(`${API_URL}/api/key/regenerate`, {
        method: 'POST',
        headers: authHeader(),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setKeyData(prev => ({ ...prev, api_key: data.new_key, status: 'Active' }));
      setShow(false);
      toast.success('สร้าง API Key ใหม่สำเร็จ');
    } catch {
      toast.error('สร้าง Key ใหม่ไม่สำเร็จ');
    }
  };

  // Revoke key
  const handleRevoke = async () => {
    if (!window.confirm('ระงับ API Key นี้? จะไม่สามารถใช้งานได้จนกว่าจะ Regenerate')) return;
    try {
      const res = await fetch(`${API_URL}/api/key/revoke`, {
        method: 'POST',
        headers: authHeader(),
      });
      if (!res.ok) throw new Error();
      setKeyData(prev => ({ ...prev, api_key: 'REVOKED', status: 'Revoked (ถูกระงับ)' }));
      setShow(false);
      toast.success('ระงับ API Key สำเร็จ');
    } catch {
      toast.error('ระงับ Key ไม่สำเร็จ');
    }
  };

  // Copy key
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(keyData.api_key);
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Copy ไม่สำเร็จ');
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
          <p>กำลังโหลด...</p>
        </div>
      ) : !keyData ? (
        <div className="empty-state">
          <span className="empty-icon">🔑</span>
          <h3>ไม่พบ API Key</h3>
          <p>ติดต่อผู้ดูแลระบบ</p>
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