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
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
      {/* Ember orbs */}
      <div style={{ position:'fixed', top:'12%', right:'8%', width:350, height:350,
        background:'radial-gradient(circle, rgba(255,140,0,0.11) 0%, transparent 65%)',
        pointerEvents:'none', borderRadius:'50%' }} />
      <div style={{ position:'fixed', bottom:'12%', left:'8%', width:260, height:260,
        background:'radial-gradient(circle, rgba(0,230,118,0.08) 0%, transparent 65%)',
        pointerEvents:'none', borderRadius:'50%' }} />

      <div className="glass-card animate-fade-in" style={{ width:'100%', maxWidth:460, padding:'40px 36px' }}>
        <div style={{ textAlign:'center', marginBottom:'28px' }}>
          <div style={{
            width:68, height:68, margin:'0 auto 16px',
            background:'linear-gradient(135deg, #00C853, #FF8C00)',
            borderRadius:'22px', display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'2.1rem', boxShadow:'0 8px 32px rgba(0,200,83,0.3)',
            animation:'float 3s ease-in-out infinite'
          }}>🎓</div>
          <h1 style={{ fontSize:'1.5rem', fontWeight:800,
            background:'linear-gradient(135deg, #00E676, #FFB347)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            Join StudentBudgetAI
          </h1>
          <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', marginTop:'4px' }}>
            Start your financial journey 🔥
          </p>
        </div>

        {error && <div className="alert alert-danger" style={{ marginBottom:'16px' }}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          {/* Name */}
          <div>
            <label className="form-label">Full Name</label>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', fontSize:'1rem' }}>👤</span>
              <input type="text" className="form-input" style={{ paddingLeft:'40px' }}
                placeholder="Arjun Sharma" value={form.name} onChange={set('name')} autoComplete="name" required />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="form-label">Email</label>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', fontSize:'1rem' }}>📧</span>
              <input type="email" className="form-input" style={{ paddingLeft:'40px' }}
                placeholder="you@college.edu" value={form.email} onChange={set('email')} autoComplete="email" required />
            </div>
          </div>

          {/* College */}
          <div>
            <label className="form-label">College <span style={{ color:'var(--text-muted)', fontWeight:400 }}>(optional)</span></label>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', fontSize:'1rem' }}>🏫</span>
              <input type="text" className="form-input" style={{ paddingLeft:'40px' }}
                placeholder="IIT / NIT / DU..." value={form.college} onChange={set('college')} />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="form-label">Password</label>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', fontSize:'1rem' }}>🔒</span>
              <input type={showPass ? 'text' : 'password'} className="form-input"
                style={{ paddingLeft:'40px', paddingRight:'44px' }}
                placeholder="Min 6 characters" value={form.password} onChange={set('password')} autoComplete="new-password" required />
              <button type="button" onClick={() => setShowPass(v => !v)}
                style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)',
                  background:'none', border:'none', cursor:'pointer', fontSize:'1rem', color:'var(--text-muted)' }}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
            {form.password && (
              <div style={{ marginTop:'6px', display:'flex', gap:'4px', alignItems:'center' }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{
                    flex:1, height:'3px', borderRadius:'2px', transition:'all 0.3s',
                    background: form.password.length >= i * 4
                      ? (form.password.length >= 10 ? 'var(--green)' : form.password.length >= 7 ? 'var(--yellow)' : 'var(--red)')
                      : 'rgba(255,255,255,0.08)'
                  }} />
                ))}
                <span style={{ fontSize:'0.7rem', color:'var(--text-muted)', marginLeft:'6px', whiteSpace:'nowrap' }}>
                  {form.password.length < 7 ? 'Weak' : form.password.length < 10 ? 'Medium' : 'Strong'}
                </span>
              </div>
            )}
          </div>

          {/* Confirm */}
          <div>
            <label className="form-label">Confirm Password</label>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', fontSize:'1rem' }}>
                {passwordsMatch ? '✅' : passwordMismatch ? '❌' : '🔑'}
              </span>
              <input type={showPass ? 'text' : 'password'} className="form-input"
                style={{ paddingLeft:'40px', borderColor: passwordMismatch ? 'var(--red)' : passwordsMatch ? 'var(--green)' : undefined }}
                placeholder="Repeat password" value={form.confirm} onChange={set('confirm')} required />
            </div>
          </div>

          <button type="submit" className="btn btn-success"
            disabled={submitting}
            style={{ width:'100%', justifyContent:'center', padding:'14px', fontSize:'1rem', marginTop:'4px' }}>
            {submitting
              ? <><span className="spinner" style={{ width:18, height:18, borderWidth:2, borderTopColor:'#0C0A07' }} /> Creating account...</>
              : '🎉 Create Account'}
          </button>
        </form>

        <hr className="divider" style={{ margin:'20px 0' }} />
        <p style={{ textAlign:'center', fontSize:'0.88rem', color:'var(--text-secondary)' }}>
          Already have an account?{' '}
          <button onClick={onSwitch} style={{
            background:'none', border:'none', cursor:'pointer',
            color:'var(--amber-light)', fontWeight:700, fontSize:'0.88rem',
            fontFamily:'inherit', textDecoration:'underline'
          }}>Sign in →</button>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
