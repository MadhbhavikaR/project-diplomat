/**
 * Audio Player Component
 * 
 * A component for playing audio from base64 data with playback controls.
 * This component handles base64-encoded audio data and provides a user interface
 * for controlling audio playback.
 */

import React, { useState, useEffect, useRef } from 'react';
import './AudioPlayerComponent.css';

interface AudioPlayerComponentProps {
  base64data: string;
}

const AudioPlayerComponent: React.FC<AudioPlayerComponentProps> = ({ base64data }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioSrc, setAudioSrc] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.7);

  // Initialize audio source when base64data changes
  useEffect(() => {
    if (base64data) {
      setAudioSource(base64data);
    }
  }, [base64data]);

  const setAudioSource = (base64: string): void => {
    // Check if the base64 data already has the 'data:audio/mpeg;base64,' prefix
    // You might want to adjust the MIME type based on your actual audio data
    // (e.g., audio/wav, audio/ogg)
    if (base64.startsWith('data:')) {
      setAudioSrc(base64);
    } else {
      // Assuming it's MP3 data, adjust if necessary
      setAudioSrc(`data:audio/mpeg;base64,${base64}`);
    }
  };

  // Update current time and duration
  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const updateTime = () => {
      setCurrentTime(audioElement.currentTime);
    };

    const updateDuration = () => {
      setDuration(audioElement.duration);
    };

    const updatePlayingState = () => {
      setIsPlaying(!audioElement.paused);
    };

    audioElement.addEventListener('timeupdate', updateTime);
    audioElement.addEventListener('loadedmetadata', updateDuration);
    audioElement.addEventListener('play', updatePlayingState);
    audioElement.addEventListener('pause', updatePlayingState);

    return () => {
      audioElement.removeEventListener('timeupdate', updateTime);
      audioElement.removeEventListener('loadedmetadata', updateDuration);
      audioElement.removeEventListener('play', updatePlayingState);
      audioElement.removeEventListener('pause', updatePlayingState);
    };
  }, []);

  const togglePlayPause = () => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const newTime = parseFloat(e.target.value);
    audioElement.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const newVolume = parseFloat(e.target.value);
    audioElement.volume = newVolume;
    setVolume(newVolume);
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00';

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const stop = () => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    audioElement.pause();
    audioElement.currentTime = 0;
    setCurrentTime(0);
    setIsPlaying(false);
  };

  return (
    <div className="audio-player-container">
      <audio
        ref={audioRef}
        src={audioSrc}
        className="audio-element"
      />

      <div className="audio-controls">
        <div className="playback-controls">
          <button
            className="control-button"
            onClick={togglePlayPause}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>

          <button
            className="control-button"
            onClick={stop}
            aria-label="Stop"
          >
            ⏹️
          </button>

          <div className="time-display">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        <div className="progress-container">
          <input
            type="range"
            min="0"
            max={duration || 1}
            value={currentTime}
            onChange={handleTimeChange}
            className="progress-slider"
            aria-label="Audio progress"
          />
        </div>

        <div className="volume-control">
          <span className="volume-icon">🔊</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="volume-slider"
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  );
};

export default AudioPlayerComponent;