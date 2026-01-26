// src/components/Auth.js
import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const Auth = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    let credential;
    if (isLogin) {
      credential = await signInWithEmailAndPassword(auth, email, password);
    } else {
      credential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', credential.user.uid), {
        email: credential.user.email,
        role: 'user',
        labsCompleted: [],
        points: 0,
        createdAt: new Date().toISOString()
      });
    }
    
    // Log the event
    await setDoc(doc(db, 'logs', Date.now().toString()), {
      userId: credential.user.uid,
      event: isLogin ? 'login_success' : 'signup_success',
      email: credential.user.email,
      timestamp: new Date().toISOString(),
      ip: 'demo-ip'
    });
    
  } catch (error) {
    alert(error.message);
  }
  setLoading(false);
};

  return (
    <div style={{
      maxWidth: 400,
      margin: '50px auto',
      padding: 30,
      border: '1px solid #ddd',
      borderRadius: 8
    }}>
      <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          style={inputStyle}
        />
        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? 'Loading...' : (isLogin ? 'Login' : 'Sign Up')}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: 20 }}>
        <button type="button" onClick={() => setIsLogin(!isLogin)} style={linkStyle}>
          {isLogin ? 'Create new account' : 'Already have account? Login'}
        </button>
      </p>
    </div>
  );
};

const inputStyle = {
  display: 'block',
  width: '100%',
  padding: '12px',
  margin: '10px 0',
  border: '1px solid #ddd',
  borderRadius: 4,
  boxSizing: 'border-box'
};

const buttonStyle = {
  width: '100%',
  padding: '12px',
  background: '#4285f4',
  color: 'white',
  border: 'none',
  borderRadius: 4,
  fontSize: 16,
  cursor: 'pointer'
};

const linkStyle = { background: 'none', border: 'none', color: '#4285f4', cursor: 'pointer' };

export default Auth;
