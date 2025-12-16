import React, { useState } from 'react';
import api from '../api/client';

export default function ShareModal({ fileId, onClose }) {
  const [emails, setEmails] = useState('');
  const [link, setLink] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const shareUsers = async () => {
    setMsg('');
    setError('');
    const list = emails.split(',').map((s) => s.trim()).filter(Boolean);
    if (list.length === 0) return setError('Enter at least one email');
    try {
      await api.post(`/files/${fileId}/share/users`, { emails: list });
      setMsg('Shared with specified users.');
    } catch (e) {
      setError(e.response?.data?.message || 'Share failed');
    }
  };

  const genLink = async () => {
    setMsg('');
    setError('');
    try {
      const { data } = await api.post(`/files/${fileId}/share/link`);
      // Prefer full URL from API if provided; otherwise build from env/axios base
      if (data.url) {
        setLink(`${data.url}/download`);
      } else {
        const envBase = import.meta.env.VITE_SHARE_BASE_URL ? import.meta.env.VITE_SHARE_BASE_URL.replace(/\/$/, '') : '';
        const apiBase = api.defaults.baseURL ? api.defaults.baseURL.replace(/\/api$/, '').replace(/\/$/, '') : '';
        const base = envBase || apiBase || '';
        setLink(`${base}/api/share/${data.token}/download`);
      }
      setMsg('Link generated. Only logged-in permitted users can access.');
    } catch (e) {
      setError(e.response?.data?.message || 'Could not generate link');
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)' }}>
      <div style={{ background: '#fff', padding: 16, borderRadius: 8, maxWidth: 520, margin: '10vh auto' }}>
        <h3>Share File</h3>
        <div style={{ marginBottom: 8 }}>
          <label>Share with users (emails, comma-separated)</label>
          <input value={emails} onChange={(e) => setEmails(e.target.value)} placeholder="user1@example.com, user2@example.com" style={{ width: '100%' }} />
          <button onClick={shareUsers} style={{ marginTop: 8 }}>Share with users</button>
        </div>
        <div style={{ marginTop: 12 }}>
          <button onClick={genLink}>Generate shareable link</button>
          {link && (
            <div style={{ marginTop: 8 }}>
              <input value={link} readOnly style={{ width: '100%' }} onFocus={(e) => e.target.select()} />
              <div style={{ fontSize: 12, color: '#555' }}>Requires login and permission.</div>
            </div>
          )}
        </div>
        {msg && <div style={{ color: 'green', marginTop: 8 }}>{msg}</div>}
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
        <div style={{ marginTop: 12, textAlign: 'right' }}>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
