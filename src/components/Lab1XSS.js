// src/components/Lab1XSS.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

const Lab1XSS = ({ user }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('vulnerable'); // 'vulnerable' | 'secure'
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);

  const postComment = async () => {
    if (!newComment.trim()) return;

    const timestamp = new Date().toISOString();

    // Log to SOC
    try {
      await addDoc(collection(db, 'logs'), {
        userId: user.uid,
        email: user.email,
        event: 'xss_lab_attempt',
        payload: newComment,
        mode,
        timestamp
      });
    } catch (e) {
      console.error('Log error:', e);
    }

    let storedText = newComment;

    if (mode === 'secure') {
      // Simple escaping so HTML is not interpreted
      storedText = newComment
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    const comment = {
      id: Date.now(),
      text: storedText,
      original: newComment,
      timestamp
    };

    setComments([comment, ...comments]);
    setNewComment('');
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
        color: mode === 'vulnerable' ? '#ff5722' : '#4caf50',
        marginBottom: 10
      }}>
        Lab 1: XSS ({mode.toUpperCase()})
      </h1>

      <p style={{ marginBottom: 20, color: '#555' }}>
        Demonstrates how unescaped user input can lead to Cross-Site Scripting in a comment system.
        Use payloads like <code>&lt;script&gt;alert('XSS')&lt;/script&gt;</code> or
        <code>&lt;img src=x onerror=alert(1)&gt;</code>.
      </p>

      <div
        style={{
          borderRadius: 12,
          border: `3px solid ${mode === 'vulnerable' ? '#ff5722' : '#4caf50'}`,
          padding: 20,
          background: '#f9f9f9'
        }}
      >
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <button
            onClick={() => setMode('vulnerable')}
            style={{
              padding: '10px 20px',
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              background: mode === 'vulnerable' ? '#ff5722' : '#ddd',
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

        <p style={{ color: '#666', marginBottom: 15 }}>
          {mode === 'vulnerable'
            ? '💥 Vulnerable: Comments are rendered as raw HTML using dangerouslySetInnerHTML. XSS payloads will execute.'
            : '🛡️ Secure: User input is HTML-escaped before rendering. XSS payloads are shown as plain text.'}
        </p>

        <div style={{ marginBottom: 20 }}>
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Try: <script>alert('XSS')</script> or <img src=x onerror=alert(1)>"
            style={{
              width: '65%',
              padding: 14,
              fontSize: 15,
              borderRadius: 6,
              border: '2px solid #ccc',
              marginRight: 10
            }}
          />
          <button
            onClick={postComment}
            style={{
              padding: '14px 26px',
              borderRadius: 6,
              border: 'none',
              background: '#2196f3',
              color: 'white',
              fontSize: 15,
              cursor: 'pointer'
            }}
          >
            Post Comment
          </button>
        </div>

        <div style={{ marginTop: 10 }}>
          {comments.length === 0 && (
            <p style={{ color: '#777' }}>No comments yet. Try posting an XSS payload.</p>
          )}

          {comments.map((c) => (
            <div
              key={c.id}
              style={{
                background: 'white',
                padding: 16,
                marginBottom: 12,
                borderRadius: 8,
                borderLeft: '4px solid #2196f3',
                boxShadow: '0 2px 5px rgba(0,0,0,0.08)'
              }}
            >
              {/* Vulnerable rendering: uses HTML directly */}
              <div dangerouslySetInnerHTML={{ __html: c.text }} />
              <small style={{ display: 'block', marginTop: 6, color: '#888' }}>
                {new Date(c.timestamp).toLocaleString()}
              </small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Lab1XSS;
