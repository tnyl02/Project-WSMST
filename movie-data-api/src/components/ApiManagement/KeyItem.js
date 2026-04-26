import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';

const KeyItem = ({ keyData, onDelete }) => {
  const [show, setShow] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // ปิด menu เมื่อคลิกข้างนอก
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!keyData) return null;

  const handleCopy = async (val) => {
    try {
      await navigator.clipboard.writeText(val);
      toast.success("Copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const handleDelete = () => {
    setMenuOpen(false);
    onDelete(keyData.id);
  };

  return (
    <div className="key-card-item">
      <div className="key-info-left">
        <span className="key-label">{keyData.name}</span>
        <div className="key-value-row">
          <span className="key-string">
            {show ? keyData.key : "mov_sk_xxxxxxxxxxxxxx"}
          </span>
        </div>
        <span className="key-timestamp">
          Created {keyData.created} • Last used {keyData.lastUsed}
        </span>
      </div>

      <div className="key-actions-right">
        <button className="btn-outline" onClick={() => setShow(!show)}>
          {show ? "Hide" : "Reveal"}
        </button>

        <button className="btn-outline" onClick={() => handleCopy(keyData.key)}>
          Copy
        </button>

        {/* ปุ่ม ••• + Dropdown */}
        <div className="more-menu-wrapper" ref={menuRef}>
          <button className="btn-outline more-btn" onClick={() => setMenuOpen(!menuOpen)}>
            •••
          </button>
          {menuOpen && (
            <div className="more-dropdown">
              <button className="dropdown-item delete" onClick={handleDelete}>
                🗑 Delete Key
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KeyItem;