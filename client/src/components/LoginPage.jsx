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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      {/* Ember orbs */}
      <div style={{ position:'fixed', top:'8%', left:'6%', width:420, height:420,
        background:'radial-gradient(circle, rgba(255,140,0,0.13) 0%, transparent 68%)',
        pointerEvents:'none', borderRadius:'50%' }} />
      <div style={{ position:'fixed', bottom:'10%', right:'8%', width:300, height:300,
        background:'radial-gradient(circle, rgba(0,212,255,0.09) 0%, transparent 65%)',
        pointerEvents:'none', borderRadius:'50%' }} />

      <div className="glass-card animate-fade-in" style={{ width:'100%', maxWidth:440, padding:'44px 38px', position:'relative' }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'34px' }}>
          <div style={{
            width:68, height:68, margin:'0 auto 16px',
            background:'linear-gradient(135deg, #FF8C00, #FF4500)',
            borderRadius:'22px', display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'2.1rem', boxShadow:'0 8px 32px rgba(255,140,0,0.45)',
            animation:'float 3s ease-in-out infinite'
          }}>💸</div>
          <h1 style={{ fontSize:'1.65rem', fontWeight:800,
            background:'linear-gradient(135deg, #FFB347, #00D4FF)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            StudentBudgetAI
          </h1>
          <p style={{ color:'var(--text-muted)', fontSize:'0.87rem', marginTop:'5px' }}>
            Track smarter, save more 🔥
          </p>
        </div>

        {authError && (
          <div className="alert alert-danger" style={{ marginBottom:'16px' }}>⚠️ {authError}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          <div>
            <label className="form-label">Email</label>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', fontSize:'1rem' }}>📧</span>
              <input type="email" className="form-input" style={{ paddingLeft:'40px' }}
                placeholder="your@email.com" value={form.email}
                onChange={set('email')} autoComplete="email" required />
            </div>
          </div>

          <div>
            <label className="form-label">Password</label>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', fontSize:'1rem' }}>🔒</span>
              <input type={showPass ? 'text' : 'password'} className="form-input"
                style={{ paddingLeft:'40px', paddingRight:'44px' }}
                placeholder="••••••••" value={form.password}
                onChange={set('password')} autoComplete="current-password" required />
              <button type="button" onClick={() => setShowPass(v => !v)}
                style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)',
                  background:'none', border:'none', cursor:'pointer', fontSize:'1rem', color:'var(--text-muted)' }}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary"
            disabled={submitting}
            style={{ width:'100%', justifyContent:'center', padding:'14px', fontSize:'1rem', marginTop:'4px' }}>
            {submitting
              ? <><span className="spinner" style={{ width:18, height:18, borderWidth:2 }} /> Signing in...</>
              : '🚀 Sign In'}
          </button>
        </form>

        <div style={{ marginTop:'14px' }}>
          <button onClick={fillDemo} className="btn btn-ghost"
            style={{ width:'100%', justifyContent:'center', fontSize:'0.82rem' }}>
            🎭 Use Demo Account (demo@student.com / demo1234)
          </button>
        </div>

        <hr className="divider" style={{ margin:'20px 0' }} />

        <p style={{ textAlign:'center', fontSize:'0.88rem', color:'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <button onClick={onSwitch} style={{
            background:'none', border:'none', cursor:'pointer',
            color:'var(--amber-light)', fontWeight:700, fontSize:'0.88rem',
            fontFamily:'inherit', textDecoration:'underline'
          }}>
            Create account →
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
