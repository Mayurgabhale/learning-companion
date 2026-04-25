import React, { useState, useEffect, useRef } from 'react';
import { startSocraticSession, continueSocraticSession } from './services/geminiService';
import ReactMarkdown from 'react-markdown';
import { Sparkles, Send, RefreshCw, BookOpen, GraduationCap } from 'lucide-react';

function App() {
  const [topic, setTopic] = useState('');
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentStep, setCurrentStep] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleStart = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setMessages([]);
    setFeedback(null);
    try {
      const session = await startSocraticSession(topic);
      setChat(session.chat);
      setCurrentStep(session.data);
      setMessages([{ role: 'ai', text: session.data.explanation }]);
    } catch (error) {
      console.error(error);
      alert('Failed to start session. Check your API key.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (optionId) => {
    if (loading) return;

    const isCorrect = optionId === currentStep.correctAnswer;
    const selectedText = currentStep.options.find(o => o.id === optionId).text;
    
    // Add user message
    const newMessages = [...messages, { role: 'user', text: selectedText }];
    setMessages(newMessages);
    
    setLoading(true);
    setFeedback(isCorrect ? 'correct' : 'wrong');

    try {
      const nextData = await continueSocraticSession(chat, `I choose option ${optionId}: ${selectedText}`);
      setCurrentStep(nextData);
      setMessages(prev => [...prev, { role: 'ai', text: nextData.explanation }]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setFeedback(null);
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1><GraduationCap style={{ marginRight: '10px' }} /> Socratic Tutor</h1>
        <p className="subtitle">Master any concept through intelligent dialogue</p>
      </header>

      {!chat ? (
        <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <form onSubmit={handleStart}>
            <div className="input-group">
              <input
                type="text"
                placeholder="What do you want to learn today?"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={loading}
              />
              <button type="submit" disabled={loading || !topic.trim()}>
                {loading ? <RefreshCw className="animate-spin" /> : <Sparkles size={20} />}
                Start Learning
              </button>
            </div>
          </form>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>
            Try: "Quantum Physics", "Photosynthesis", or "How an engine works"
          </div>
        </div>
      ) : (
        <div className="chat-window">
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.role}`}>
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
          ))}

          {loading && (
            <div className="message ai">
              <div className="loading-dots">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>
          )}

          {!loading && currentStep && !currentStep.isTopicComplete && (
            <div className="message ai question-box">
              <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Quick Check:</h3>
              <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>{currentStep.question}</p>
              <div className="options-grid">
                {currentStep.options.map((option) => (
                  <button
                    key={option.id}
                    className="option-btn"
                    onClick={() => handleAnswer(option.id)}
                  >
                    <strong style={{ color: 'var(--primary)', marginRight: '8px' }}>{option.id.toUpperCase()}:</strong> {option.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep?.isTopicComplete && (
            <div className="glass-card" style={{ textAlign: 'center', marginTop: '2rem' }}>
              <h2 style={{ color: '#10b981', marginBottom: '1rem' }}>🎉 Topic Mastered!</h2>
              <p>You've successfully completed the dialogue on {topic}.</p>
              <button 
                onClick={() => { setChat(null); setTopic(''); }}
                style={{ margin: '1.5rem auto 0' }}
              >
                Learn Something Else
              </button>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      )}
    </div>
  );
}

export default App;
