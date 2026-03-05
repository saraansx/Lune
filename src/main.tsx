import React from 'react'
import ReactDOM from 'react-dom/client'
import Login from './components/Login/Login'
import SplashScreen from './components/SplashScreen/SplashScreen'
import TitleBar from './components/TitleBar/TitleBar'

import Sidebar from './components/Sidebar/Sidebar';
import Home from './components/Home/Home';
import Playlist from './components/Playlist/Playlist';
import TrackView from './components/TrackView/TrackView';
import Downloads from './components/Downloads/Downloads';
import ArtistView from './components/ArtistView/ArtistView';
import SearchView from './components/SearchView/SearchView';
import SearchBar from './components/SearchBar/SearchBar';
import { SpotifyGqlApi } from '../Plugin/gql/index';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { PlaybackProvider } from './context/PlaybackContext';

import './index.css'

import PlayerBar from './components/PlayerBar/PlayerBar';
import NowPlayingView from './components/NowPlayingView/NowPlayingView';
import QueueView from './components/QueueView/QueueView';
import LyricsView from './components/LyricsView/LyricsView';
import Settings from './Settings/settings/Settings';
import updatesImg from './assets/Updates.png';
import mainLogo from './assets/Main.png';

const MainLayout = ({ 
  credentials, 
  handlePopBack, 
  handleBackToHome, 
  view, 
  selectedTrackInfo, 
  selectedArtistId, 
  searchQuery, 
  selectedPlaylistId, 
  selectedIsAlbum, 
  handlePlaylistSelect, 
  handleTrackViewSelect, 
  handleArtistSelect, 
  handleSearch, 
  handlePlayerArtistClick, 
  handleSettingsClick,
  viewStack,
  isOnline
}: any) => {
  const { 
    showQueue, 
    setShowQueue, 
  } = usePlayer();
  const { t } = useLanguage();

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', background: 'transparent', overflow: 'hidden' }}>
      <TitleBar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', width: '100%' }}>
        <Sidebar
          accessToken={credentials.accessToken}
          cookies={credentials.cookies}
          onPlaylistSelect={handlePlaylistSelect}
          onArtistSelect={handleArtistSelect}
          isOnline={isOnline}
        />
        <div style={{ flex: 1, overflow: 'hidden', width: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <div className="top-global-nav" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', width: '100%' }}>
            <div className="lune-nav-btn-container" style={{ justifySelf: 'start' }}>
              <button 
                onClick={handlePopBack} 
                className="lune-nav-btn" 
                title={t('nav.back')}
                disabled={viewStack.length === 0}
                style={{ opacity: viewStack.length > 0 ? 1 : 0.3, cursor: viewStack.length > 0 ? 'pointer' : 'default' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              {isOnline && (
                <button 
                  onClick={handleBackToHome} 
                  className="lune-nav-btn" 
                  title={t('nav.home')}
                  style={{ color: view === 'home' ? '#ffffff' : '#b3b3b3' }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                </button>
              )}
              {!isOnline && (
                <div className="offline-badge" style={{ 
                  background: 'rgba(255, 255, 255, 0.05)', 
                  padding: '6px 12px', 
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#e74c3c' }}></div>
                  {t('nav.offline')}
                </div>
              )}
            </div>

            <div style={{ justifySelf: 'center' }}>
              {isOnline && (
                <SearchBar 
                  accessToken={credentials.accessToken}
                  cookies={credentials.cookies}
                  onTrackViewSelect={handleTrackViewSelect}
                  onArtistSelect={handleArtistSelect}
                  onPlaylistSelect={handlePlaylistSelect}
                  onSearch={handleSearch}
                />
              )}
            </div>

            <div className="lune-top-actions" style={{ justifySelf: 'end', display: 'flex', alignItems: 'center' }}>
              <button 
                className="lune-nav-btn lune-settings-btn" 
                title={t('nav.settings')}
                onClick={handleSettingsClick}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </button>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', width: '100%', display: 'flex', flexDirection: 'column' }}>
            {view === 'home' ? (
              <Home
                accessToken={credentials.accessToken}
                cookies={credentials.cookies}
                onPlaylistSelect={handlePlaylistSelect}
                onTrackViewSelect={handleTrackViewSelect}
                onArtistSelect={handleArtistSelect}
              />
            ) : view === 'track' && selectedTrackInfo ? (
              <TrackView
                accessToken={credentials.accessToken}
                cookies={credentials.cookies}
                trackId={selectedTrackInfo.id}
                trackName={selectedTrackInfo.name}
                trackImage={selectedTrackInfo.image}
                trackArtists={selectedTrackInfo.artists}
                onBack={handlePopBack}
                onHome={handleBackToHome}
                onPlaylistSelect={handlePlaylistSelect}
                onArtistSelect={handleArtistSelect}
              />
            ) : view === 'artist' && selectedArtistId ? (
              <ArtistView
                accessToken={credentials.accessToken}
                cookies={credentials.cookies}
                artistId={selectedArtistId}
                onBack={handlePopBack}
                onHome={handleBackToHome}
                onPlaylistSelect={handlePlaylistSelect}
                onArtistSelect={handleArtistSelect}
              />
            ) : view === 'downloads' ? (
              <Downloads />
            ) : view === 'search' ? (
              <SearchView
                query={searchQuery}
                accessToken={credentials.accessToken}
                cookies={credentials.cookies}
                onTrackViewSelect={handleTrackViewSelect}
                onArtistSelect={handleArtistSelect}
                onPlaylistSelect={handlePlaylistSelect}
              />
            ) : view === 'settings' ? (
              <Settings accessToken={credentials.accessToken} cookies={credentials.cookies} />
            ) : (
              selectedPlaylistId && (
                <Playlist
                  accessToken={credentials.accessToken}
                  cookies={credentials.cookies}
                  playlistId={selectedPlaylistId}
                  isAlbum={selectedIsAlbum}
                  onBack={handlePopBack}
                  onHome={handleBackToHome}
                  onPlaylistSelect={handlePlaylistSelect}
                  onArtistSelect={handlePlayerArtistClick}
                />
              )
            )}
          </div>
        </div>
        {showQueue && (
          <QueueView 
            onClose={() => setShowQueue(false)} 
            onArtistSelect={handlePlayerArtistClick}
          />
        )}
        
        <NowPlayingView
          accessToken={credentials.accessToken}
          cookies={credentials.cookies}
          isFullscreen={true}
          onArtistSelect={handlePlayerArtistClick}
          onPlaylistSelect={handlePlaylistSelect}
        />
        <LyricsView />
      </div>
      <PlayerBar
        onArtistSelect={handlePlayerArtistClick}
        accessToken={credentials?.accessToken}
      />
    </div>
  );
};

const MajorUpdateModal = ({ updateStatus, setAppUpdateStatus }: { updateStatus: any, setAppUpdateStatus: any }) => {
  if (!updateStatus || updateStatus.status === 'idle') return null;

  const status = updateStatus.status;
  const progress = Math.round(updateStatus.progress?.percent || 0);
  const releaseNotes = updateStatus.info?.releaseNotes;

  return (
    <div className={`major-update-overlay ${status}`}>
       <div className="major-update-glass">
          <div className="update-content-box">
             {status !== 'downloading' && !releaseNotes && (
                <div className="update-icon-wrapper">
                  <img src={updatesImg} alt="Update" className="update-hero-img" />
                </div>
             )}
             
             <div className="update-text-section">
                <h1 className="update-title">
                  {status === 'checking' && 'Searching for updates'}
                  {status === 'available' && `Lune v${updateStatus.info?.version}`}
                  {status === 'downloading' && 'Updating Lune'}
                   {status === 'downloaded' && 'Update Ready'}
                   {status === 'up-to-date' && 'Up to Date'}
                   {status === 'error' && 'Update Error'}
                 </h1>

                {releaseNotes && (status === 'available' || status === 'downloaded' || (status === 'downloading' && progress > 80)) && (
                   <div className="update-notes-container">
                      <div className="update-notes-label">What's New</div>
                      <div className="update-notes-content" dangerouslySetInnerHTML={{ __html: typeof releaseNotes === 'string' ? releaseNotes : '' }} />
                   </div>
                )}

                <p className="update-description" style={{ marginTop: releaseNotes ? '8px' : '0' }}>
                   {status === 'checking' && 'Checking for the latest version...'}
                   {status === 'available' && !releaseNotes && 'A new version is available with improved performance and stability.'}
                   {status === 'downloading' && `Updating your experience... ${progress}%`}
                    {status === 'downloaded' && !releaseNotes && 'The update is ready to be installed.'}
                    {status === 'up-to-date' && "You're running the latest version of Lune."}
                    {status === 'error' && (() => {
                      const msg = updateStatus.message || '';
                      // If message is a giant wall of headers (like the CSP error), show a clean fallback
                      if (msg.length > 100 || msg.includes('Content-Security-Policy') || msg.includes('github')) {
                        return 'Unable to reach the update server. Please check your connection or try again later.';
                      }
                      return msg;
                   })()}
                </p>
             </div>

             <div className="update-controls">
                {status === 'available' && (
                  <button className="premium-action-btn" onClick={() => {
                     if (updateStatus.demo) {
                        window.postMessage({ type: 'app-update-status-demo', status: 'start-download-demo', info: updateStatus.info }, '*');
                     } else {
                        window.ipcRenderer.invoke('start-app-download');
                     }
                  }}>
                    Update Now
                  </button>
                )}
                {status === 'downloaded' && (
                  <button className="premium-action-btn" onClick={() => {
                     if (updateStatus.demo) {
                        window.postMessage({ type: 'app-update-status-demo', status: 'idle' }, '*');
                     } else {
                        window.ipcRenderer.invoke('quit-and-install-update');
                     }
                  }}>
                    Restart & Install
                  </button>
                 )}
                 
                 {status === 'up-to-date' && (
                   <button className="premium-action-btn secondary" onClick={() => setAppUpdateStatus({ status: 'idle' })}>
                     Close
                   </button>
                 )}
                 
                 {status === 'checking' && <div className="premium-minimal-loader" />}
                
                {status === 'downloading' && (
                  <div className="premium-progress-container">
                    <div className="premium-progress-bar" style={{ width: `${progress}%` }} />
                  </div>
                )}
             </div>
          </div>
          
          <div className="update-close-btn" onClick={() => {
             setAppUpdateStatus({ status: 'idle' });
          }}>
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </div>
       </div>
    </div>
  );
};

const YtdlpUpdateModal = ({ updateStatus, setYtdlpStatus }: { updateStatus: any, setYtdlpStatus: any }) => {
  const { t } = useLanguage();
  if (!updateStatus || updateStatus.status === 'idle') return null;

  const status = updateStatus.status;

  return (
    <div className={`major-update-overlay ytdlp-theme ${status}`}>
       <div className="major-update-glass">
          <div className="update-content-box">
             <div className="update-icon-wrapper ytdlp-icon">
                <img src={mainLogo} alt="Playback Engine" className="update-hero-img" />
             </div>
             
             <div className="update-text-section">
                <h1 className="update-title">
                  {status === 'checking' && (t('ytdlp.checking') || 'Checking Drivers')}
                  {status === 'ready' && (updateStatus.isLatest ? "It's up to date" : (t('ytdlp.ready') || 'Drivers Ready'))}
                  {status === 'error' && (t('ytdlp.error') || 'Driver Error')}
                </h1>

                <p className="update-description">
                   {status === 'checking' && 'Optimizing your playback engine for the best experience...'}
                   {status === 'ready' && (updateStatus.isLatest ? 'Your playback system is already running the latest configuration.' : 'Your playback drivers have been successfully updated.')}
                   {status === 'error' && (updateStatus.message || 'Unable to update playback drivers. Please try again later.')}
                </p>
             </div>

             <div className="update-controls">
                {status === 'ready' && (
                  <button className="premium-action-btn" onClick={() => setYtdlpStatus({ status: 'idle' })}>
                    Got it
                  </button>
                )}
                {status === 'error' && (
                  <button className="premium-action-btn secondary" onClick={() => setYtdlpStatus({ status: 'idle' })}>
                    Close
                  </button>
                )}
                {status === 'checking' && <div className="premium-minimal-loader" />}
             </div>
          </div>
          
          <div className="update-close-btn" onClick={() => setYtdlpStatus({ status: 'idle' })}>
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </div>
       </div>
    </div>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);
  const [credentials, setCredentials] = React.useState<any>(null);
  const [isOnline, setIsOnline] = React.useState(window.navigator.onLine);
  const [view, setView] = React.useState<'home' | 'playlist' | 'track' | 'downloads' | 'artist' | 'search' | 'settings'>('home');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedPlaylistId, setSelectedPlaylistId] = React.useState<string | null>(null);
  const [selectedIsAlbum, setSelectedIsAlbum] = React.useState(false);
  const [selectedTrackInfo, setSelectedTrackInfo] = React.useState<any>(null);
  const [selectedArtistId, setSelectedArtistId] = React.useState<string | null>(null);
  const [viewStack, setViewStack] = React.useState<any[]>([]);
  const [showSplash, setShowSplash] = React.useState(true);
  const [ytdlpStatus, setYtdlpStatus] = React.useState<any>({ status: 'idle' });
  const [appUpdateStatus, setAppUpdateStatus] = React.useState<any>({ status: 'idle' });
  const preOfflineState = React.useRef<any>(null);

  React.useEffect(() => {
    if (!window.ipcRenderer) return;
    
    const handleAppUpdate = (_event: any, updateData: any) => {
      if (updateData.status === 'up-to-date') return;
      setAppUpdateStatus(updateData);
      if (updateData.status === 'error') {
        setTimeout(() => setAppUpdateStatus({ status: 'idle' }), 5000);
      }
    };

    const handleYtdlpUpdate = (_event: any, statusData: any) => {
      const data = typeof statusData === 'string' ? { status: statusData } : statusData;
      if (data.status === 'ready' && data.isLatest) return;
      setYtdlpStatus(data);
    };

    const removeYtdlpListener = window.ipcRenderer.on('ytdlp-update-status', handleYtdlpUpdate);

    const removeAppListener = window.ipcRenderer.on('app-update-status', handleAppUpdate);

    // MOCK / DEMO LISTENER
    const handleMessage = (e: MessageEvent) => {
        if (e.data?.type === 'app-update-status-demo') {
            if (e.data.status === 'start-download-demo') {
                let p = 0;
                const inv = setInterval(() => {
                    p += 2;
                    setAppUpdateStatus({ status: 'downloading', progress: { percent: p }, demo: true, info: e.data.info });
                    if (p >= 100) {
                        clearInterval(inv);
                        setAppUpdateStatus({ status: 'downloaded', demo: true, info: e.data.info });
                    }
                }, 40);
            } else {
               handleAppUpdate(null, e.data);
            }
        }
    };
    window.addEventListener('message', handleMessage);

    return () => {
      if (typeof removeYtdlpListener === 'function') (removeYtdlpListener as any)();
      if (typeof removeAppListener === 'function') (removeAppListener as any)();
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const pushView = () => {
    setViewStack(prev => [...prev, {
      view,
      selectedPlaylistId,
      selectedIsAlbum,
      selectedTrackInfo,
      selectedArtistId,
      searchQuery
    }]);
  };

  const handlePopBack = () => {
    if (viewStack.length === 0) {
      handleBackToHome();
      return;
    }
    const newStack = [...viewStack];
    const last = newStack.pop();
    setViewStack(newStack);
    
    if (last) {
      setView(last.view);
      setSelectedPlaylistId(last.selectedPlaylistId);
      setSelectedIsAlbum(last.selectedIsAlbum);
      setSelectedTrackInfo(last.selectedTrackInfo);
      setSelectedArtistId(last.selectedArtistId);
      setSearchQuery(last.searchQuery || '');
    }
  };

  React.useEffect(() => {
    let refreshTimer: ReturnType<typeof setTimeout>;
    let isLoggedIn = false;
    let cancelled = false;

    const loadCredentials = async () => {
      if (cancelled) return;
      try {
        const creds = await window.ipcRenderer.invoke('get-spotify-credentials');
        if (cancelled) return;

        if (creds) {
          setCredentials(creds);
          setIsAuthenticated(true);
          setIsCheckingAuth(false);
          isLoggedIn = true;

          if (creds.expiration) {
            const msUntilRefresh = creds.expiration - Date.now() - (120 * 1000);
            if (msUntilRefresh > 0) {
              refreshTimer = setTimeout(loadCredentials, msUntilRefresh);
            } else {
              refreshTimer = setTimeout(loadCredentials, 5 * 60 * 1000);
            }
          }
        } else {
          setIsAuthenticated(false);
          setCredentials(null);
          isLoggedIn = false;
          setIsCheckingAuth(false);
        }
      } catch (err) {
        if (cancelled) return;
        setIsCheckingAuth(false);
        if (isLoggedIn) {
          refreshTimer = setTimeout(loadCredentials, 30000);
        }
      }
    };

    loadCredentials();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      cancelled = true;
      clearTimeout(refreshTimer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle offline/online view jumps
  React.useEffect(() => {
    if (!isOnline) {
      const onlineViews = ['home', 'playlist', 'track', 'artist', 'search', 'settings'];
      if (onlineViews.includes(view)) {
        // Save current state before jumping to downloads
        preOfflineState.current = {
            view,
            selectedPlaylistId,
            selectedIsAlbum,
            selectedTrackInfo,
            selectedArtistId,
            searchQuery
        };
        setView('downloads');
      }
    } else {
        // We're back online! Restore the previous view if we have one
        if (preOfflineState.current) {
            const s = preOfflineState.current;
            setView(s.view);
            setSelectedPlaylistId(s.selectedPlaylistId);
            setSelectedIsAlbum(s.selectedIsAlbum);
            setSelectedTrackInfo(s.selectedTrackInfo);
            setSelectedArtistId(s.selectedArtistId);
            setSearchQuery(s.searchQuery);
            preOfflineState.current = null; // Clear it
        }
    }
  }, [isOnline]);

  const handlePlaylistSelect = (id: string, isAlbum?: boolean) => {
    pushView();
    if (id === 'downloads-view') {
      setView('downloads');
      return;
    }
    setSelectedPlaylistId(id);
    setSelectedIsAlbum(!!isAlbum);
    setView('playlist');
  };

  const handleBackToHome = () => {
    setViewStack([]);
    setView('home');
    setSelectedPlaylistId(null);
    setSelectedTrackInfo(null);
    setSelectedArtistId(null);
  };

  const handleTrackViewSelect = (trackInfo: { id: string; name: string; image: string; artists: string[] }) => {
    pushView();
    setSelectedTrackInfo(trackInfo);
    setView('track');
  };

  const handleArtistSelect = (id: string) => {
    pushView();
    setSelectedArtistId(id);
    setView('artist');
  };

  const handleSearch = (query: string) => {
    pushView();
    setSearchQuery(query);
    setView('search');
  };

  const handleSettingsClick = () => {
    pushView();
    setView('settings');
  };

  const handlePlayerArtistClick = async (artistId?: string | null, artistName?: string) => {
    if (!credentials || !credentials.accessToken) return;
    
    // 1. If we have an ID, use it directly (Robust)
    if (artistId) {
        handleArtistSelect(artistId);
        return;
    }

    // 2. Fallback: If no ID but we have a name, search for the artist
    if (!artistName) return;

    const spDc = credentials.cookies?.find((c: any) => c.name === 'sp_dc')?.value;
    const spT = credentials.cookies?.find((c: any) => c.name === 'sp_t')?.value;
    const api = new SpotifyGqlApi(credentials.accessToken, spDc, spT);
    
    try {
      // Split by comma in case it's a multi-artist string, and take the first one
      const searchName = artistName.split(',')[0].trim();
      const searchRes = await api.search.artists(searchName, { limit: 1 });
      if (searchRes.items && searchRes.items.length > 0) {
        handleArtistSelect(searchRes.items[0].id);
      }
    } catch (err) {
      console.error('Failed to search artist:', err);
    }
  };

  // Show splash while checking auth — no flicker
  if (isCheckingAuth) {
    return (
      <div style={{ 
        position: 'fixed', 
        inset: 0, 
        backgroundColor: '#050608', 
        zIndex: 'var(--z-splash)' as any
      }}>
        <SplashScreen onFinished={() => {}} />
      </div>
    );
  }

  if (isAuthenticated && credentials) {
    return (
      <React.Fragment>
        {showSplash && <SplashScreen onFinished={() => setShowSplash(false)} />}
        <MainLayout 
          credentials={credentials}
          handlePopBack={handlePopBack}
          handleBackToHome={handleBackToHome}
          view={view}
          selectedTrackInfo={selectedTrackInfo}
          selectedArtistId={selectedArtistId}
          searchQuery={searchQuery}
          selectedPlaylistId={selectedPlaylistId}
          selectedIsAlbum={selectedIsAlbum}
          handlePlaylistSelect={handlePlaylistSelect}
          handleTrackViewSelect={handleTrackViewSelect}
          handleArtistSelect={handleArtistSelect}
          handleSearch={handleSearch}
          handlePlayerArtistClick={handlePlayerArtistClick}
          handleSettingsClick={handleSettingsClick}
          viewStack={viewStack}
          isOnline={isOnline}
        />
        <MajorUpdateModal updateStatus={appUpdateStatus} setAppUpdateStatus={setAppUpdateStatus} />
        <YtdlpUpdateModal updateStatus={ytdlpStatus} setYtdlpStatus={setYtdlpStatus} />
      </React.Fragment>
    );
  }

  return (
    <div className="login-container">
      <TitleBar />
      <Login onLoginSuccess={async () => {
        const creds = await window.ipcRenderer.invoke('get-spotify-credentials');
        if (creds) {
          setCredentials(creds);
          setIsAuthenticated(true);
        }
      }} />
    </div>
  );
};

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: 'white' }}>
          <h1>Something went wrong.</h1>
          <pre>{this.state.error?.toString()}</pre>
          <button onClick={() => window.location.reload()} style={{ marginTop: 20, padding: 10 }}>Reload App</button>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <PlaybackProvider>
          <LanguageProvider>
            <PlayerProvider>
              <App />
            </PlayerProvider>
          </LanguageProvider>
        </PlaybackProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
)

window.ipcRenderer.on('main-process-message', (_event, message) => {
  console.log(message)
})
