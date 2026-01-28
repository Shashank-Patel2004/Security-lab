// src/components/Dashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

const Dashboard = ({ user }) => {
  const navigate = useNavigate();  
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (user.role !== 'admin') return;

    const q = query(
      collection(db, 'logs'),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const items = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setLogs(items);
    });

    return () => unsub();
  }, [user.role]);

  return (
    <div>
      <div style={{ 
        background: '#f5f5f5', 
        padding: 20, 
        borderRadius: 8, 
        marginBottom: 20,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h2>🔒 Security Lab Dashboard</h2>
          <p>
            <strong>{user.email}</strong> | Role: <span style={{ 
              color: user.role === 'admin' ? 'green' : 'orange' 
            }}>{user.role}</span> | 
            Labs: {user.labsCompleted?.length || 0} | Points: {user.points || 0}
          </p>
        </div>
        <button 
          onClick={async () => {
            await auth.signOut();
            window.location.href = '/';
          }} 
          style={{ 
            background: '#ff4444', 
            color: 'white',
            border: 'none', 
            padding: '10px 20px',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Logout
        </button>
      </div>

      <div style={{ margin: 20 }}>
        <h3>🔬 Available Labs</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: 20 
        }}>
          <LabCard 
            title="Lab 1: XSS" 
            status="ready"  // Changed from locked
            desc="Stored Cross-Site Scripting in comments"
            onClick={() => navigate('/lab1')}  // ACTIVE BUTTON
          />
          <LabCard
            title="Lab 2: IDOR"
            status="ready"
            desc="Insecure Direct Object Reference"
            onClick={() => navigate('/lab2')}
          />
          <LabCard title="Lab 3: Weak Auth" status="locked" desc="Brute Force & Session Weaknesses" />
        </div>
      </div>
      
      {user.role === 'admin' && (
        <div style={{ 
          margin: 20, 
          padding: 20, 
          background: '#e3f2fd', 
          borderRadius: 8,
          borderLeft: '5px solid #2196f3'
        }}>
          <h3>🔍 Security Operations Center (SOC)</h3>
          <p style={{ fontSize: 14, color: '#555', marginBottom: 15 }}>
            Real-time monitoring of login/signup events. Only admins see this.
          </p>

          {logs.length === 0 ? (
            <div style={{ padding: 20, background: '#fff3e0', borderRadius: 4 }}>
              <p>📝 No logs yet. Try logging out/in to generate events!</p>
            </div>
          ) : (
            <div style={{ maxHeight: 300, overflow: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse', 
                fontSize: 13,
                background: 'white',
                borderRadius: 6,
                overflow: 'hidden',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}>
                <thead>
                  <tr style={{ background: '#bbdefb' }}>
                    <th style={tableStyle}>Time</th>
                    <th style={tableStyle}>Event</th>
                    <th style={tableStyle}>Email</th>
                    <th style={tableStyle}>User ID</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.slice(0, 10).map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={tableStyle}>{new Date(log.timestamp).toLocaleString()}</td>
                      <td style={tableStyle}><span style={{ 
                        color: log.event.includes('success') ? '#4caf50' : '#ff9800',
                        fontWeight: 'bold'
                      }}>{log.event}</span></td>
                      <td style={tableStyle}>{log.email}</td>
                      <td style={tableStyle}>{log.userId.slice(0, 8)}...</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const LabCard = ({ title, status, desc, onClick }) => (
  <div style={{
    border: status === 'locked' ? '3px solid #ff9800' : '3px solid #4caf50',
    borderRadius: 12,
    padding: 25,
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    transition: 'all 0.3s',
    cursor: onClick ? 'pointer' : 'default'
  }}
  onClick={onClick}  // Click entire card!
  >
    <h4 style={{ marginBottom: 10 }}>{title}</h4>
    <p style={{ color: '#666', fontSize: 14, marginBottom: 15 }}>{desc}</p>
    <p><strong>Status:</strong> <span style={{ 
      color: status === 'locked' ? '#f44336' : '#4caf50',
      fontWeight: 'bold',
      fontSize: 16
    }}>{status.toUpperCase()}</span></p>
    <button style={{ 
      padding: '12px 24px', 
      background: status === 'locked' ? '#ff9800' : '#4caf50',
      color: 'white',
      border: 'none',
      borderRadius: 6,
      cursor: 'pointer',
      fontSize: 14,
      fontWeight: 'bold',
      opacity: status === 'locked' ? 0.7 : 1
    }}>
      {status === 'locked' ? '🔒 Coming Soon' : '🚀 Start Lab'}
    </button>
  </div>
);

const tableStyle = { 
  border: '1px solid #90caf9', 
  padding: '12px 8px', 
  textAlign: 'left',
  fontSize: 13
};

export default Dashboard;
