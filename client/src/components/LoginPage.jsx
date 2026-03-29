import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginPage = ({ onSwitch }) => {
  const { login, authError, clearError } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const set = (k) => (e) => { clearError(); setForm(f => ({ ...f, [k]: e.target.value })); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await login(form.email.trim(), form.password);
    setSubmitting(false);
  };

  const fillDemo = () => {
    clearError();
    setForm({ email: 'demo@student.com', password: 'demo1234' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      {/* Ember orbs (Enhanced) */}
      <div style={{ position:'fixed', top:'-10%', left:'-10%', width:500, height:500,
        background:'radial-gradient(circle, rgba(255,140,0,0.15) 0%, transparent 70%)',
        pointerEvents:'none', borderRadius:'50%', filter: 'blur(40px)' }} />
      <div style={{ position:'fixed', bottom:'-5%', right:'-5%', width:400, height:400,
        background:'radial-gradient(circle, rgba(0,212,255,0.1) 0%, transparent 60%)',
        pointerEvents:'none', borderRadius:'50%', filter: 'blur(30px)' }} />

      <div className="glass-card animate-fade-in" style={{ width:'100%', maxWidth:440, padding:'44px 32px', position:'relative', zIndex: 10 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'34px' }}>
          <div style={{
            width:72, height:72, margin:'0 auto 20px',
            background:'linear-gradient(135deg, #FF8C00, #FF4500)',
            borderRadius: '24px', display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'2.2rem', boxShadow:'0 12px 40px rgba(255,140,0,0.4)',
            animation:'float 4s ease-in-out infinite'
          }}>💸</div>
          <h1 className="text-gradient" style={{ fontSize:'1.85rem', fontWeight:800, marginBottom: '8px' }}>
            StudentBudgetAI
          </h1>
          <p style={{ color:'var(--text-dim)', fontSize:'0.9rem', fontWeight: 500 }}>
            Track smarter, save more 🔥
          </p>
        </div>

        {authError && (
          <div className="alert alert-danger" style={{ marginBottom:'20px' }}>
            ⚠️ {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
          <div>
            <label className="form-label">Email Address</label>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:'16px', top:'50%', transform:'translateY(-50%)', fontSize:'1.1rem', opacity: 0.7 }}>📧</span>
              <input type="email" className="form-input" style={{ paddingLeft:'48px' }}
                placeholder="college@email.edu" value={form.email}
                onChange={set('email')} autoComplete="email" required />
            </div>
          </div>

          <div>
            <label className="form-label">Password</label>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:'16px', top:'50%', transform:'translateY(-50%)', fontSize:'1.1rem', opacity: 0.7 }}>🔒</span>
              <input type={showPass ? 'text' : 'password'} className="form-input"
                style={{ paddingLeft:'48px', paddingRight:'48px' }}
                placeholder="••••••••" value={form.password}
                onChange={set('password')} autoComplete="current-password" required />
              <button type="button" onClick={() => setShowPass(v => !v)}
                style={{ position:'absolute', right:'16px', top:'50%', transform:'translateY(-50%)',
                  background:'none', border:'none', cursor:'pointer', fontSize:'1.1rem', color:'var(--text-dim)', transition: '0.2s' }}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary"
            disabled={submitting}
            style={{ width:'100%', marginTop:'8px', height: '54px' }}>
            {submitting
              ? <><span className="spinner" /> Signing in...</>
              : '🚀 Sign In Now'}
          </button>
        </form>

        <div style={{ marginTop:'16px' }}>
          <button onClick={fillDemo} className="btn-ghost"
            style={{ width:'100%', justifyContent:'center', fontSize: '0.85rem', height: '48px', opacity: 0.8 }}>
            🎭 Use Demo Account
          </button>
        </div>

        <hr className="divider" />

        <p style={{ textAlign:'center', fontSize:'0.9rem', color:'var(--text-dim)' }}>
          Don't have an account?{' '}
          <button onClick={onSwitch} style={{
            background:'none', border:'none', cursor:'pointer',
            color:'var(--ember)', fontWeight:700, fontSize:'0.9rem',
            fontFamily:'inherit', textDecoration:'underline', marginLeft: '4px'
          }}>
            Create one →
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
