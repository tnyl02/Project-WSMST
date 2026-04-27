import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

// ApiKeyBox — widget เล็กสำหรับใช้ใน Dashboard
const ApiKeyBox = () => {
  const [keyData, setKeyData] = useState(null);
  const [show, setShow]       = useState(false);

  useEffect(() => {
    const fetchKey = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/key/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setKeyData(data);
      } catch {
        // ไม่แสดง error ใน widget เล็ก — fail silently
        console.error('ApiKeyBox: failed to fetch key');
      }
    };

    fetchKey();
  }, []);

  const handleCopy = async () => {
    if (!keyData?.api_key) return;
    try {
      await navigator.clipboard.writeText(keyData.api_key);
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Copy ไม่สำเร็จ');
    }
  };

  const isRevoked = keyData?.status !== 'Active';

  return (
    <div className="api-key-section">
      <div className="key-header">
        <strong>Your API Key</strong>
      </div>

      {!keyData ? (
        <p style={{ color: '#aaa', fontSize: '14px', marginTop: '12px' }}>
          กำลังโหลด...
        </p>
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
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiKeyBox;