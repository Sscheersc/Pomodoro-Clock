import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const App = () => {
  const [breakLength, setBreakLength] = useState(5);
  const [sessionLength, setSessionLength] = useState(25);
  const [timeLeft, setTimeLeft] = useState(sessionLength * 60);
  const [isActive, setIsActive] = useState(false);
  const [isSession, setIsSession] = useState(true);
  const [timerLabel, setTimerLabel] = useState("Session");
  const [backgroundColor, setBackgroundColor] = useState("#fff");
  const [textFlash, setTextFlash] = useState(false);
  const [audioError, setAudioError] = useState(false); // Audio error state

  const intervalRef = useRef(null);
  const beepRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime === 1) {
            beepRef.current.play().catch(() => setAudioError(true)); // Handle play error
          }
          if (prevTime <= 0) {
            clearInterval(intervalRef.current);
            if (isSession) {
              setIsSession(false);
              setTimerLabel("Break");
              setTimeLeft(breakLength * 60);
            } else {
              setIsSession(true);
              setTimerLabel("Session");
              setTimeLeft(sessionLength * 60);
            }
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isActive, isSession, sessionLength, breakLength]);

  useEffect(() => {
    if (timeLeft <= 10 && timeLeft > 0) {
      setTextFlash(true);
    } else {
      setTextFlash(false);
    }
    if (timeLeft <= 60 && timeLeft > 0) {
      setBackgroundColor("#f8d7da");
    } else {
      setBackgroundColor("#fff");
    }
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleStartStop = () => {
    if (isActive) {
      setIsActive(false);
      clearInterval(intervalRef.current);
    } else {
      setIsActive(true);
    }
  };

  const handleReset = () => {
    clearInterval(intervalRef.current);
    setBreakLength(5);
    setSessionLength(25);
    setTimeLeft(25 * 60);
    setIsActive(false);
    setIsSession(true);
    setTimerLabel("Session");
    setBackgroundColor("#fff");
    setTextFlash(false);
    
    if (beepRef.current) {
      beepRef.current.pause();
      beepRef.current.currentTime = 0;
    }
    setAudioError(false); // Reset audio error state
  };

  const handleBreakDecrement = () => {
    if (breakLength > 1) {
      setBreakLength(prev => prev - 1);
    }
  };

  const handleBreakIncrement = () => {
    if (breakLength < 60) {
      setBreakLength(prev => prev + 1);
    }
  };

  const handleSessionDecrement = () => {
    if (sessionLength > 1) {
      setSessionLength(prev => prev - 1);
      if (isSession && !isActive) setTimeLeft((prev) => (prev - 60));
    }
  };

  const handleSessionIncrement = () => {
    if (sessionLength < 60) {
      setSessionLength(prev => prev + 1);
      if (isSession && !isActive) setTimeLeft((prev) => (prev + 60));
    }
  };

  const handleAudioError = () => {
    setAudioError(true);
    console.error('Failed to load or play the audio file.');
  };

  return (
    <div className="container">
      <h1>25 + 5 Clock</h1>
      <div id="break-label">Break Length</div>
      <div className="length-controls">
        <button id="break-decrement" onClick={handleBreakDecrement}>-</button>
        <span id="break-length">{breakLength}</span>
        <button id="break-increment" onClick={handleBreakIncrement}>+</button>
      </div>
      <div id="session-label">Session Length</div>
      <div className="length-controls">
        <button id="session-decrement" onClick={handleSessionDecrement}>-</button>
        <span id="session-length">{sessionLength}</span>
        <button id="session-increment" onClick={handleSessionIncrement}>+</button>
      </div>
      <div id="timer-label">{timerLabel}</div>
      <div
        id="time-left"
        className={`${backgroundColor === "#f8d7da" ? 'background-red' : ''} ${textFlash ? 'flash-text' : ''}`}
      >
        {formatTime(timeLeft)}
      </div>
      <button id="start_stop" onClick={handleStartStop}>
        {isActive ? 'Pause' : 'Start'}
      </button>
      <button id="reset" onClick={handleReset}>Reset</button>
      <audio
        id="beep"
        ref={beepRef}
        src="https://cdn.freecodecamp.org/testable-projects-fcc/audio/BeepSound.wav"
        onError={handleAudioError}
      />
      {audioError && <p className="error-message">Failed to load the audio file. Please check the file or your connection.</p>}
    </div>
  );
};

export default App;
