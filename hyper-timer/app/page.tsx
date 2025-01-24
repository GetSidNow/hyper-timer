'use client';

import { useState, useEffect, useCallback } from 'react';

export default function HyperTimer() {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [voiceActive, setVoiceActive] = useState(false);

  const startTimer = useCallback(() => {
    setTime(0);
    setIsRunning(true);
  }, []);

  const stopTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setVoiceActive(true);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setVoiceActive(false);
    };

    recognition.onend = () => {
      if (voiceActive) recognition.start();
    };

    recognition.onresult = (event: any) => {
      const command = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
      
      if (command.includes('timer go') || command.includes('go') || command.includes("let's go")) {
        startTimer();
      } else if (command.includes('stop')) {
        stopTimer();
      }
    };

    recognition.start();

    return () => {
      recognition.stop();
      setVoiceActive(false);
    };
  }, [startTimer, stopTimer, voiceActive]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center">
      <div className="text-white text-9xl font-mono mb-12">
        {formatTime(time)}
      </div>
      <div className="flex gap-6">
        <button
          onClick={startTimer}
          className="bg-green-500 text-white px-12 py-6 rounded-xl text-3xl font-bold hover:bg-green-600 transition-colors"
        >
          Go
        </button>
        <button
          onClick={stopTimer}
          className="bg-red-500 text-white px-12 py-6 rounded-xl text-3xl font-bold hover:bg-red-600 transition-colors"
        >
          Stop
        </button>
      </div>
      <div className="mt-8 text-gray-500">
        {voiceActive ? 'Voice Commands Active' : 'Voice Commands Inactive'}
      </div>
    </div>
  );
}