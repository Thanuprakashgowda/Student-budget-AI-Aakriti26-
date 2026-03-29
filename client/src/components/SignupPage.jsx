import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const SignupPage = ({ onSwitch }) => {
  const { signup, authError, clearError } = useAuth();
  const [form, setForm] = useState({ name:'', email:'', password:'', confirm:'', college:'' });
  const [submitting, setSubmitting] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [localError, setLocalError] = useState('');

  const set = (k) => (e) => { clearError(); setLocalError(''); setForm(f => ({ ...f, [k]: e.target.value })); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (form.password !== form.confirm) { setLocalError('Passwords do not match'); return; }
    if (form.password.length < 6) { setLocalError('Password must be at least 6 characters'); return; }
    setSubmitting(true);
    await signup(form.name.trim(), form.email.trim(), form.password, form.college.trim());
    setSubmitting(false);
  };

  const error = localError || authError;
  const passwordsMatch = form.confirm && form.password === form.confirm;
  const passwordMismatch = form.confirm && form.password !== form.confirm;

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', position: 'relative', overflow: 'hidden' }}>
      {/* Background orbs (Enhanced) */}
      <div style={{ position:'fixed', top:'5%', right:'-10%', width:450, height:450,
        background:'radial-gradient(circle, rgba(0,230,118,0.12) 0%, transparent 70%)',
        pointerEvents:'none', borderRadius:'50%', filter: 'blur(40px)' }} />
      <div style={{ position:'fixed', bottom:'5%', left:'-10%', width:350, height:350,
        background:'radial-gradient(circle, rgba(255,140,0,0.1) 0%, transparent 60%)',
        pointerEvents:'none', borderRadius:'50%', filter: 'blur(30px)' }} />

      <div className="glass-card animate-fade-in" style={{ width:'100%', maxWidth:480, padding:'40px 32px', position:'relative', zIndex: 10 }}>
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <div style={{
            width:72, height:72, margin:'0 auto 20px',
            background:'linear-gradient(135deg, #00E676, #FF8C00)',
            borderRadius:'24px', display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'2.2rem', boxShadow:'0 12px 40px rgba(0,230,118,0.35)',
            animation:'float 4s ease-in-out infinite'
          }}>🎓</div>
          <h1 className="text-gradient" style={{ fontSize:'1.8rem', fontWeight:800, marginBottom: '8px' }}>
            Join StudentBudgetAI
          </h1>
          <p style={{ color:'var(--text-dim)', fontSize:'0.9rem', fontWeight: 500 }}>
            Smart tracking for modern students 🔥
          </p>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom:'20px' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'18px' }}>
          {/* Name */}
          <div>
            <label className="form-label">Full Name</label>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:'16px', top:'50%', transform:'translateY(-50%)', fontSize:'1.1rem', opacity: 0.7 }}>👤</span>
              <input type="text" className="form-input" style={{ paddingLeft:'48px' }}
                placeholder="Arjun Sharma" value={form.name} onChange={set('name')} autoComplete="name" required />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="form-label">College Email</label>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:'16px', top:'50%', transform:'translateY(-50%)', fontSize:'1.1rem', opacity: 0.7 }}>📧</span>
              <input type="email" className="form-input" style={{ paddingLeft:'48px' }}
                placeholder="you@college.edu" value={form.email} onChange={set('email')} autoComplete="email" required />
            </div>
          </div>

          {/* College */}
          <div>
            <label className="form-label">College / University</label>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:'16px', top:'50%', transform:'translateY(-50%)', fontSize:'1.1rem', opacity: 0.7 }}>🏫</span>
              <input type="text" className="form-input" style={{ paddingLeft:'48px' }}
                placeholder="IIT, NIT, DU, etc." value={form.college} onChange={set('college')} />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="form-label">Strong Password</label>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:'16px', top:'50%', transform:'translateY(-50%)', fontSize:'1.1rem', opacity: 0.7 }}>🔒</span>
              <input type={showPass ? 'text' : 'password'} className="form-input"
                style={{ paddingLeft:'48px', paddingRight:'48px' }}
                placeholder="Min 6 characters" value={form.password} onChange={set('password')} autoComplete="new-password" required />
              <button type="button" onClick={() => setShowPass(v => !v)}
                style={{ position:'absolute', right:'16px', top:'50%', transform:'translateY(-50%)',
                  background:'none', border:'none', cursor:'pointer', fontSize:'1.1rem', color:'var(--text-dim)' }}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
            {form.password && (
              <div style={{ marginTop:'8px', display:'flex', gap:'4px', alignItems:'center' }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{
                    flex:1, height:'4px', borderRadius:'2px', transition:'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: form.password.length >= i * 3
                      ? (form.password.length >= 12 ? 'var(--emerald)' : form.password.length >= 8 ? 'var(--gold)' : 'var(--fire)')
                      : 'rgba(255,255,255,0.06)'
                  }} />
                ))}
                <span style={{ fontSize:'0.75rem', color:'var(--text-dim)', marginLeft:'8px', fontWeight: 600 }}>
                  {form.password.length < 8 ? 'Weak' : form.password.length < 12 ? 'Medium' : 'Strong'}
                </span>
              </div>
            )}
          </div>

          {/* Confirm */}
          <div>
            <label className="form-label">Confirm Password</label>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:'16px', top:'50%', transform:'translateY(-50%)', fontSize:'1.1rem', opacity: 0.7 }}>
                {passwordsMatch ? '✅' : passwordMismatch ? '❌' : '🔑'}
              </span>
              <input type={showPass ? 'text' : 'password'} className="form-input"
                style={{ 
                  paddingLeft:'48px', 
                  borderColor: passwordMismatch ? 'rgba(255, 82, 82, 0.5)' : passwordsMatch ? 'rgba(0, 230, 118, 0.5)' : undefined,
                  boxShadow: passwordsMatch ? '0 0 0 4px rgba(0, 230, 118, 0.05)' : undefined
                }}
                placeholder="Repeat password" value={form.confirm} onChange={set('confirm')} required />
            </div>
          </div>

          <button type="submit" className="btn-success"
            disabled={submitting}
            style={{ width:'100%', height: '54px', marginTop:'10px' }}>
            {submitting
              ? <><span className="spinner" style={{ borderTopColor:'#000' }} /> Creating account...</>
              : '🎉 Create My Account'}
          </button>
        </form>

        <hr className="divider" />
        
        <p style={{ textAlign:'center', fontSize:'0.9rem', color:'var(--text-dim)' }}>
          Already have an account?{' '}
          <button onClick={onSwitch} style={{
            background:'none', border:'none', cursor:'pointer',
            color:'var(--ember)', fontWeight:700, fontSize:'0.9rem',
            fontFamily:'inherit', textDecoration:'underline', marginLeft: '4px'
          }}>Sign in →</button>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
