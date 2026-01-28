import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const Lab2IDOR = ({ user }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mode, setMode] = useState('vulnerable'); // vulnerable | secure
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  const currentId = searchParams.get('id') || user.uid; // default own uid

  // Log helper (to SOC logs)
  const logEvent = async (status, message) => {
    try {
      await addDoc(collection(db, 'logs'), {
        userId: user.uid,
        email: user.email,
        event: 'idor_lab_access',
        targetId: currentId,
        mode,
        status,
        message,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.error('log error', e);
    }
  };

  const loadProfile = async () => {
    setError('');
    setProfile(null);

    const ref = doc(db, 'profiles', currentId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      setError('Profile not found.');
      await logEvent('fail', 'profile_not_found');
      return;
    }

    const data = snap.data();

    if (mode === 'secure' && data.ownerId !== user.uid) {
      setError('Access denied: you are not the owner of this profile.');
      await logEvent('blocked', 'owner_mismatch');
      return;
    }

    setProfile(data);
    await logEvent('success', 'profile_loaded');
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId, mode]);

  const handleIdChange = (e) => {
    setSearchParams({ id: e.target.value });
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 20 }}>
      <button
        onClick={() => navigate('/dashboard')}
        style={{
          marginBottom: 20,
          padding: '8px 16px',
          borderRadius: 6,
          border: '1px solid #ccc',
          cursor: 'pointer'
        }}
      >
        ← Back to Dashboard
      </button>

      <h1 style={{
        color: mode === 'vulnerable' ? '#ff9800' : '#4caf50',
        marginBottom: 10
      }}>
        Lab 2: IDOR ({mode.toUpperCase()})
      </h1>

      <p style={{ marginBottom: 20, color: '#555' }}>
        In the vulnerable version, changing the <code>id</code> in the URL or input
        lets you view other users&apos; profiles (Insecure Direct Object Reference).
        In the secure version, the server checks that you own the resource.
      </p>

      <div style={{
        borderRadius: 12,
        border: `3px solid ${mode === 'vulnerable' ? '#ff9800' : '#4caf50'}`,
        padding: 20,
        background: '#f9f9f9',
        marginBottom: 20
      }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <button
            onClick={() => setMode('vulnerable')}
            style={{
              padding: '10px 20px',
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              background: mode === 'vulnerable' ? '#ff9800' : '#ddd',
              color: 'white'
            }}
          >
            Vulnerable
          </button>
          <button
            onClick={() => setMode('secure')}
            style={{
              padding: '10px 20px',
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              background: mode === 'secure' ? '#4caf50' : '#ddd',
              color: 'white'
            }}
          >
            Secure
          </button>
        </div>

        <div style={{ marginBottom: 15 }}>
          <label style={{ fontWeight: 'bold' }}>Profile ID:</label>
          <input
            type="text"
            value={currentId}
            onChange={handleIdChange}
            style={{
              marginLeft: 10,
              padding: 10,
              borderRadius: 6,
              border: '1px solid #ccc',
              width: '60%'
            }}
          />
          <button
            onClick={loadProfile}
            style={{
              marginLeft: 10,
              padding: '10px 20px',
              borderRadius: 6,
              border: 'none',
              background: '#2196f3',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Load Profile
          </button>
        </div>

        <p style={{ fontSize: 13, color: '#777' }}>
          Tip: In vulnerable mode, try pasting another user&apos;s ID here to simulate
          guessing or enumerating IDs.
        </p>

        {error && (
          <div style={{
            marginTop: 15,
            padding: 12,
            background: '#ffebee',
            color: '#b71c1c',
            borderRadius: 6
          }}>
            {error}
          </div>
        )}

        {profile && (
          <div style={{
            marginTop: 20,
            background: 'white',
            padding: 20,
            borderRadius: 10,
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
          }}>
            <h3>Profile Data</h3>
            <p><strong>Full name:</strong> {profile.fullName}</p>
            <p><strong>Email (stored):</strong> {profile.email}</p>
            <p><strong>Secret note:</strong> {profile.secretNote}</p>
            <p><strong>OwnerId:</strong> {profile.ownerId}</p>
          </div>
        )}
      </div>

      <div style={{
        padding: 16,
        background: '#fff3cd',
        borderRadius: 8,
        fontSize: 14
      }}>
        <h4>What you should learn from this lab</h4>
        <ul>
          <li>Never trust only the ID in the URL; always verify ownership on the server.</li>
          <li>In real apps, IDOR often exposes other users&apos; personal or financial data.</li>
          <li>Logs in the SOC dashboard show which IDs attackers are trying to access.</li>
        </ul>
      </div>
    </div>
  );
};

export default Lab2IDOR;
