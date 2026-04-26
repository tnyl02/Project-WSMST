import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import KeyItem from './KeyItem';

// โหลด keys จาก localStorage ครั้งแรก
const loadKeys = () => {
  try {
    const saved = localStorage.getItem('apiKeys');
    return saved ? JSON.parse(saved) : [
      // Default key ถ้ายังไม่มีใน localStorage
      {
        id: 1,
        name: 'Production Key',
        key: 'mov_7x89b2k3l4m5n6o7p8q9r0',
        created: 'Dec 15, 2025',
        lastUsed: '2 hours ago',
      }
    ];
  } catch {
    return [];
  }
};

const ApiKeyBox = () => {
  const [keys, setKeys] = useState(() => {
    // ใช้ arrow function แทน loadKeys reference
    try {
      const saved = localStorage.getItem('apiKeys');
      console.log('Loaded from storage:', saved); // ← ดู console
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('localStorage error:', e);
    }
    return [{
      id: 1,
      name: 'Production Key',
      key: 'mov_7x89b2k3l4m5n6o7p8q9r0',
      created: 'Dec 15, 2025',
      lastUsed: '2 hours ago',
    }];
  });

  useEffect(() => {
  if (keys.length > 0) { // ← เซฟเฉพาะตอนมีข้อมูล
    localStorage.setItem('apiKeys', JSON.stringify(keys));
  }
}, [keys]);
  const handleDelete = (id) => {
    setKeys(prev => prev.filter(k => k.id !== id));
    toast.success("Deleted key successfully");
  };

  const handleAddKey = () => {
    const newKey = {
      id: Date.now(),
      name: `Key #${keys.length + 1}`,
      key: 'mov_' + Math.random().toString(36).slice(2, 18),
      created: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      lastUsed: 'Never',
    };
    setKeys(prev => [...prev, newKey]);
    toast.success("New API key created!");
  };

  return (
    <div className="api-key-section">
      <div className="key-header">
        <strong>Your API Keys</strong>
        <button className="btn-outline" onClick={handleAddKey}>
          + New Key
        </button>
      </div>

      {keys.length === 0 ? (
        <p style={{ color: '#aaa', fontSize: '14px', marginTop: '12px' }}>
          No API keys yet. Click "+ New Key" to create one.
        </p>
      ) : (
        keys.map(k => (
          <KeyItem key={k.id} keyData={k} onDelete={handleDelete} />
        ))
      )}
    </div>
  );
};

export default ApiKeyBox;