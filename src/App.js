// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { auth, db } from './firebase';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Lab1XSS from './components/Lab1XSS';  
import Lab2IDOR from './components/Lab2IDOR';
import Lab3AUTH from "./components/Lab3AUTH";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(false);
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUser({ ...currentUser, ...userDoc.data() });
          } else {
            setUser({ ...currentUser, role: 'user' });
          }
        } catch (error) {
          console.error('User fetch error:', error);
          setUser({ ...currentUser, role: 'user' });
        }
      }
    });
    return unsubscribe;
  }, []);

  if (loading) return <div style={{ textAlign: 'center', marginTop: 50 }}>Loading...</div>;

  return (
    <Router>
      <div style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={!user ? <Auth setUser={setUser} /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/" />} />
          <Route path="/lab1" element={user ? <Lab1XSS user={user} /> : <Navigate to="/" />} />
          <Route path="/lab2" element={user ? <Lab2IDOR user={user} /> : <Navigate to="/" />} />
          <Route path="/lab3" element={user ? <Lab3AUTH user={user} />: <Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
