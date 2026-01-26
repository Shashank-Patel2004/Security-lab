// src/components/Dashboard.js
import React from 'react';
import { auth } from '../firebase';

const Dashboard = ({ user }) => {
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
          <h2>Dashboard</h2>
          <p><strong>{user.email}</strong> ({user.role}) | Labs: {user.labsCompleted?.length || 0} | Points: {user.points || 0}</p>
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
            padding: '8px 16px',
            borderRadius: 4,
            cursor: 'pointer'
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
          <LabCard title="Lab 1: XSS" status="locked" desc="Stored Cross-Site Scripting" />
          <LabCard title="Lab 2: IDOR" status="locked" desc="Insecure Direct Object Reference" />
          <LabCard title="Lab 3: Weak Auth" status="locked" desc="Brute Force & Session Issues" />
        </div>
      </div>
      
      {user.role === 'admin' && (
        <div style={{ 
          margin: 20, 
          padding: 20, 
          background: '#e3f2fd', 
          borderRadius: 8,
          borderLeft: '4px solid #2196f3'
        }}>
          <h3>🔍 Admin: Security Logs</h3>
          <p>📊 <strong>Check Firestore now:</strong> `logs` collection has your login events!</p>
          <p>Tomorrow: Real-time dashboard + alerts.</p>
        </div>
      )}
    </div>
  );
};

const LabCard = ({ title, status, desc }) => (
  <div style={{
    border: status === 'locked' ? '2px solid #ff9800' : '2px solid #4caf50',
    borderRadius: 8,
    padding: 20,
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  }}>
    <h4>{title}</h4>
    <p style={{ color: '#666', fontSize: 14 }}>{desc}</p>
    <p><strong>Status:</strong> <span style={{ 
      color: status === 'locked' ? '#f44336' : '#4caf50',
      fontWeight: 'bold'
    }}>{status}</span></p>
    <button disabled style={{ 
      padding: '10px 20px', 
      opacity: status === 'locked' ? 0.5 : 1,
      background: status === 'locked' ? '#ccc' : '#4caf50',
      color: 'white',
      border: 'none',
      borderRadius: 4,
      cursor: status === 'locked' ? 'not-allowed' : 'pointer'
    }}>
      {status === 'locked' ? 'Unlock Tomorrow' : 'Start Lab'}
    </button>
  </div>
);

export default Dashboard;
