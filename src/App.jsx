import React, { useState, useEffect } from 'react';
import problemsData from './data/cses_problems.json';
import Dashboard from './components/Dashboard';
import Recommendations from './components/Recommendations';
import ProblemGrid from './components/ProblemGrid';
import BookmarkletHelp from './components/BookmarkletHelp';
import { parseCSESHtml } from './utils/parser';
import './App.css';

function App() {
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  // Routing states parsed from URL hash
  const [activeTab, setActiveTab] = useState('table'); // table, list, stats, recommendations, sync
  const [userId, setUserId] = useState('Anonymous');
  const [rivalId, setRivalId] = useState('');

  // Form input states
  const [userInputVal, setUserInputVal] = useState('Anonymous');
  const [rivalInputVal, setRivalInputVal] = useState('');

  // Solved IDs for active user and rival
  const [userSolvedIds, setUserSolvedIds] = useState([]);
  const [rivalSolvedIds, setRivalSolvedIds] = useState([]);

  // Toggle options
  const [showDifficulty, setShowDifficulty] = useState(() => {
    return localStorage.getItem('cses_show_difficulty') !== 'false';
  });
  const [hideSolved, setHideSolved] = useState(() => {
    return localStorage.getItem('cses_hide_solved') === 'true';
  });

  // Keep track of all known users in localStorage to populate suggestions/history
  const [knownUsers, setKnownUsers] = useState(() => {
    const saved = localStorage.getItem('cses_known_users');
    return saved ? JSON.parse(saved) : ['Anonymous'];
  });

  // Syncing states
  const [isSyncingUser, setIsSyncingUser] = useState(false);
  const [isSyncingRival, setIsSyncingRival] = useState(false);
  const [syncErrorUser, setSyncErrorUser] = useState('');
  const [syncErrorRival, setSyncErrorRival] = useState('');
  const [syncSuccessUser, setSyncSuccessUser] = useState('');
  const [syncSuccessRival, setSyncSuccessRival] = useState('');
  const [isSyncPanelOpen, setIsSyncPanelOpen] = useState(false);

  // Handle hash changes / routing
  useEffect(() => {
    const parseHash = () => {
      const hash = window.location.hash;
      
      // Check for bookmarklet redirect first: #solved=1068,1083...
      if (hash && hash.startsWith('#solved=')) {
        const idsStr = hash.replace('#solved=', '');
        const ids = idsStr.split(',').filter(Boolean);
        
        // Save to active user
        const activeUser = localStorage.getItem('cses_last_active_user') || 'Anonymous';
        localStorage.setItem(`cses_solved_ids_${activeUser}`, JSON.stringify(ids));
        
        // Add to known users
        setKnownUsers(prev => {
          if (!prev.includes(activeUser)) {
            const next = [...prev, activeUser];
            localStorage.setItem('cses_known_users', JSON.stringify(next));
            return next;
          }
          return prev;
        });

        alert(`Successfully imported ${ids.length} solved problems for ${activeUser}!`);
        
        // Redirect to standard hash
        window.location.hash = `#/table/${activeUser}`;
        return;
      }

      // Default route: #/table/Anonymous
      if (!hash || !hash.startsWith('#/')) {
        window.location.hash = `#/table/${userId}`;
        return;
      }

      // Split hash: #/table/user/rival
      const parts = hash.substring(2).split('/');
      const tab = parts[0] || 'table';
      const user = parts[1] || 'Anonymous';
      const rival = parts[2] || '';

      setActiveTab(tab);
      setUserId(user);
      setRivalId(rival);
      setUserInputVal(user);
      setRivalInputVal(rival);
      localStorage.setItem('cses_last_active_user', user);
    };

    parseHash();
    window.addEventListener('hashchange', parseHash);
    return () => window.removeEventListener('hashchange', parseHash);
  }, []);

  // Update URL hash when states change (e.g. tabs clicked)
  const updateHashRoute = (tab, user, rival) => {
    const rPart = rival ? `/${rival}` : '';
    window.location.hash = `#/${tab}/${user}${rPart}`;
  };

  // Syncing solved problems data from CSES server
  const syncUserSolvedData = async (username, cookie, type = 'user') => {
    if (!username || username === 'Anonymous') return;

    const setIsSyncing = type === 'user' ? setIsSyncingUser : setIsSyncingRival;
    const setSyncError = type === 'user' ? setSyncErrorUser : setSyncErrorRival;
    const setSyncSuccess = type === 'user' ? setSyncSuccessUser : setSyncSuccessRival;
    const setSolvedIds = type === 'user' ? setUserSolvedIds : setRivalSolvedIds;

    setIsSyncing(true);
    setSyncError('');
    setSyncSuccess('');

    try {
      const response = await fetch(`/api/cses-sync?cookie=${encodeURIComponent(cookie.trim())}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed with status ${response.status}`);
      }

      const count = data.solvedIds.length;
      
      // Save to localStorage
      localStorage.setItem(`cses_solved_ids_${username}`, JSON.stringify(data.solvedIds));
      localStorage.setItem(`cses_cookie_${username}`, cookie.trim());
      
      setSolvedIds(data.solvedIds);
      setSyncSuccess(`Success! Synced ${count} solved problems.`);

      // Add to known users
      setKnownUsers(prev => {
        if (!prev.includes(username)) {
          const next = [...prev, username];
          localStorage.setItem('cses_known_users', JSON.stringify(next));
          return next;
        }
        return prev;
      });
    } catch (err) {
      setSyncError(err.message || 'Failed to sync. Please check the session cookie.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleHtmlImport = (htmlText, username, type = 'user') => {
    const ids = parseCSESHtml(htmlText);
    const setSolvedIds = type === 'user' ? setUserSolvedIds : setRivalSolvedIds;
    const setSyncSuccess = type === 'user' ? setSyncSuccessUser : setSyncSuccessRival;
    const setSyncError = type === 'user' ? setSyncErrorUser : setSyncErrorRival;

    setSyncError('');
    setSyncSuccess('');

    if (ids.length > 0) {
      localStorage.setItem(`cses_solved_ids_${username}`, JSON.stringify(ids));
      setSolvedIds(ids);
      setSyncSuccess(`Success! Imported ${ids.length} solved problems.`);
      
      // Add to known users
      setKnownUsers(prev => {
        if (!prev.includes(username)) {
          const next = [...prev, username];
          localStorage.setItem('cses_known_users', JSON.stringify(next));
          return next;
        }
        return prev;
      });
    } else {
      setSyncError("No solved tasks found. Make sure to copy the entire CSES problemset page (Ctrl+A then Ctrl+C).");
    }
  };

  const handleClearCookie = (username, type = 'user') => {
    localStorage.removeItem(`cses_cookie_${username}`);
    const setSyncSuccess = type === 'user' ? setSyncSuccessUser : setSyncSuccessRival;
    setSyncSuccess('Session cookie cleared.');
  };

  // Load solved lists from localStorage and auto-sync if cookie exists
  useEffect(() => {
    // Reset sync messages
    setSyncErrorUser('');
    setSyncSuccessUser('');
    setSyncErrorRival('');
    setSyncSuccessRival('');

    // User solved
    const savedUserSolved = localStorage.getItem(`cses_solved_ids_${userId}`);
    if (savedUserSolved) {
      try {
        setUserSolvedIds(JSON.parse(savedUserSolved));
      } catch (e) {
        setUserSolvedIds([]);
      }
    } else {
      setUserSolvedIds([]);
    }

    const userCookie = localStorage.getItem(`cses_cookie_${userId}`);
    if (userCookie && userId && userId !== 'Anonymous' && isLocalhost) {
      syncUserSolvedData(userId, userCookie, 'user');
    }

    // Rival solved
    if (rivalId) {
      const savedRivalSolved = localStorage.getItem(`cses_solved_ids_${rivalId}`);
      if (savedRivalSolved) {
        try {
          setRivalSolvedIds(JSON.parse(savedRivalSolved));
        } catch (e) {
          setRivalSolvedIds([]);
        }
      } else {
        setRivalSolvedIds([]);
      }

      const rivalCookie = localStorage.getItem(`cses_cookie_${rivalId}`);
      if (rivalCookie && isLocalhost) {
        syncUserSolvedData(rivalId, rivalCookie, 'rival');
      }
    } else {
      setRivalSolvedIds([]);
    }
  }, [userId, rivalId]);

  // Auto-expand Sync Manager if user/rival has no solved problems and no cookie saved
  useEffect(() => {
    const userCookie = localStorage.getItem(`cses_cookie_${userId}`);
    const hasRival = !!rivalId;
    const rivalCookie = hasRival ? localStorage.getItem(`cses_cookie_${rivalId}`) : null;
    
    const userNeedsSync = userId && userId !== 'Anonymous' && userSolvedIds.length === 0 && !userCookie;
    const rivalNeedsSync = hasRival && rivalSolvedIds.length === 0 && !rivalCookie;

    if (userNeedsSync || rivalNeedsSync) {
      setIsSyncPanelOpen(true);
    }
  }, [userId, rivalId, userSolvedIds.length, rivalSolvedIds.length]);

  // Sync checkboxes to localStorage
  useEffect(() => {
    localStorage.setItem('cses_show_difficulty', showDifficulty);
  }, [showDifficulty]);

  useEffect(() => {
    localStorage.setItem('cses_hide_solved', hideSolved);
  }, [hideSolved]);

  // Actions
  const handleUpdateUserSolved = (ids, targetUser = userId) => {
    localStorage.setItem(`cses_solved_ids_${targetUser}`, JSON.stringify(ids));
    if (targetUser === userId) {
      setUserSolvedIds(ids);
    } else if (targetUser === rivalId) {
      setRivalSolvedIds(ids);
    }
    setKnownUsers(prev => {
      if (!prev.includes(targetUser)) {
        const next = [...prev, targetUser];
        localStorage.setItem('cses_known_users', JSON.stringify(next));
        return next;
      }
      return prev;
    });
  };

  const handleToggleSolvedManual = (id) => {
    const isSolved = userSolvedIds.includes(id);
    const nextIds = isSolved 
      ? userSolvedIds.filter(item => item !== id) 
      : [...userSolvedIds, id];
    
    handleUpdateUserSolved(nextIds, userId);
  };

  const handleUserFormSubmit = (e) => {
    e.preventDefault();
    const cleanUser = userInputVal.trim() || 'Anonymous';
    const cleanRival = rivalInputVal.trim();
    
    // Add to known users
    setKnownUsers(prev => {
      const next = [...prev];
      if (!next.includes(cleanUser)) next.push(cleanUser);
      if (cleanRival && !next.includes(cleanRival)) next.push(cleanRival);
      localStorage.setItem('cses_known_users', JSON.stringify(next));
      return next;
    });

    updateHashRoute(activeTab, cleanUser, cleanRival);
  };

  const handleClearData = (targetUser) => {
    if (window.confirm(`Are you sure you want to clear solved data for ${targetUser}?`)) {
      localStorage.removeItem(`cses_solved_ids_${targetUser}`);
      if (targetUser === userId) setUserSolvedIds([]);
      if (targetUser === rivalId) setRivalSolvedIds([]);
    }
  };

  const renderSyncSection = (targetUsername, type) => {
    if (!targetUsername || targetUsername === 'Anonymous') {
      return (
        <div className="sync-method-card">
          <p style={{ fontSize: '0.85rem', color: '#888', textAlign: 'center', margin: '1rem 0' }}>
            {type === 'user' ? 'Please set a User ID in the top bar to enable solved status tracking.' : 'No Rival ID set. Set a Rival ID in the top bar to compare solutions.'}
          </p>
        </div>
      );
    }

    const isSyncing = type === 'user' ? isSyncingUser : isSyncingRival;
    const syncError = type === 'user' ? syncErrorUser : syncErrorRival;
    const syncSuccess = type === 'user' ? syncSuccessUser : syncSuccessRival;
    const solvedCount = type === 'user' ? userSolvedIds.length : rivalSolvedIds.length;
    const storedCookie = localStorage.getItem(`cses_cookie_${targetUsername}`) || '';
    
    return (
      <div className="sync-method-card">
        <h4 className="sync-method-title">
          👤 {type === 'user' ? 'User' : 'Rival'}: {targetUsername} 
          <span style={{ fontWeight: 'normal', color: '#888', fontSize: '0.75rem', marginLeft: 'auto' }}>
            ({solvedCount} solved)
          </span>
        </h4>
        
        {/* Method 1: Cookie Sync */}
        {isLocalhost ? (
          <div style={{ marginTop: '0.5rem', borderBottom: '1px solid #282828', paddingBottom: '1rem' }}>
            <div className="sync-method-title" style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '0.25rem' }}>
              🔑 Method A: Auto-Sync via Cookie
            </div>
            <p className="sync-method-desc">
              Enter your CSES <code>PHPSESSID</code> cookie to auto-refresh solved problems.
            </p>
            <SyncCookieForm 
              username={targetUsername}
              type={type}
              storedCookie={storedCookie}
              isSyncing={isSyncing}
              onSync={syncUserSolvedData}
              onClearCookie={handleClearCookie}
            />
          </div>
        ) : (
          <div style={{ marginTop: '0.5rem', borderBottom: '1px solid #282828', paddingBottom: '1rem' }}>
            <div style={{ color: '#ff9933', fontSize: '0.75rem', background: 'rgba(255, 153, 51, 0.05)', padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(255, 153, 51, 0.15)', lineHeight: '1.4' }}>
              ⚠️ <strong>Cookie Auto-Sync</strong> is only supported when running the tracker locally (on localhost) due to browser CORS policies on cses.fi. Please use the Bookmarklet method or paste HTML below.
            </div>
          </div>
        )}

        {/* Method 2: HTML Paste Sync */}
        <div style={{ marginTop: '1rem' }}>
          <div className="sync-method-title" style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '0.25rem' }}>
            📋 Method B: Paste CSES HTML
          </div>
          <p className="sync-method-desc">
            Alternative: Copy (Ctrl+A) and paste the cses.fi/problemset/ page.
          </p>
          <SyncHtmlForm 
            username={targetUsername}
            type={type}
            onImport={handleHtmlImport}
          />
        </div>

        {syncError && (
          <div className="sync-msg-box error">
            ⚠️ {syncError}
          </div>
        )}
        {syncSuccess && (
          <div className="sync-msg-box success">
            ✓ {syncSuccess}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="app-container">
      {/* App Header */}
      <header className="app-header">
        <div className="header-top">
          <div className="brand">
            <h1>CSES Problems</h1>
            <span>Kenkoooo Layout</span>
          </div>
          {/* Navigation Tabs */}
          <nav className="nav-tabs">
            <button 
              className={`nav-tab ${activeTab === 'table' ? 'active' : ''}`}
              onClick={() => updateHashRoute('table', userId, rivalId)}
            >
              Table
            </button>
            <button 
              className={`nav-tab ${activeTab === 'list' ? 'active' : ''}`}
              onClick={() => updateHashRoute('list', userId, rivalId)}
            >
              List
            </button>
            <button 
              className={`nav-tab ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={() => updateHashRoute('stats', userId, rivalId)}
            >
              Stats
            </button>
            <button 
              className={`nav-tab ${activeTab === 'recommendations' ? 'active' : ''}`}
              onClick={() => updateHashRoute('recommendations', userId, rivalId)}
            >
              Recommendations
            </button>
            <button 
              className={`nav-tab ${activeTab === 'sync' ? 'active' : ''}`}
              onClick={() => updateHashRoute('sync', userId, rivalId)}
            >
              Bookmarklet Sync
            </button>
          </nav>
        </div>
      </header>

      {/* Control Panel (Filters and User Inputs) */}
      <section className="control-panel">
        {/* User IDs input forms */}
        <form onSubmit={handleUserFormSubmit} className="control-group">
          <span className="control-label">User ID:</span>
          <input 
            type="text" 
            value={userInputVal}
            onChange={(e) => setUserInputVal(e.target.value)}
            className="input-sm"
            placeholder="User ID"
            list="known-users-list"
          />
          
          <span className="control-label">Rival ID:</span>
          <input 
            type="text" 
            value={rivalInputVal}
            onChange={(e) => setRivalInputVal(e.target.value)}
            className="input-sm"
            placeholder="Rival ID"
            list="known-users-list"
          />
          
          <button type="submit" className="btn-sm active">Update</button>
          {userId !== 'Anonymous' && (
            <button 
              type="button" 
              className={`btn-sm ${isSyncPanelOpen ? 'active' : ''}`}
              onClick={() => setIsSyncPanelOpen(!isSyncPanelOpen)}
              style={{ marginLeft: '0.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
            >
              🔌 Sync Settings
            </button>
          )}

          <datalist id="known-users-list">
            {knownUsers.map(u => <option key={u} value={u} />)}
          </datalist>
        </form>

        {/* Display Toggles */}
        <div className="control-group">
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={showDifficulty} 
              onChange={(e) => setShowDifficulty(e.target.checked)}
            />
            Show Difficulty
          </label>

          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={hideSolved} 
              onChange={(e) => setHideSolved(e.target.checked)}
            />
            Hide Solved Problems
          </label>
        </div>
      </section>

      {/* Sync Manager Panel */}
      {isSyncPanelOpen && userId !== 'Anonymous' && (
        <section className="sync-manager-panel">
          <div className="sync-manager-header">
            <div className="sync-manager-title">
              🔌 CSES Solved Status Sync Manager
            </div>
            <div className="sync-status-badges">
              {/* User badge */}
              {isSyncingUser ? (
                <span className="sync-status-badge syncing">
                  <span className="sync-spinner"></span> Syncing {userId}...
                </span>
              ) : localStorage.getItem(`cses_cookie_${userId}`) ? (
                <span className="sync-status-badge synced">
                  ✓ {userId} Auto-Sync Active ({userSolvedIds.length} solved)
                </span>
              ) : userSolvedIds.length > 0 ? (
                <span className="sync-status-badge">
                  ✓ {userId} Loaded ({userSolvedIds.length} solved)
                </span>
              ) : (
                <span className="sync-status-badge warning">
                  ⚠️ {userId} Sync Required
                </span>
              )}

              {/* Rival badge */}
              {rivalId && (
                isSyncingRival ? (
                  <span className="sync-status-badge syncing">
                    <span className="sync-spinner"></span> Syncing {rivalId}...
                  </span>
                ) : localStorage.getItem(`cses_cookie_${rivalId}`) ? (
                  <span className="sync-status-badge synced">
                    ✓ {rivalId} Auto-Sync Active ({rivalSolvedIds.length} solved)
                  </span>
                ) : rivalSolvedIds.length > 0 ? (
                  <span className="sync-status-badge">
                    ✓ {rivalId} Loaded ({rivalSolvedIds.length} solved)
                  </span>
                ) : (
                  <span className="sync-status-badge warning">
                    ⚠️ {rivalId} Sync Required
                  </span>
                )
              )}
            </div>
          </div>

          <div className="sync-cards-container">
            {renderSyncSection(userId, 'user')}
            {rivalId ? renderSyncSection(rivalId, 'rival') : (
              <div className="sync-method-card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#666', fontSize: '0.85rem', padding: '2rem 1rem' }}>
                <div>No Rival ID set. Enter a Rival ID in the top bar to compare solved status!</div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Active Tab Page Content */}
      <main className="main-content-area">
        {activeTab === 'table' && (
          <ProblemGrid 
            problemsData={problemsData}
            solvedIds={userSolvedIds}
            rivalSolvedIds={rivalSolvedIds}
            onToggleSolvedManual={handleToggleSolvedManual}
            showDifficulty={showDifficulty}
            hideSolved={hideSolved}
            selectedFriend={rivalId}
            viewMode="category" // category represents Table view
          />
        )}

        {activeTab === 'list' && (
          <ProblemGrid 
            problemsData={problemsData}
            solvedIds={userSolvedIds}
            rivalSolvedIds={rivalSolvedIds}
            onToggleSolvedManual={handleToggleSolvedManual}
            showDifficulty={showDifficulty}
            hideSolved={hideSolved}
            selectedFriend={rivalId}
            viewMode="list" // list represents List view
          />
        )}

        {activeTab === 'stats' && (
          <Dashboard 
            problemsData={problemsData}
            solvedIds={userSolvedIds}
            rivalSolvedIds={rivalSolvedIds}
            userId={userId}
            rivalId={rivalId}
            onUpdateSolved={handleUpdateUserSolved}
            onClearSolved={handleClearData}
          />
        )}

        {activeTab === 'recommendations' && (
          <Recommendations 
            problemsData={problemsData}
            solvedIds={userSolvedIds}
          />
        )}

        {activeTab === 'sync' && (
          <BookmarkletHelp 
            userId={userId}
            rivalId={rivalId}
            onSyncSolved={handleUpdateUserSolved}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer text-center text-xs text-muted mt-8 mb-4">
        <p>CSES Problems Tracker (Kenkoooo Layout). Designed to look like AtCoder Problems.</p>
        <p className="mt-2">Privacy friendly: All user profiles and solved states are stored locally in your browser.</p>
      </footer>
    </div>
  );
}

export default App;

function SyncCookieForm({ username, type, storedCookie, isSyncing, onSync, onClearCookie }) {
  const [cookieInput, setCookieInput] = useState('');
  const [showGuide, setShowGuide] = useState(false);

  const hasCookie = !!storedCookie;

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = cookieInput.trim();
    if (!val) return;
    onSync(username, val, type);
    setCookieInput('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {hasCookie ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#111', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #333' }}>
          <span style={{ fontSize: '0.75rem', color: '#3faf3f' }}>✓ Cookie Saved</span>
          <button 
            type="button" 
            className="btn-sm" 
            onClick={() => onSync(username, storedCookie, type)}
            disabled={isSyncing}
            style={{ marginLeft: 'auto', padding: '0.1rem 0.4rem', fontSize: '0.75rem' }}
          >
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
          <button 
            type="button" 
            className="btn-sm" 
            onClick={() => onClearCookie(username, type)}
            style={{ padding: '0.1rem 0.4rem', fontSize: '0.75rem', borderColor: '#ff4f4f', color: '#ff4f4f' }}
          >
            Clear
          </button>
        </div>
      ) : (
        <div className="sync-input-row">
          <input 
            type="password" 
            value={cookieInput}
            onChange={(e) => setCookieInput(e.target.value)}
            placeholder="Paste PHPSESSID cookie..."
            className="input-sm"
            style={{ maxWidth: 'none', flexGrow: 1 }}
            disabled={isSyncing}
          />
          <button 
            type="submit" 
            className="btn-sm active" 
            disabled={isSyncing || !cookieInput.trim()}
          >
            {isSyncing ? 'Syncing...' : 'Save & Sync'}
          </button>
        </div>
      )}
      
      {!hasCookie && (
        <div>
          <span className="sync-instructions-link" onClick={() => setShowGuide(!showGuide)}>
            {showGuide ? 'Hide instructions' : 'How to get PHPSESSID cookie?'}
          </span>
          {showGuide && (
            <div className="sync-instructions-collapsible">
              <ol>
                <li>Log in to <a href="https://cses.fi" target="_blank" rel="noreferrer" style={{ color: '#007bff' }}>cses.fi</a>.</li>
                <li>Press <kbd>F12</kbd> (or right click -&gt; Inspect) to open DevTools.</li>
                <li>Go to the <strong>Application</strong> (Chrome) or <strong>Storage</strong> (Firefox) tab.</li>
                <li>Expand <strong>Cookies</strong> -&gt; <code>https://cses.fi</code>.</li>
                <li>Copy the value of the cookie named <strong>PHPSESSID</strong>.</li>
              </ol>
            </div>
          )}
        </div>
      )}
    </form>
  );
}

function SyncHtmlForm({ username, type, onImport }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pasteVal, setPasteVal] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pasteVal.trim()) return;
    onImport(pasteVal, username, type);
    setPasteVal('');
    setIsOpen(false);
  };

  return (
    <div>
      {!isOpen ? (
        <button 
          type="button" 
          className="btn-sm" 
          onClick={() => setIsOpen(true)}
          style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          📋 Paste HTML / Text Code
        </button>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <textarea 
            className="textarea-field" 
            style={{ width: '100%', background: '#111', color: '#fff', border: '1px solid #444', borderRadius: '4px', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
            rows={3}
            placeholder="Go to cses.fi/problemset/, Ctrl+A then Ctrl+C, and paste the content here..."
            value={pasteVal}
            onChange={(e) => setPasteVal(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              type="submit" 
              className="btn-sm active" 
              style={{ flexGrow: 1 }}
              disabled={!pasteVal.trim()}
            >
              Parse & Import
            </button>
            <button 
              type="button" 
              className="btn-sm" 
              onClick={() => { setIsOpen(false); setPasteVal(''); }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
