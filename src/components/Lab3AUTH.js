// src/components/Lab3Auth.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const DEMO_USER_ID = 'demo-user-1';

function Lab3Auth({ user }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState('weak'); // 'weak' | 'secure'
  const [passwordInput, setPasswordInput] = useState('');
  const [message, setMessage] = useState('');
  const [attemptsInfo, setAttemptsInfo] = useState({ count: 0, lockedUntil: null });
  const [loading, setLoading] = useState(false);

  // Seed demo user + attempts doc
  useEffect(() => {
    const initDemo = async () => {
      const userRef = doc(db, 'weakAuthUsers', DEMO_USER_ID);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        await setDoc(userRef, {
          username: 'victim@example.com',
          password: 'Secret123!', // plain-text on purpose (bad practice)
        });
      }

      const attemptsRef = doc(db, 'weakAuthAttempts', DEMO_USER_ID);
      const attemptsSnap = await getDoc(attemptsRef);
      if (!attemptsSnap.exists()) {
        await setDoc(attemptsRef, {
          count: 0,
          lockedUntil: null,
        });
      } else {
        setAttemptsInfo(attemptsSnap.data());
      }
    };

    initDemo().catch(console.error);
  }, []);

  const logEvent = async (status, reason) => {
    try {
      await addDoc(collection(db, 'logs'), {
        userId: user.uid,
        email: user.email,
        event: 'weak_auth_lab',
        mode,
        status,   // success | fail | blocked
        reason,   // wrong_password | locked_out | correct_password
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      console.error('log error', e);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setMessage('');

    const userRef = doc(db, 'weakAuthUsers', DEMO_USER_ID);
    const demoSnap = await getDoc(userRef);
    const demoData = demoSnap.data();

    const attemptsRef = doc(db, 'weakAuthAttempts', DEMO_USER_ID);
    const attemptsSnap = await getDoc(attemptsRef);
    const attempts = attemptsSnap.data() || { count: 0, lockedUntil: null };

    const now = Date.now();
    const lockedUntilMs = attempts.lockedUntil ? new Date(attempts.lockedUntil).getTime() : 0;

    // Secure mode: enforce lockout
    if (mode === 'secure' && lockedUntilMs && now < lockedUntilMs) {
      const secs = Math.ceil((lockedUntilMs - now) / 1000);
      setMessage(`🔒 Account is locked. Try again in ${secs} seconds.`);
      await logEvent('blocked', 'account_locked');
      setLoading(false);
      return;
    }

    if (passwordInput === demoData.password) {
      setMessage('✅ Login success (demo only).');
      await logEvent('success', 'correct_password');

      // Reset attempts
      await updateDoc(attemptsRef, {
        count: 0,
        lockedUntil: null,
      });
      setAttemptsInfo({ count: 0, lockedUntil: null });
    } else {
      // Wrong password
      await logEvent('fail', 'wrong_password');

      if (mode === 'weak') {
        setMessage('❌ Wrong password, but you can try again unlimited times (weak mode).');
        // No change to attempts
      } else {
        const newCount = (attempts.count || 0) + 1;
        const maxAttempts = 5;
        let newLockedUntil = null;

        if (newCount >= maxAttempts) {
          const lockSeconds = 60; // lock for 60s
          newLockedUntil = new Date(Date.now() + lockSeconds * 1000).toISOString();
          setMessage(`❌ Too many attempts. Account locked for ${lockSeconds} seconds.`);
          await updateDoc(attemptsRef, {
            count: newCount,
            lockedUntil: newLockedUntil,
          });
        } else {
          setMessage(`❌ Wrong password. Attempts: ${newCount}/${maxAttempts}.`);
          await updateDoc(attemptsRef, {
            count: newCount,
            lockedUntil: null,
          });
        }

        setAttemptsInfo({
          count: newCount,
          lockedUntil: newLockedUntil,
        });
      }
    }

    setLoading(false);
  };

  const niceLockedUntil = attemptsInfo.lockedUntil
    ? new Date(attemptsInfo.lockedUntil).toLocaleTimeString()
    : null;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
      <button
        onClick={() => navigate('/dashboard')}
        style={{
          marginBottom: 20,
          padding: '8px 16px',
          borderRadius: 6,
          border: '1px solid #ccc',
          cursor: 'pointer',
        }}
      >
        ← Back to Dashboard
      </button>

      <h1
        style={{
          color: mode === 'weak' ? '#ff5722' : '#4caf50',
          marginBottom: 10,
        }}
      >
        Lab 3: Weak Authentication ({mode.toUpperCase()})
      </h1>

      <p style={{ color: '#555', marginBottom: 20 }}>
        Weak mode allows unlimited password guesses (brute force). Secure mode tracks failed attempts
        and locks the account after too many tries.
      </p>

      <div
        style={{
          borderRadius: 12,
          border: `3px solid ${mode === 'weak' ? '#ff5722' : '#4caf50'}`,
          padding: 20,
          background: '#f9f9f9',
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <button
            onClick={() => setMode('weak')}
            style={{
              padding: '10px 20px',
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              background: mode === 'weak' ? '#ff5722' : '#ddd',
              color: 'white',
            }}
          >
            Weak Mode
          </button>
          <button
            onClick={() => setMode('secure')}
            style={{
              padding: '10px 20px',
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              background: mode === 'secure' ? '#4caf50' : '#ddd',
              color: 'white',
            }}
          >
            Secure Mode
          </button>
        </div>

        <p style={{ color: '#666', marginBottom: 15 }}>
          Demo account username: <code>victim@example.com</code> – Password:{' '}
          <code>Secret123!</code> (stored in plain text for demo).
        </p>

        <div style={{ marginBottom: 15 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Password:</label>
          <input
            type="text"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Try guesses like 123456, password, admin123..."
            style={{
              width: '70%',
              padding: 12,
              borderRadius: 6,
              border: '1px solid #ccc',
              marginRight: 10,
              fontSize: 15,
            }}
          />
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              padding: '12px 24px',
              borderRadius: 6,
              border: 'none',
              background: '#2196f3',
              color: 'white',
              cursor: 'pointer',
              fontSize: 15,
              fontWeight: 'bold',
            }}
          >
            {loading ? 'Checking...' : 'Login (Demo)'}
          </button>
        </div>

        {message && (
          <div
            style={{
              marginTop: 10,
              padding: 12,
              borderRadius: 6,
              background: '#fff3cd',
              color: '#795548',
              fontSize: 14,
            }}
          >
            {message}
          </div>
        )}

        {mode === 'secure' && (
          <div style={{ marginTop: 15, fontSize: 13, color: '#555' }}>
            <p>
              <strong>Attempts:</strong> {attemptsInfo.count || 0}
            </p>
            {niceLockedUntil && (
              <p>
                <strong>Locked until:</strong> {niceLockedUntil}
              </p>
            )}
          </div>
        )}
      </div>

      <div
        style={{
          padding: 16,
          background: '#e3f2fd',
          borderRadius: 8,
          fontSize: 14,
        }}
      >
        <h4>What this lab teaches</h4>
        <ul>
          <li>Unlimited login attempts make brute-force attacks practical.</li>
          <li>
            Rate limiting and lockouts slow attackers and protect accounts, which is a recommended mitigation
            around authentication endpoints [web:103][web:110].
          </li>
          <li>
            Your SOC dashboard logs each attempt as <code>weak_auth_lab</code> with mode, status, and reason.
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Lab3Auth;
