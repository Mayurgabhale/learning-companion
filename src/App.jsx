import React, { useState } from 'react';
import { BookOpen, Brain, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import './index.css';
import { generateLesson } from './services/geminiService';

function App() {
  const [stage, setStage] = useState('initial'); // initial, loading, lesson, quiz, feedback
  const [topic, setTopic] = useState('');
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [lessonData, setLessonData] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerateLesson = async (e, retryScore = null) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;
    
    setStage('loading');
    setError(null);
    try {
      const data = await generateLesson(topic, retryScore);
      setLessonData(data);
      setStage('lesson');
    } catch (err) {
      setError('Failed to generate lesson. Make sure your API key is set in .env.');
      setStage('initial');
    }
  };

  const handleSubmitQuiz = () => {
    let currentScore = 0;
    lessonData.questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        currentScore++;
      }
    });
    setScore(currentScore);
    setStage('feedback');
  };

  const handleReset = () => {
    setStage('initial');
    setTopic('');
    setAnswers({});
    setScore(0);
    setLessonData(null);
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1>Learning Companion</h1>
        <p>AI-Powered Adaptive Learning</p>
      </div>

      {stage === 'initial' && (
        <form onSubmit={handleGenerateLesson} className="animation-fade-in">
          <div className="input-group">
            <input
              type="text"
              className="input-field"
              placeholder="What do you want to learn today? (e.g. Quantum Computing)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              autoFocus
            />
            <button type="submit" className="btn" disabled={!topic.trim()}>
              <Sparkles size={20} />
              Generate Lesson
            </button>
          </div>
          {error && <p style={{ color: 'var(--error)', marginTop: '1rem', textAlign: 'center' }}>{error}</p>}
        </form>
      )}

      {stage === 'loading' && (
        <div className="animation-fade-in" style={{ textAlign: 'center', padding: '2rem' }}>
          <Sparkles size={48} style={{ color: 'var(--accent-primary)', marginBottom: '1rem', animation: 'pulse 1.5s infinite' }} />
          <h3>Generating personalized lesson...</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Analyzing your request using Gemini 3.1 Pro</p>
        </div>
      )}

      {stage === 'lesson' && lessonData && (
        <div className="animation-slide-in">
          <div className="lesson-content">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--accent-primary)' }}>
              <BookOpen size={20} />
              Topic: {topic}
            </h3>
            <div className="markdown-content" style={{ marginBottom: '1rem' }}>
              <ReactMarkdown>{lessonData.explanation}</ReactMarkdown>
            </div>
          </div>
          <button onClick={() => setStage('quiz')} className="btn">
            <Brain size={20} />
            Take Quiz
          </button>
        </div>
      )}

      {stage === 'quiz' && lessonData && (
        <div className="animation-fade-in">
          {lessonData.questions.map((q, index) => (
            <div key={q.id} className="question-card" style={{ animationDelay: `${index * 0.1}s` }}>
              <h3 className="question-text">{index + 1}. {q.text}</h3>
              <div className="options-grid">
                {q.options.map(opt => (
                  <button
                    key={opt.id}
                    className={`option-btn ${answers[q.id] === opt.id ? 'selected' : ''}`}
                    onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt.id }))}
                  >
                    <span className="option-letter">{opt.id.toUpperCase()}</span>
                    {opt.text}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button 
            onClick={handleSubmitQuiz} 
            className="btn"
            disabled={Object.keys(answers).length < lessonData.questions.length}
            style={{ marginTop: '2rem' }}
          >
            <CheckCircle2 size={20} />
            Submit Answers
          </button>
        </div>
      )}

      {stage === 'feedback' && lessonData && (
        <div className="feedback-card">
          <div className={`score-display ${score === lessonData.questions.length ? 'score-success' : 'score-need-help'}`}>
            {score}/{lessonData.questions.length}
          </div>
          
          <div className="feedback-message">
            {score === lessonData.questions.length ? (
              <div style={{ color: 'var(--success)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <Sparkles size={48} />
                <p>Excellent! Ready to dive deeper into {topic}?</p>
              </div>
            ) : (
              <div style={{ color: 'var(--accent-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <BookOpen size={48} />
                <p>Let's review this with a simpler approach.</p>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'center' }}>
            <button 
              onClick={() => {
                setAnswers({});
                setScore(0);
                handleGenerateLesson(null, score);
              }} 
              className="btn"
            >
              {score === lessonData.questions.length ? "Go Deeper" : "Review Topic"}
              <Brain size={20} />
            </button>
            <button onClick={handleReset} className="btn" style={{ background: 'rgba(255,255,255,0.1)' }}>
              New Topic
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
