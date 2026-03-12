import React, { useState, useRef, useEffect } from 'react';

const VOICE_PATTERNS = {
  amount: /(\d+(?:\.\d+)?)\s*(?:rupees?|rs\.?|₹)?/i,
  prefixAmount: /(?:log|add|spent?|paid?)\s+(\d+(?:\.\d+)?)/i
};

const extractFromVoice = (transcript) => {
  const lower = transcript.toLowerCase();

  // Extract amount
  let amount = null;
  const amountMatch = lower.match(VOICE_PATTERNS.prefixAmount) || lower.match(VOICE_PATTERNS.amount);
  if (amountMatch) amount = parseFloat(amountMatch[1]);

  // Extract category keywords
  const categoryMap = {
    Food: ['chai', 'food', 'mess', 'canteen', 'biryani', 'dosa', 'lunch', 'dinner', 'breakfast', 'snack', 'coffee', 'tea'],
    Transport: ['bus', 'auto', 'ola', 'uber', 'rapido', 'metro', 'train', 'bike', 'petrol'],
    Study: ['book', 'notes', 'print', 'fees', 'library', 'photocopy', 'pen', 'stationery'],
    Entertainment: ['movie', 'netflix', 'game', 'cafe', 'outing', 'party', 'concert']
  };

  let detectedCategory = null;
  for (const [cat, words] of Object.entries(categoryMap)) {
    if (words.some(w => lower.includes(w))) { detectedCategory = cat; break; }
  }

  // Extract description (remove trigger words and amount)
  let description = transcript
    .replace(/(?:log|add|spent?|paid?)\s+\d+(?:\.\d+)?\s*(?:rupees?|rs\.?|₹)?\s*/gi, '')
    .replace(/\d+(?:\.\d+)?\s*(?:rupees?|rs\.?|₹)/gi, '')
    .replace(/(?:for|on|at)\s+/gi, '')
    .trim();

  if (!description) description = transcript;

  return { amount, description: description || transcript, category: detectedCategory };
};

const VoiceInput = ({ onResult }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSupported(!!SpeechRecognition);
  }, []);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech not supported in this browser');
      return;
    }
    if (isListening) return;

    setError(null);
    setTranscript('');

    try {
      if (recognitionRef.current) {
        // Abort any existing instance safely
        try { recognitionRef.current.abort(); } catch(e) {}
      }
      const recognition = new SpeechRecognition();
      recognition.lang = window.navigator.language || 'en-US';
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognitionRef.current = recognition;

    recognition.onstart = () => setIsListening(true);
    recognition.onerror = (e) => {
      setIsListening(false);
      console.warn("Speech API Error:", e.error);
      if (e.error === 'no-speech' || e.error === 'aborted') return;
      if (e.error === 'network') {
        setError('Browser voice service unavailable.');
      } else {
        setError(`Voice error: ${e.error}`);
      }
    };
    recognition.onresult = (e) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          finalTranscript += e.results[i][0].transcript;
        } else {
          interimTranscript += e.results[i][0].transcript;
        }
      }
      
      const currentText = finalTranscript || interimTranscript;
      setTranscript(currentText);
      
      if (finalTranscript) {
        const parsed = extractFromVoice(finalTranscript);
        onResult(parsed);
      }
    };

      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
    } catch (e) {
      console.error(e);
      setError('Mic access denied or already listening.');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  };

  if (!supported) {
    return (
      <div title="Voice input not supported in this browser"
        style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
        🎤 <span>Voice N/A</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
      <button
        type="button"
        onClick={isListening ? stopListening : startListening}
        style={{
          width: '44px', height: '44px',
          borderRadius: '50%',
          border: isListening ? '2px solid #FC8181' : '2px solid rgba(139,92,246,0.4)',
          background: isListening
            ? 'linear-gradient(135deg, #c53030, #e53e3e)'
            : 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(59,130,246,0.2))',
          color: '#fff',
          cursor: 'pointer',
          fontSize: '1.1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
          boxShadow: isListening ? '0 0 0 6px rgba(252,129,129,0.2), 0 0 20px rgba(252,129,129,0.3)' : 'none',
          animation: isListening ? 'glow-pulse 1.5s infinite' : 'none',
          position: 'relative'
        }}
        title={isListening ? 'Stop recording' : 'Start voice input (e.g. "Log 50 rupees chai")'}
      >
        {isListening ? '⏹' : '🎤'}
      </button>

      {isListening && (
        <div style={{
          fontSize: '0.72rem', color: 'var(--red)',
          fontWeight: 600, letterSpacing: '0.05em',
          animation: 'fadeIn 0.3s ease'
        }}>
          ● REC
        </div>
      )}

      {transcript && (
        <div style={{
          position: 'absolute',
          top: '100%', right: 0,
          marginTop: '8px',
          background: 'rgba(22,27,34,0.95)',
          border: '1px solid rgba(139,92,246,0.3)',
          borderRadius: '10px',
          padding: '8px 12px',
          fontSize: '0.78rem',
          color: 'var(--text-secondary)',
          maxWidth: '200px',
          zIndex: 50,
          boxShadow: 'var(--shadow)'
        }}>
          🎙 "{transcript}"
        </div>
      )}

      {error && (
        <div style={{ fontSize: '0.72rem', color: 'var(--red)', maxWidth: '150px', textAlign: 'right' }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default VoiceInput;
