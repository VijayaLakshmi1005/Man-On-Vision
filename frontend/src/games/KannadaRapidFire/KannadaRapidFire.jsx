import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Clock, Trophy, ChevronRight, Sparkles, 
  RotateCcw, ArrowRight, CheckCircle2, XCircle
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import GameLayout from '../common/GameLayout';
import GuestNameModal from '../common/GuestNameModal';
import { useSound } from '../common/useSound';
import { API_URL } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import './KannadaRapidFire.css';

const KannadaRapidFire = () => {
  const { user } = useAuth();
  const [gameState, setGameState] = useState('landing'); // landing, playing, result
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [loading, setLoading] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [guestName, setGuestName] = useState(localStorage.getItem('guest_name') || '');
  const [answered, setAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [questionsCount, setQuestionsCount] = useState(0);
  const [language, setLanguage] = useState(localStorage.getItem('rapid_fire_lang') || 'en');

  const timerRef = useRef(null);
  const { playSound } = useSound();

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/games/data`, {
        params: { 
          gameType: 'kannada_rapid_fire',
          all: 'true' // Get all active questions to shuffle locally
        }
      });
      
      console.log(`[DEBUG] Fetched ${res.data?.length} questions for ${language}`);
      if (res.data && res.data.length > 0) {
        setQuestions(res.data);
      } else {
        console.warn('No questions returned from API');
      }
    } catch (err) {
      console.error('Failed to fetch questions pool', err);
      toast.error('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  useEffect(() => {
    if (gameState === 'playing' && !answered && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleAnswer(null); // Timeout
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [gameState, answered, timeLeft]);

  const startGame = () => {
    if (!user && !guestName) {
      setShowNameModal(true);
      return;
    }
    if (questions.length === 0) {
      toast.error("No questions found! Please add them in the Admin Manager first.");
      return;
    }

    // Shuffle and pick 5
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 5);
    
    setShuffledQuestions(selected);
    setCurrentQuestion(selected[0]);
    setScore(0);
    setStreak(0);
    setQuestionsCount(0);
    setAnswered(false);
    setSelectedOption(null);
    setTimeLeft(10);
    setGameState('playing');
    playSound('start');
  };

  const handleNameComplete = (name) => {
    setGuestName(name);
    setShowNameModal(false);
    // After setting name, we need to start the game
    // Note: startGame uses current guestName, so we might need to pass it or wait for state
    setTimeout(() => startGame(), 100);
  };

  const handleAnswer = (option) => {
    if (answered || !currentQuestion) return;
    
    setAnswered(true);
    setSelectedOption(option);
    
    // Check correctness against English options as anchor if current language is empty
    const currentOptions = currentQuestion[`options_${language}`] || [];
    const isEffectivelyEmpty = currentOptions.length === 0 || currentOptions.every(opt => !opt);
    const optionsToCompare = isEffectivelyEmpty ? currentQuestion.options_en : currentOptions;
    
    const correct = optionsToCompare.indexOf(option) === currentQuestion.correctAnswerIndex;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
      playSound('success');
    } else {
      setStreak(0);
      playSound('error');
    }

    // Next question or result
    setTimeout(() => {
      const nextIndex = questionsCount + 1;
      if (nextIndex < shuffledQuestions.length && nextIndex < 5) {
        setQuestionsCount(nextIndex);
        setCurrentQuestion(shuffledQuestions[nextIndex]);
        setAnswered(false);
        setSelectedOption(null);
        setTimeLeft(10);
      } else {
        saveFinalScore();
        setGameState('result');
      }
    }, 1500);
  };

  const saveFinalScore = async () => {
    try {
      await axios.post(`${API_URL}/games/score`, {
        userId: user?._id,
        guestName: guestName || 'Guest',
        gameType: 'kannada_rapid_fire',
        score,
      });
    } catch (err) {
      console.error('Score save error', err);
    }
  };

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'kn' : 'en';
    setLanguage(newLang);
    localStorage.setItem('rapid_fire_lang', newLang);
    playSound('move');
  };

  const labels = {
    en: {
      score: "SCORE",
      streak: "STREAK",
      question: "QUESTION",
      of: "OF",
      replay: "Replay",
      return: "Return to Nexus",
      concluded: "Session Concluded",
      initiate: "Initiate Protocol",
      rules: ["10s Per Question", "Combo Streaks", "Daily Leaderboard"],
      subtitle: "Test your knowledge on Kannada cinema, culture & Bengaluru vibes."
    },
    kn: {
      score: "ಅಂಕಗಳು",
      streak: "ಸತತ ಜಯ",
      question: "ಪ್ರಶ್ನೆ",
      of: "/",
      replay: "ಮತ್ತೆ ಆಡಿ",
      return: "ಹಿಂದಕ್ಕೆ",
      concluded: "ಆಟ ಮುಕ್ತಾಯ",
      initiate: "ಪ್ರಾರಂಭಿಸಿ",
      rules: ["ಪ್ರತಿ ಪ್ರಶ್ನೆಗೆ ೧೦ ಸೆಕೆಂಡು", "ಕಾಂಬೋ ಬೋನಸ್", "ದೈನಂದಿನ ಲೀಡರ್ಬೋರ್ಡ್"],
      subtitle: "ಕನ್ನಡ ಸಿನೆಮಾ, ಸಂಸ್ಕೃತಿ ಮತ್ತು ಬೆಂಗಳೂರಿನ ಕುರಿತಾದ ನಿಮ್ಮ ಜ್ಞಾನವನ್ನು ಪರೀಕ್ಷಿಸಿ."
    }
  };

  const t = labels[language];

  return (
    <GameLayout title="KANNADA RAPID FIRE">
      <div className="rapid-fire-arena">
        
        <AnimatePresence mode="wait">
          {gameState === 'landing' && (
            <motion.div 
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rapid-landing"
            >
              <div className="landing-visual">
                <div className="language-toggle-wrapper">
                  <button 
                    className={`lang-btn ${language === 'en' ? 'active' : ''}`} 
                    onClick={() => language !== 'en' && toggleLanguage()}
                  >
                    EN
                  </button>
                  <div className="lang-divider" />
                  <button 
                    className={`lang-btn ${language === 'kn' ? 'active' : ''}`} 
                    onClick={() => language !== 'kn' && toggleLanguage()}
                  >
                    ಕನ್ನಡ
                  </button>
                </div>
              </div>
              <div className="landing-content-card">
                <h2 className="rapid-title">Rapid Fire</h2>
                <p className="rapid-subtitle">{t.subtitle}</p>
                
                <div className="rules-grid">
                  <div className="rule-card">
                    <Clock size={20} />
                    <span>{t.rules[0]}</span>
                  </div>
                  <div className="rule-card">
                    <Zap size={20} />
                    <span>{t.rules[1]}</span>
                  </div>
                  <div className="rule-card">
                    <Trophy size={20} />
                    <span>{t.rules[2]}</span>
                  </div>
                </div>

                <button className="start-btn-premium" onClick={startGame}>
                  {t.initiate}
                </button>
              </div>
            </motion.div>
          )}

          {gameState === 'playing' && currentQuestion && (
            <motion.div 
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rapid-stage"
            >
              <div className="rapid-hud">
                <div className="hud-left">
                  <div className="stat-pill">
                    <span className="label">{t.score}</span>
                    <span className="value">{score}</span>
                  </div>
                  <div className="stat-pill">
                    <span className="label">{t.streak}</span>
                    <span className="value text-[#ffab3d]">x{streak}</span>
                  </div>
                </div>
                
                <div className="timer-wrapper">
                  <svg className="timer-svg" viewBox="0 0 100 100">
                    <circle className="timer-bg" cx="50" cy="50" r="45" />
                    <motion.circle 
                      className="timer-progress" 
                      cx="50" cy="50" r="45"
                      initial={{ pathLength: 1 }}
                      animate={{ pathLength: timeLeft / 10 }}
                      style={{ stroke: timeLeft < 3 ? '#ff4f9a' : '#ffab3d' }}
                    />
                  </svg>
                  <span className={`timer-text ${timeLeft < 3 ? 'low' : ''}`}>{timeLeft}</span>
                </div>

                <div className="hud-right">
                  <span className="q-count">{t.question} {questionsCount + 1} {t.of} 10</span>
                  <button className="lang-toggle-minimal" onClick={toggleLanguage}>
                    {language === 'en' ? 'ಕನ್ನಡ' : 'EN'}
                  </button>
                </div>
              </div>

              <div className="question-container">
                <motion.div 
                  key={currentQuestion._id}
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="question-card"
                >
                  <span className="category-tag">{currentQuestion.category}</span>
                  <div className="question-text-container">
                    {(() => {
                      const primaryText = language === 'en' 
                        ? currentQuestion.question_en 
                        : (currentQuestion.question_kn || currentQuestion.question_en);
                      
                      const secondaryText = language === 'en' 
                        ? currentQuestion.question_kn 
                        : currentQuestion.question_en;

                      // Only show secondary if it exists and is different from primary
                      const showSecondary = secondaryText && secondaryText !== primaryText;

                      return (
                        <>
                          <motion.h2 
                            key={currentQuestion._id + '_primary'}
                            className="question-text primary-lang"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            {primaryText}
                          </motion.h2>
                          
                          {showSecondary && (
                            <motion.h3 
                              key={currentQuestion._id + '_secondary'}
                              className="question-text secondary-lang"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 0.6 }}
                              transition={{ delay: 0.2 }}
                            >
                              {secondaryText}
                            </motion.h3>
                          )}
                        </>
                      );
                    })()}
                  </div>

                <div className="options-grid">
                  {(() => {
                    const currentOptions = currentQuestion?.[`options_${language}`] || [];
                    const fallbackOptions = currentQuestion?.options_en || [];
                    const isEffectivelyEmpty = currentOptions.length === 0 || currentOptions.every(opt => !opt);
                    const optionsToDisplay = isEffectivelyEmpty ? fallbackOptions : currentOptions;

                    return optionsToDisplay.map((option, idx) => {
                      let statusClass = '';
                      if (answered) {
                        if (idx === currentQuestion.correctAnswerIndex) statusClass = 'correct';
                        else if (idx === optionsToDisplay.indexOf(selectedOption)) statusClass = 'wrong';
                        else statusClass = 'dim';
                      }

                      return (
                        <motion.button
                          key={idx}
                          whileHover={!answered ? { scale: 1.02, x: 5 } : {}}
                          whileTap={!answered ? { scale: 0.98 } : {}}
                          className={`option-btn ${statusClass}`}
                          onClick={() => handleAnswer(option)}
                          disabled={answered}
                        >
                          <span className="option-index">{String.fromCharCode(65 + idx)}</span>
                          <span className="option-label">{option}</span>
                          {answered && idx === currentQuestion.correctAnswerIndex && <CheckCircle2 size={20} className="status-icon" />}
                          {answered && selectedOption === option && idx !== currentQuestion.correctAnswerIndex && <XCircle size={20} className="status-icon" />}
                        </motion.button>
                      );
                    });
                  })()}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

          {gameState === 'result' && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rapid-result"
            >
              <div className="result-header">
                <span className="result-badge">Session Complete</span>
                <h2 className="result-title">{t.concluded}</h2>
              </div>
              <div className="result-stats">
                <div className="res-stat">
                  <span>{t.score}</span>
                  <strong>{score} <small className="total-score">/ {shuffledQuestions.length}</small></strong>
                </div>
                <div className="res-stat">
                  <span>{language === 'en' ? 'MAX STREAK' : 'ಗರಿಷ್ಠ ಸತತ ಜಯ'}</span>
                  <strong>{streak}</strong>
                </div>
              </div>
              
              <div className="action-buttons">
                <button className="retry-btn" onClick={startGame}>
                  <RotateCcw size={20} />
                  {t.replay}
                </button>
                <button className="nexus-btn" onClick={() => window.history.back()}>
                  {t.return}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && gameState === 'playing' && (
          <div className="rapid-loader-overlay">
            <Sparkles className="animate-spin text-[#ff4f9a]" size={40} />
          </div>
        )}

      </div>

      <GuestNameModal 
        isOpen={showNameModal} 
        onComplete={handleNameComplete} 
      />
    </GameLayout>
  );
};

export default KannadaRapidFire;
