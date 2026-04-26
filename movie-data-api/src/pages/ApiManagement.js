import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import '../styles/ApiManagement.css';
import KeyItem from '../components/ApiManagement/KeyItem';

const STORAGE_KEY = 'apiKeys';

const ApiManagementPage = () => {
  const [keys, setKeys] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // บันทึกทุกครั้งที่ keys เปลี่ยน
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
  }, [keys]);

  const handleCreateKey = () => {
    const newKey = {
      id: Date.now(),
      name: `API Key ${keys.length + 1}`,
      key: 'mov_sk_' + Math.random().toString(36).slice(2, 18),
      created: new Date().toLocaleDateString('th-TH'),
      lastUsed: 'Never',
    };
    setKeys(prev => [...prev, newKey]);
    toast.success("Created new API Key!");
  };

  const handleDelete = (id) => {
    setKeys(prev => prev.filter(item => item.id !== id));
    toast.success("Deleted API Key");
  };

  return (
    <div className="api-management-container">
      <div className="api-management-header">
        <h2>API Keys</h2>
        <button className="btn-primary" onClick={handleCreateKey}>
          + Create Key
        </button>
      </div>

      {keys.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🔑</span>
          <h3>No API Keys yet</h3>
          <p>Create your first key to get started</p>
        </div>
      ) : (
        keys.map(item => (
          <KeyItem key={item.id} keyData={item} onDelete={handleDelete} />
        ))
      )}
    </div>
  );
};

export default ApiManagementPage;