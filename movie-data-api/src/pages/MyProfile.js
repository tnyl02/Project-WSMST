import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import '../styles/MyProfile.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const MyProfile = () => {
  const [user, setUser]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  });

  // โหลดข้อมูล user จาก backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/api/user/profile`, {
          headers: authHeader(),
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setUser(data);
      } catch {
        toast.error('โหลดข้อมูลโปรไฟล์ไม่สำเร็จ');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!newPassword) {
      toast.error('กรุณากรอกรหัสผ่านใหม่');
      return;
    }
    if (newPassword.length < 4) {
      toast.error('รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('รหัสผ่านไม่ตรงกัน');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/user/profile`, {
        method: 'PUT',
        headers: authHeader(),
        body: JSON.stringify({ password: newPassword }),
      });
      if (!res.ok) throw new Error();
      toast.success('เปลี่ยนรหัสผ่านสำเร็จ');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast.error('บันทึกไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : '??';

  if (loading) {
    return (
      <div className="myprofile-container">
        <p style={{ color: 'var(--color-text-secondary)' }}>กำลังโหลด...</p>
      </div>
    );
  }

  return (
    <div className="myprofile-container">
      <h1 className="page-title">My profile</h1>
      <p className="page-sub">Update your account information.</p>

      <div className="avatar-row">
        <div className="avatar">{initials}</div>
        <div>
          <p className="avatar-name">{user?.username}</p>
          <p className="avatar-email">{user?.email}</p>
        </div>
      </div>

      <div className="profile-fields">
        <div className="field-group">
          <label>Username</label>
          <div className="field-display readonly">
            <span>{user?.username}</span>
          </div>
        </div>

        <div className="field-group">
          <label>Email</label>
          <div className="field-display readonly">
            <span>{user?.email}</span>
          </div>
        </div>

        <div className="field-group">
          <label>Plan</label>
          <div className="field-display readonly">
            <span style={{ textTransform: 'capitalize' }}>{user?.plan}</span>
          </div>
        </div>

        <div className="field-group">
          <label>New password</label>
          <input
            className="field-input"
            type="password"
            placeholder="Enter new password (min 4 characters)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div className="field-group">
          <label>Confirm new password</label>
          <input
            className="field-input"
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
      </div>

      <button className="btn-save" onClick={handleSave} disabled={saving}>
        {saving ? 'กำลังบันทึก...' : 'Save changes'}
      </button>
    </div>
  );
};

export default MyProfile;