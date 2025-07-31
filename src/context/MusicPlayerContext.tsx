import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import Sound from 'react-native-sound';

interface MusicPlayerContextType {
  playlist: string[];
  nowPlayingIndex: number;
  currentFile: string | null;
  isPlaying: boolean;
  paused: boolean;
  position: number;
  duration: number;
  setPlaylist: (files: string[]) => void;
  playAtIndex: (index: number) => void;
  play: (filePath: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  next: () => void;
  previous: () => void;
  seekTo: (seconds: number) => void;
  setPlaylistAndPlay: (songs: string[], index: number) => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

let currentSound: Sound | null = null;
let intervalId: NodeJS.Timer | null = null;
let isLoadingSound = false;

export const MusicPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playlist, setPlaylistState] = useState<string[]>([]);
  const [nowPlayingIndex, setNowPlayingIndex] = useState<number>(-1);
  const nowPlayingRef = useRef<number>(-1);

  const [isPlaying, setIsPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  const pendingPlayIndexRef = useRef<number | null>(null);

  useEffect(() => {
    return () => stop();
  }, []);

  useEffect(() => {
    if (
      pendingPlayIndexRef.current !== null &&
      playlist.length > 0
    ) {
      const idx = pendingPlayIndexRef.current;
      pendingPlayIndexRef.current = null;

      const songToPlay = playlist[idx];
      setNowPlayingIndex(idx);
      nowPlayingRef.current = idx;
      play(songToPlay);
    }
  }, [playlist]);

  const setPlaylist = (files: string[]) => {
    setPlaylistState(files);
  };

  const playAtIndex = (index: number) => {
    if (index >= 0 && index < playlist.length) {
      const file = playlist[index];
      setNowPlayingIndex(index);
      nowPlayingRef.current = index;
      play(file);
    }
  };

  const play = (filePath: string) => {
    if (isLoadingSound) return;
    isLoadingSound = true;

    if (currentSound) {
      currentSound.stop(() => {
        currentSound?.release();
        if (intervalId) clearInterval(intervalId);
        currentSound = null;
        intervalId = null;
        loadAndPlay(filePath);
      });
    } else {
      loadAndPlay(filePath);
    }
  };

  const loadAndPlay = (filePath: string) => {
    const idx = playlist.indexOf(filePath);
    setNowPlayingIndex(idx);
    nowPlayingRef.current = idx;

    const sound = new Sound(filePath, '', (err) => {
      if (err) {
        console.error('❌ Gagal load:', err);
        isLoadingSound = false;
        return;
      }

      currentSound = sound;
      setDuration(sound.getDuration());

      sound.play((success) => {
        if (intervalId) clearInterval(intervalId);
        intervalId = null;

        setIsPlaying(false);
        setPaused(false);
        setPosition(0);

        if (success) {
          const nextIndex = nowPlayingRef.current + 1 < playlist.length
            ? nowPlayingRef.current + 1
            : 0;
          playAtIndex(nextIndex);
        } else {
          console.warn('⚠️ Playback gagal.');
        }

        isLoadingSound = false;
      });

      intervalId = setInterval(() => {
        currentSound?.getCurrentTime(setPosition);
      }, 1000);

      setIsPlaying(true);
      setPaused(false);
      isLoadingSound = false;
    });
  };

  const pause = () => {
    if (currentSound && isPlaying && !paused) {
      currentSound.pause();
      setPaused(true);
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }
  };

  const resume = () => {
    if (currentSound && paused) {
      currentSound.play((success) => {
        if (!success) {
          console.error('❌ Resume gagal');
        }
      });
      intervalId = setInterval(() => {
        currentSound?.getCurrentTime(setPosition);
      }, 1000);
      setPaused(false);
    }
  };

  const stop = () => {
    if (currentSound) {
      currentSound.stop(() => currentSound?.release());
      if (intervalId) clearInterval(intervalId);
      currentSound = null;
      intervalId = null;
    }

    setIsPlaying(false);
    setPaused(false);
    setPosition(0);
    setDuration(0);
    setNowPlayingIndex(-1);
    nowPlayingRef.current = -1;
  };

  const next = () => {
    const nextIndex = nowPlayingRef.current + 1 < playlist.length
      ? nowPlayingRef.current + 1
      : 0;
    playAtIndex(nextIndex);
  };

  const previous = () => {
    const prevIndex = nowPlayingRef.current === 0
      ? playlist.length - 1
      : nowPlayingRef.current - 1;
    playAtIndex(prevIndex);
  };

  const seekTo = (seconds: number) => {
    if (currentSound) {
      currentSound.setCurrentTime(seconds);
      setPosition(seconds);
    }
  };

  const setPlaylistAndPlay = (songs: string[], index: number) => {
    const songToPlay = songs[index];
    const isSame = JSON.stringify(playlist) === JSON.stringify(songs);

    if (!isSame) {
      setPlaylistState(songs);
      pendingPlayIndexRef.current = index;
    } else {
      setNowPlayingIndex(index);
      nowPlayingRef.current = index;
      play(songToPlay);
    }
  };

  return (
    <MusicPlayerContext.Provider
      value={{
        playlist,
        nowPlayingIndex,
        currentFile:
          nowPlayingIndex >= 0 && nowPlayingIndex < playlist.length
            ? playlist[nowPlayingIndex]
            : null,
        isPlaying,
        paused,
        position,
        duration,
        setPlaylist,
        playAtIndex,
        play,
        pause,
        resume,
        stop,
        next,
        previous,
        seekTo,
        setPlaylistAndPlay,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const ctx = useContext(MusicPlayerContext);
  if (!ctx) throw new Error('useMusicPlayer must be used inside MusicPlayerProvider');
  return ctx;
};
