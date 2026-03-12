import React, { useState, useRef, useEffect } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import { useCategories } from '../hooks/useCategories';
import { useAuth } from '../context/AuthContext';

const Chatbot = () => {
  const { user } = useAuth();
  const { expenses } = useExpenses();
  const { CATEGORY_BUDGETS } = useCategories(user?._id);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    if (user?._id) {
      const saved = localStorage.getItem(`sba_chat_${user._id}`);
      if (saved) return JSON.parse(saved);
    }
    return [{ role: 'ai', text: `Hi ${user?.name?.split(' ')[0] || 'there'}! I'm StudentBudgetAI. Ask me anything about your spending or budget!` }];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Persist messages whenever they change
  useEffect(() => {
    if (user?._id && messages.length > 0) {
      localStorage.setItem(`sba_chat_${user._id}`, JSON.stringify(messages));
    }
  }, [messages, user?._id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          expenses: expenses,
          budgets: CATEGORY_BUDGETS
        })
      });

      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: data.message || 'Sorry, I encountered an error.' }]);
      }
    } catch (error) {
      console.error('Chat processing error:', error);
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I cannot reach the server right now.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '16px' }}>
      {isOpen && (
        <div className="glass-card animate-fade-in" style={{ width: '340px', height: '480px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 8px 32px rgba(8,12,20,0.8)' }}>
          {/* Header */}
          <div style={{ padding: '16px', background: 'rgba(255,140,0,0.1)', borderBottom: '1px solid rgba(255,140,0,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.5rem' }}>🤖</span>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--amber)' }}>Budget AI</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Always here to help</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                title="Clear Chat History"
                onClick={() => {
                  if (window.confirm("Clear all chat history?")) {
                    setMessages([{ role: 'ai', text: `Hi ${user?.name?.split(' ')[0] || 'there'}! I'm StudentBudgetAI. Ask me anything about your spending or budget!` }]);
                    if (user?._id) localStorage.removeItem(`sba_chat_${user._id}`);
                  }
                }} 
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                🗑️
              </button>
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                <div style={{
                  padding: '10px 14px', borderRadius: '14px', fontSize: '0.88rem', lineHeight: '1.4',
                  background: m.role === 'user' ? 'linear-gradient(135deg, #FF8C00, #FF4500)' : 'rgba(255,255,255,0.05)',
                  color: m.role === 'user' ? '#fff' : 'var(--text-primary)',
                  borderBottomRightRadius: m.role === 'user' ? '4px' : '14px',
                  borderBottomLeftRadius: m.role === 'ai' ? '4px' : '14px',
                  border: m.role === 'ai' ? '1px solid rgba(255,255,255,0.1)' : 'none',
                  whiteSpace: 'pre-wrap'
                }}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.05)', padding: '10px 14px', borderRadius: '14px', borderBottomLeftRadius: '4px' }}>
                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="form-input"
              style={{ flex: 1, padding: '10px 14px', borderRadius: '20px' }}
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className="btn btn-primary" style={{ borderRadius: '20px', padding: '10px 16px' }} disabled={loading || !input.trim()}>
              ➔
            </button>
          </form>
        </div>
      )}

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF8C00, #FF4500)',
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem', boxShadow: '0 4px 20px rgba(255,140,0,0.4)',
            transition: 'transform 0.2s',
            animation: 'glow-pulse 2s infinite'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          ✨
        </button>
      )}
    </div>
  );
};

export default Chatbot;
