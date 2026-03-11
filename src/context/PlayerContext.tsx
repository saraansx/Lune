import React, { createContext, useContext, useState, useEffect } from 'react';
import { LuneTrack, normalizeTrack } from '../types/track';
import { usePlayback } from './PlaybackContext';

interface PlayerContextType {
  currentTrack: LuneTrack | null;
  isPlaying: boolean;
  isShuffle: boolean;
  isLoop: 'none' | 'all' | 'one';
  queue: LuneTrack[];
  shuffledQueue: LuneTrack[];
  history: LuneTrack[];
  sessionHistory: LuneTrack[];
  sessionIndex: number;
  contextTracks: LuneTrack[];
  prefetchMap: Record<string, { url: string; timestamp: number }>;
  showQueue: boolean;
  showFullNowPlaying: boolean;
  showLyrics: boolean;
  autoplayQueue: LuneTrack[];
  isRadioLoading: boolean;
  setAutoplayQueue: React.Dispatch<React.SetStateAction<LuneTrack[]>>;
  setIsRadioLoading: (loading: boolean) => void;
  setIsPlaying: (playing: boolean) => void;
  setIsShuffle: (shuffle: boolean) => void;
  setIsLoop: (loop: 'none' | 'all' | 'one') => void;
  setShowQueue: (show: boolean) => void;
  setShowFullNowPlaying: (show: boolean) => void;
  setShowLyrics: (show: boolean) => void;
  setCurrentTrack: (track: LuneTrack | null) => void;
  setQueue: React.Dispatch<React.SetStateAction<LuneTrack[]>>;
  setHistory: React.Dispatch<React.SetStateAction<LuneTrack[]>>;
  handleTrackSelect: (track: any, playlistTracks?: any[], navType?: 'manual' | 'next' | 'prev' | 'loop-restart') => void;
  handleAddToQueue: (track: any) => void;
  handlePlayNext: (track: any) => void;
  handleRemoveFromQueue: (index: number) => void;
  handleNextTrack: () => void;
  handlePrevTrack: (currentTime?: number) => void;
  formatTrackForPlayer: (t: any) => LuneTrack;
  clearHistory: () => Promise<void>;
  // Bulk Download Support
  activeBulkDownloads: Set<string>;
  startBulkDownload: (id: string, tracks: LuneTrack[]) => Promise<void>;
  stopBulkDownload: (id: string) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { autoplayEnabled, lowDataMode, audioQuality, audioFormat } = usePlayback();

  // Audio State
  const [currentTrack, setCurrentTrack] = useState<LuneTrack | null>(() => {
    try {
      const saved = localStorage.getItem('lune_current_track');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.warn("Failed to parse saved track", e);
      return null;
    }
  });

  const [isPlaying, setIsPlaying] = useState(false);
    
  const [isShuffle, setIsShuffle] = useState(() => {
    return localStorage.getItem('lune_is_shuffle') === 'true';
  });

  const [isLoop, setIsLoop] = useState<'none' | 'all' | 'one'>(() => {
    const saved = localStorage.getItem('lune_is_loop');
    if (saved === 'one' || saved === 'all' || saved === 'none') return saved;
    // Handle legacy boolean migration
    if (saved === 'true') return 'one';
    return 'none';
  });

  const [queue, setQueue] = useState<LuneTrack[]>(() => {
    try {
      const saved = localStorage.getItem('lune_queue');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn("Failed to parse saved queue", e);
      return [];
    }
  });

  const [shuffledQueue, setShuffledQueue] = useState<LuneTrack[]>(() => {
    try {
      const saved = localStorage.getItem('lune_shuffled_queue');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [contextTracks, setContextTracks] = useState<LuneTrack[]>(() => {
    try {
      const saved = localStorage.getItem('lune_context_tracks');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  
  const [history, setHistory] = useState<LuneTrack[]>([]);
  
  // Session Navigation (The "Stack" for Back/Forward)
  const [sessionHistory, setSessionHistory] = useState<LuneTrack[]>(() => {
    try {
      const saved = localStorage.getItem('lune_session_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [sessionIndex, setSessionIndex] = useState<number>(() => {
    const saved = localStorage.getItem('lune_session_index');
    return saved ? parseInt(saved, 10) : -1;
  });
  const [prefetchMap, setPrefetchMap] = useState<Record<string, { url: string; timestamp: number }>>({});
  const [autoplayQueue, setAutoplayQueue] = useState<LuneTrack[]>([]);
  const [isRadioLoading, setIsRadioLoading] = useState(false);

  // Bulk Download State (Persistent across navigation)
  const [activeBulkDownloads, setActiveBulkDownloads] = useState<Set<string>>(new Set());
  const bulkAbortControllers = React.useRef<Record<string, AbortController>>({});

  // UI State related to player
  const [showQueue, setShowQueue] = useState(false);
  const [showFullNowPlaying, setShowFullNowPlaying] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const autoplayQueueRef = React.useRef(autoplayQueue);
  autoplayQueueRef.current = autoplayQueue;
  const isRadioLoadingRef = React.useRef(isRadioLoading);
  isRadioLoadingRef.current = isRadioLoading;
  const isNextBusyRef = React.useRef(false);

  // Persistence Effects
  useEffect(() => {
    if (currentTrack) {
      localStorage.setItem('lune_current_track', JSON.stringify(currentTrack));
    } else {
      localStorage.removeItem('lune_current_track');
    }
  }, [currentTrack]); 



  useEffect(() => {
    localStorage.setItem('lune_is_shuffle', String(isShuffle));
  }, [isShuffle]);

  useEffect(() => {
    localStorage.setItem('lune_is_loop', isLoop);
  }, [isLoop]);

  // Clear prefetch cache when quality settings change to prevent "Quality Confusion"
  const initialSettingsMount = React.useRef(true);
  useEffect(() => {
    if (initialSettingsMount.current) {
        initialSettingsMount.current = false;
        return;
    }
    setPrefetchMap({});
    window.ipcRenderer.invoke('clear-cache').catch(() => {});
    console.log('[PlayerContext] 🧹 Quality settings changed, clearing prefetch cache.');
  }, [lowDataMode, audioQuality, audioFormat]);

  useEffect(() => {
    localStorage.setItem('lune_session_history', JSON.stringify(sessionHistory.slice(-50)));
    localStorage.setItem('lune_session_index', String(sessionIndex));
  }, [sessionHistory, sessionIndex]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const quickRecoveryQueue = queue.slice(0, 25);
      localStorage.setItem('lune_queue', JSON.stringify(quickRecoveryQueue));
    }, 2000); // 2s debounce to avoid process spikes during rapid playlist changes
    return () => clearTimeout(timer);
  }, [queue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const quickRecoveryShuffled = shuffledQueue.slice(0, 25);
      localStorage.setItem('lune_shuffled_queue', JSON.stringify(quickRecoveryShuffled));
    }, 2000);
    return () => clearTimeout(timer);
  }, [shuffledQueue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const cappedContext = contextTracks.slice(0, 500);
      localStorage.setItem('lune_context_tracks', JSON.stringify(cappedContext));
    }, 1000);
    return () => clearTimeout(timer);
  }, [contextTracks]);

  // Handle Shuffle State Recovery on Mount
  useEffect(() => {
    if (isShuffle && shuffledQueue.length === 0 && queue.length > 0) {
      console.log("[PlayerContext] Shuffle is active but shuffled queue is empty. Regenerating...");
      setShuffledQueue(fisherYatesShuffle(queue));
    }
  }, []);

  const fisherYatesShuffle = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Pre-fetch Logic
  useEffect(() => {
    let isCancelled = false;

    const prefetchNeighbors = async () => {
      const logToSystem = (msg: string, type: 'info' | 'error' = 'info') => {
        console.log(msg);
        window.ipcRenderer.invoke('add-log', type, msg).catch(() => {});
      };

      logToSystem(`[Prefetch] Calculating new neighbors. Current Cache Size: ${Object.keys(prefetchMap).length}`);
      const activeQueue = (isShuffle && shuffledQueue.length > 0) ? shuffledQueue : queue;
      
      const neighbors: LuneTrack[] = [];
      
      // 1. Next Track ONLY (either from forward history or next in queue)
      if (sessionIndex < sessionHistory.length - 1) {
          neighbors.push(sessionHistory[sessionIndex + 1]);
      } else if (activeQueue.length > 0) {
          neighbors.push(activeQueue[0]);
      }

      // Cleanup prefetch cache: remove non-neighbors OR stale URLs (older than 30m)
      const STALE_TIME = 30 * 60 * 1000;
      const neighborIds = new Set(neighbors.filter(n => !!n).map(n => n.id));
      if (currentTrack) neighborIds.add(currentTrack.id);

      if (isCancelled) return;

      setPrefetchMap(prev => {
        const nextMap: Record<string, { url: string; timestamp: number }> = {};
        let changed = false;
        Object.keys(prev).forEach(id => {
          const entry = prev[id];
          const isStale = (Date.now() - entry.timestamp) > STALE_TIME;
          if (neighborIds.has(id) && !isStale) {
            nextMap[id] = entry;
          } else {
            logToSystem(`[Prefetch] ✂️ Pruning ${isStale ? 'stale' : 'non-neighbor'} entry: ${id}`);
            changed = true;
          }
        });
        return changed ? nextMap : prev;
      });

      const fetchedInThisCycle = new Set<string>();
      for (const track of neighbors) {
        if (isCancelled) return;
        if (!track) continue;
        
        // We must check if it was already fetched in this loop or exists in map
        let alreadyExists = false;
        setPrefetchMap(currentMap => {
            const existing = currentMap[track.id];
            const isStale = existing ? (Date.now() - existing.timestamp) > STALE_TIME : true;
            if (existing && !isStale) alreadyExists = true;
            return currentMap; 
        });

        if (alreadyExists || fetchedInThisCycle.has(track.id)) continue;

        try {
            logToSystem(`[Prefetch] 🛰️ Fetching neighbor: "${track.name}" (${track.id})`);
            const url = await window.ipcRenderer.invoke('get-stream-url', track.name, track.artist, track.id, false, `prefetch-${track.id}`);
            if (isCancelled) return;
            if (url) {
              fetchedInThisCycle.add(track.id);
              setPrefetchMap(prev => {
                const updated = { ...prev, [track.id]: { url, timestamp: Date.now() } };
                const entries = Object.entries(updated).sort((a, b) => b[1].timestamp - a[1].timestamp);
                return Object.fromEntries(entries.slice(0, 5));
              });
              logToSystem(`[Prefetch] ✅ Cached: "${track.name}"`);
            }
          } catch (err) {
            // Likely aborted
          }
          if (isCancelled) return;
          await new Promise(r => setTimeout(r, 100));
      }
    };

    // Delay pre-fetch slightly to prioritize current playback buffering
    const timer = setTimeout(prefetchNeighbors, 500);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [currentTrack?.id, queue.length, shuffledQueue.length, isShuffle, autoplayQueue]);

  // Handle Shuffle Toggle
  const toggleShuffle = (shuffle: boolean) => {
    setIsShuffle(shuffle);
    if (shuffle && queue.length > 0) {
      setShuffledQueue(fisherYatesShuffle(queue));
    } else {
      setShuffledQueue([]);
    }
  };
  
  // Initialize session navigation with last saved track
  useEffect(() => {
    if (currentTrack && sessionHistory.length === 0) {
      setSessionHistory([currentTrack]);
      setSessionIndex(0);
    }
  }, [currentTrack]);

  // Load history from DB on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const saved = await window.ipcRenderer.invoke('get-recent-tracks');
        if (saved && Array.isArray(saved)) {
          setHistory(saved);
        }
      } catch (err) {
        console.warn("Failed to load history from DB", err);
      }
    };
    loadHistory();
  }, []);

  const formatTrackForPlayer = (t: any) => normalizeTrack(t, lowDataMode);

  const handleTrackSelect = (track: any, playlistTracks?: any[], navType: 'manual' | 'next' | 'prev' | 'loop-restart' = 'manual') => {
    // Abort the previous track's stream fetch to prevent memory/ratelimit leaks
    if (currentTrack?.id) {
       window.ipcRenderer.invoke('cancel-stream', currentTrack.id, 'player').catch(() => {});
    }

    const formattedTrack = formatTrackForPlayer(track);

    // 1. Update Global History (UI list / DB)
    setHistory(prev => {
      const filtered = prev.filter(t => t.id !== formattedTrack.id);
      return [formattedTrack, ...filtered].slice(0, 50);
    });
    window.ipcRenderer.invoke('add-recent-track', formattedTrack);

    // 2. Update Session Navigation History
    if (navType === 'manual') {
        // Manually picked a track - clear "forward" history
        // Cap at 200 items to prevent memory leak
        const newHistory = [...sessionHistory.slice(0, sessionIndex + 1), formattedTrack].slice(-200);
        setSessionHistory(newHistory);
        setSessionIndex(newHistory.length - 1);
    } else if (navType === 'next' && sessionIndex === sessionHistory.length - 1) {
        // Pulling NEW track from queue - add to session history
        // Cap at 200 items to prevent memory leak
        const newHistory = [...sessionHistory, formattedTrack].slice(-200);
        setSessionHistory(newHistory);
        setSessionIndex(newHistory.length - 1);
    } else if (navType === 'next') {
        // navigating forward through previously "backed" tracks
        setSessionIndex(prev => prev + 1);
    } else if (navType === 'prev') {
        // sessionIndex is already decremented by handlePrevTrack
        // We just need to play it
    } else if (navType === 'loop-restart') {
        setSessionIndex(0);
    }

    // 3. Play the track
    if (currentTrack?.id === formattedTrack.id) {
        window.dispatchEvent(new CustomEvent('lune:restart-track', { detail: { play: true } }));
    }
    setCurrentTrack(formattedTrack);
    setIsPlaying(true);
    
    // 4. Update Playback Queue
    if (navType === 'manual') {
      setAutoplayQueue([]); // Clear autoplay queue when user manually changes contexts
      if (playlistTracks && playlistTracks.length > 0) {
        // Set new context and queue
        const formattedContext = playlistTracks.map(formatTrackForPlayer);
        setContextTracks(formattedContext);
        
        const currentIndex = playlistTracks.findIndex(t => normalizeTrack(t, lowDataMode).id === formattedTrack.id);
        const remainingTracks = playlistTracks.slice(currentIndex + 1).map(t => ({
          ...formatTrackForPlayer(t),
          queueId: `id-${Date.now()}-${Math.random()}`
        }));
        setQueue(remainingTracks);
        
        if (isShuffle) {
          setShuffledQueue(fisherYatesShuffle(remainingTracks));
        }
      } else {
        setContextTracks([formattedTrack]);
      }
    }
    // Note: We no longer manipulate the queue for single-track manual plays or next/prev navigation here.
    // 'handleNextTrack' explicitly handles popping tracks off the queue when playing.
  };

  const handleAddToQueue = (track: any) => {
    if (Array.isArray(track)) {
      const formattedTracks = track.map(t => ({ ...formatTrackForPlayer(t), queueId: `id-${Date.now()}-${Math.random()}` }));
      setQueue(prev => [...prev, ...formattedTracks]);
      if (isShuffle) {
        setShuffledQueue(prev => [...prev, ...formattedTracks]);
      }
    } else {
      const formattedTrack = { ...formatTrackForPlayer(track), queueId: `id-${Date.now()}-${Math.random()}` };
      setQueue(prev => [...prev, formattedTrack]);
      if (isShuffle) {
        setShuffledQueue(prev => [...prev, formattedTrack]);
      }
    }
  };

  const handlePlayNext = (track: any) => {
    if (Array.isArray(track)) {
      const formattedTracks = track.map(t => ({ ...formatTrackForPlayer(t), queueId: `id-${Date.now()}-${Math.random()}` }));
      setQueue(prev => [...formattedTracks, ...prev]);
      if (isShuffle) {
        setShuffledQueue(prev => [...formattedTracks, ...prev]);
      }
    } else {
      const formattedTrack = { ...formatTrackForPlayer(track), queueId: `id-${Date.now()}-${Math.random()}` };
      setQueue(prev => [formattedTrack, ...prev]);
      if (isShuffle) {
        setShuffledQueue(prev => [formattedTrack, ...prev]);
      }
    }
  };

  const handleRemoveFromQueue = (index: number) => {
    if (isShuffle) {
      const trackToRemove = shuffledQueue[index];
      setShuffledQueue(prev => prev.filter((_, i) => i !== index));
      setQueue(prev => prev.filter(t => t.queueId !== trackToRemove.queueId));
    } else {
      const trackToRemove = queue[index];
      setQueue(prev => prev.filter((_, i) => i !== index));
      setShuffledQueue(prev => prev.filter(t => t.queueId !== trackToRemove.queueId));
    }
  };

  const handleNextTrack = async () => {
    if (isNextBusyRef.current) return;
    isNextBusyRef.current = true;
    try {
    // 1. Check if we have forward navigation history (from hitting "Back" earlier)
    if (sessionIndex < sessionHistory.length - 1) {
        const nextTrack = sessionHistory[sessionIndex + 1];
        handleTrackSelect(nextTrack, [], 'next');
        return;
    }

    // 2. Otherwise, take from the active queue
    const activeQueue = isShuffle && shuffledQueue.length > 0 ? shuffledQueue : queue;
    
    if (activeQueue.length > 0) {
      const nextTrack = activeQueue[0];

      // Pop the track so it isn't replayed
      // Safely pop only the specific instance from the base queue
      if (isShuffle && shuffledQueue.length > 0) {
          setShuffledQueue(prev => prev.slice(1));
          setQueue(prev => prev.filter(t => t.queueId !== nextTrack.queueId));
      } else {
          setQueue(prev => prev.slice(1));
          if (isShuffle) {
            setShuffledQueue(prev => prev.filter(t => t.queueId !== nextTrack.queueId));
          }
      }

      handleTrackSelect(nextTrack, [], 'next');
      return;
    }

    // 3. Queue exhausted — decide based on context type
    if (contextTracks.length > 1 && isLoop === 'all') {
        // ── Collection context (Downloads / Favorites / Playlist / Album) ──
        // Only wrap back if 'Loop All' is on.
        let firstTrack: LuneTrack;

        if (isShuffle) {
            const reshuffled = fisherYatesShuffle(contextTracks);
            firstTrack = reshuffled[0];
            handleTrackSelect(firstTrack, [], 'next');
            
            // Defer the massive state update to prevent UI stutter during track transition
            setTimeout(() => {
                setShuffledQueue(reshuffled.slice(1));
                setQueue(contextTracks.filter(t => t.id !== firstTrack.id));
            }, 50);
        } else {
            firstTrack = contextTracks[0];
            handleTrackSelect(firstTrack, [], 'next');
            
            setTimeout(() => {
                setQueue(contextTracks.slice(1));
            }, 50);
        }

        return;
    }

    // ── Single-song context ──
    // 4. Honour "Loop All" if enabled
    if (isLoop === 'all' && contextTracks.length > 0) {
        handleTrackSelect(contextTracks[0], [], 'next');
        return;
    }

    // 5. Use the Autoplay Pool System (radio recommendations)
    console.log(`[handleNextTrack] End of queue. Autoplay=${autoplayEnabled}, PoolSize=${autoplayQueue.length}, Loading=${isRadioLoading}`);
    
    if (autoplayEnabled) {
        if (autoplayQueueRef.current.length === 0) {
            if (isRadioLoadingRef.current) {
                console.log('[handleNextTrack] Radio is already loading, waiting...');
            } else {
                console.log('[handleNextTrack] Radio queue empty! Triggering emergency fetch...');
                window.dispatchEvent(new Event('lune:trigger-pool-fetch'));
            }
            
            // Wait up to 10 seconds for results
            for (let i = 0; i < 20; i++) { // 20 * 500ms = 10s
                await new Promise(r => setTimeout(r, 500));
                if (autoplayQueueRef.current.length > 0) break;
            }
        } else if (isRadioLoadingRef.current) {
            // If it's already loading naturally, wait up to 5 seconds
            console.log('[handleNextTrack] Radio is naturally loading, waiting for tracks...');
            for (let i = 0; i < 10; i++) { // 10 * 500ms = 5s
                await new Promise(r => setTimeout(r, 500));
                if (autoplayQueueRef.current.length > 0) break;
            }
        }

        if (autoplayQueueRef.current.length > 0) {
            const nextTrack = autoplayQueueRef.current[0];
            console.log(`[handleNextTrack] Starting Autoplay Radio: "${nextTrack.name}"`);
            setAutoplayQueue(prev => prev.slice(1));
            handleTrackSelect(nextTrack, [], 'next');
            return;
        } else {
            console.warn('[handleNextTrack] Autoplay failed to fetch a new track in time. Stopping playback.');
        }
    }

    // Nothing left to play — stop.
    setIsPlaying(false);
    } finally {
        isNextBusyRef.current = false;
    }
  };

  const handlePrevTrack = (currentTime?: number) => {
    // 1. If we've played more than 3 seconds, restart the current track
    // Use the passed-in accurate time if available, otherwise fallback to storage
    const playerProgress = currentTime !== undefined 
        ? currentTime 
        : parseFloat(localStorage.getItem('lune_player_progress') || '0');
        
    if (playerProgress > 3) {
      window.dispatchEvent(new CustomEvent('lune:restart-track', { detail: { play: true } }));
      setIsPlaying(true);
      return;
    }

    // 2. Otherwise, navigate back in session history
    if (sessionIndex > 0) {
      const prevTrack = sessionHistory[sessionIndex - 1];
      setSessionIndex(prev => prev - 1);
      handleTrackSelect(prevTrack, [], 'prev');
    }
  };

  const clearHistory = async () => {
    try {
      await window.ipcRenderer.invoke('clear-recent-tracks');
      setHistory([]);
    } catch (err) {
      console.error("Failed to clear history", err);
    }
  };

  const startBulkDownload = async (id: string, tracks: LuneTrack[]) => {
    if (activeBulkDownloads.has(id)) return;

    const controller = new AbortController();
    bulkAbortControllers.current[id] = controller;
    
    setActiveBulkDownloads(prev => {
        const next = new Set(prev);
        next.add(id);
        return next;
    });

    try {
        console.log(`[BulkDownload] Starting task for context: ${id} (${tracks.length} tracks)`);
        
        for (let i = 0; i < tracks.length; i++) {
            if (controller.signal.aborted) break;

            const track = tracks[i];
            try {
                // Check if already downloaded
                const exists = await window.ipcRenderer.invoke('check-is-downloaded', track.id);
                if (exists) continue;

                if (controller.signal.aborted) break;

                // Download
                await window.ipcRenderer.invoke('download-track', {
                    id: track.id,
                    name: track.name,
                    artists: Array.isArray(track.artists) ? track.artists.map((a: any) => typeof a === 'string' ? a : a.name) : [track.artist || 'Unknown Artist'],
                    albumArt: track.albumArt || '',
                    durationMs: track.durationMs
                });

                if (controller.signal.aborted) break;

                // Delay
                if (i < tracks.length - 1) {
                    await new Promise(resolve => {
                        const timeout = setTimeout(resolve, 2000);
                        controller.signal.addEventListener('abort', () => {
                            clearTimeout(timeout);
                            resolve(null);
                        }, { once: true });
                    });
                }
            } catch (err) {
                console.error(`[BulkDownload] Failed track ${track.id}`, err);
            }
        }
    } finally {
        console.log(`[BulkDownload] Task finished or stopped for: ${id}`);
        delete bulkAbortControllers.current[id];
        setActiveBulkDownloads(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
        window.dispatchEvent(new Event('lune:download-update'));
    }
  };

  const stopBulkDownload = (id: string) => {
    if (bulkAbortControllers.current[id]) {
        console.log(`[BulkDownload] Aborting task for context: ${id}`);
        bulkAbortControllers.current[id].abort();
    }
  };

  return (
    <PlayerContext.Provider value={{
      currentTrack,
      isPlaying,
      isShuffle,
      isLoop,
      queue: isShuffle ? shuffledQueue : queue, // Expose active queue to UI
      shuffledQueue,
      history,
      sessionHistory,
      sessionIndex,
      contextTracks,
      prefetchMap,
      showQueue,
      showFullNowPlaying,
      showLyrics,
      autoplayQueue,
      isRadioLoading,
      setAutoplayQueue,
      setIsRadioLoading,
      setIsPlaying,
      setIsShuffle: toggleShuffle, // Use the new toggle handler
      setIsLoop,
      setShowQueue,
      setShowFullNowPlaying,
      setShowLyrics,
      setCurrentTrack,
      setQueue,
      setHistory,
      handleTrackSelect,
      handleAddToQueue,
      handlePlayNext,
      handleRemoveFromQueue,
      handleNextTrack,
      handlePrevTrack,
      formatTrackForPlayer,
      clearHistory,
      activeBulkDownloads,
      startBulkDownload,
      stopBulkDownload
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
