import React, { useState } from 'react';
import { toast } from 'react-toastify'; // สมมติว่าใช้ toast แทน alert
import '../styles/MyProfile.css';

const MyProfile = () => {
  const [username, setUsername] = useState('NarunK');
  const [editingUsername, setEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState(username);
  const [newPassword, setNewPassword] = useState('');

  // mock data
  const user = {
    name: 'Narun Kanchanakun',
    email: 'you@gmail.com',
    initials: 'NK',
  };

  const handleSave = () => {
    // Logic การบันทึก...
    console.log('Saved!', { username, newPassword });
    toast.success('Changes saved successfully!');
    setNewPassword('');
    setEditingUsername(false);
  };

  return (
  <div className="myprofile-container">
    <h1 className="page-title">My profile</h1>
    <p className="page-sub">Update your account information.</p>

    <div className="avatar-row">
      <div className="avatar">{user.initials}</div>
      <div>
        <p className="avatar-name">{user.name}</p>
        <p className="avatar-email">{user.email}</p>
      </div>
    </div>

    <div className="profile-fields">
      <div className="field-group">
        <label>Username</label>
        <div className="field-display">
          {editingUsername ? (
            <input
              className="field-input"
              value={tempUsername}
              onChange={(e) => setTempUsername(e.target.value)}
              onBlur={() => { setUsername(tempUsername); setEditingUsername(false); }}
              autoFocus
            />
          ) : (
            <>
              <span>{username}</span>
              <button className="btn-edit" onClick={() => { setTempUsername(username); setEditingUsername(true); }}>
                Edit
              </button>
            </>
          )}
        </div>
      </div>

      <div className="field-group">
        <label>Email</label>
        <div className="field-display readonly">
          <span>{user.email}</span>
        </div>
      </div>

      <div className="field-group">
        <label>New password</label>
        <input
          className="field-input"
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>
    </div>

    <button className="btn-save" onClick={handleSave}>
      Save changes
    </button>
  </div>
);
};

export default MyProfile;