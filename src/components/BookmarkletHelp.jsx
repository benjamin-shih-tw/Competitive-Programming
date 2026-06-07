import React, { useMemo, useState } from 'react';
import { generateBookmarkletCode } from '../utils/parser';

export default function BookmarkletHelp({ userId, rivalId, onSyncSolved }) {
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const [cookieValue, setCookieValue] = useState('');
  const [syncTarget, setSyncTarget] = useState('user'); // user, rival
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const appUrl = useMemo(() => {
    return window.location.origin + window.location.pathname;
  }, []);

  const bookmarkletCode = useMemo(() => {
    return generateBookmarkletCode(appUrl);
  }, [appUrl]);

  // Handle local proxy sync using cookie
  const handleCookieSync = async (e) => {
    e.preventDefault();
    const cleanCookie = cookieValue.trim();
    if (!cleanCookie) {
      setErrorMsg('Please enter a valid PHPSESSID cookie value.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const targetUser = syncTarget === 'user' ? userId : rivalId;

    if (!targetUser || targetUser === 'Anonymous') {
      if (syncTarget === 'rival') {
        setErrorMsg('Please set a Rival ID in the top bar before syncing.');
        setIsLoading(false);
        return;
      }
    }

    try {
      const response = await fetch(`/api/cses-sync?cookie=${encodeURIComponent(cleanCookie)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed with status ${response.status}`);
      }

      const count = data.solvedIds.length;
      localStorage.setItem(`cses_cookie_${targetUser}`, cleanCookie);
      onSyncSolved(data.solvedIds, targetUser);
      setSuccessMsg(`Success! Imported ${count} solved problems for ${targetUser}.`);
      setCookieValue(''); // clear after success
    } catch (err) {
      setErrorMsg(err.message || 'Failed to sync solved problems. Please double check your cookie.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="sync-tab-container animated-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px' }}>
      
      {/* Method 1: Automatic sync via CSES Cookie */}
      {isLocalhost && (
        <div className="stats-panel" style={{ padding: '1.5rem' }}>
          <h3 className="stats-panel-title">🔌 Method 1: Query Solved Status via Session Cookie</h3>
          <p style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '1rem' }}>
            Fetch solved status automatically from CSES using your local browser session cookie. Safe and completely local (never transmitted to third parties).
          </p>

          <form onSubmit={handleCookieSync} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#aaa' }}>Sync Target:</span>
              <label className="checkbox-label" style={{ fontSize: '0.85rem' }}>
                <input 
                  type="radio" 
                  name="sync-target" 
                  checked={syncTarget === 'user'} 
                  onChange={() => setSyncTarget('user')} 
                />
                User ID ({userId})
              </label>
              <label className="checkbox-label" style={{ fontSize: '0.85rem' }}>
                <input 
                  type="radio" 
                  name="sync-target" 
                  checked={syncTarget === 'rival'} 
                  onChange={() => setSyncTarget('rival')} 
                  disabled={!rivalId}
                />
                Rival ID ({rivalId || 'None set'})
              </label>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                placeholder="Paste PHPSESSID cookie here (e.g. ab12cd34ef56...)" 
                value={cookieValue}
                onChange={(e) => setCookieValue(e.target.value)}
                className="input-sm"
                style={{ flexGrow: 1, maxWidth: '100%' }}
                disabled={isLoading}
              />
              <button 
                type="submit" 
                className="btn-sm active" 
                style={{ padding: '0.35rem 1rem' }}
                disabled={isLoading}
              >
                {isLoading ? 'Syncing...' : 'Fetch & Sync'}
              </button>
            </div>
          </form>

          {errorMsg && (
            <div style={{ color: '#ff4f4f', fontSize: '0.85rem', marginTop: '0.75rem', padding: '0.5rem', background: 'rgba(255, 79, 79, 0.1)', borderRadius: '4px', border: '1px solid rgba(255, 79, 79, 0.2)' }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {successMsg && (
            <div style={{ color: '#3faf3f', fontSize: '0.85rem', marginTop: '0.75rem', padding: '0.5rem', background: 'rgba(63, 175, 63, 0.1)', borderRadius: '4px', border: '1px solid rgba(63, 175, 63, 0.2)' }}>
              ✓ {successMsg}
            </div>
          )}

          <div style={{ marginTop: '1.25rem', borderTop: '1px solid #282828', paddingTop: '1rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>How to get your PHPSESSID cookie:</h4>
            <ol className="sync-list" style={{ fontSize: '0.8rem', color: '#888' }}>
              <li>Go to <a href="https://cses.fi" target="_blank" rel="noopener noreferrer">cses.fi</a> and make sure you are logged in.</li>
              <li>Right-click anywhere on the page and select <strong>Inspect</strong> (or press <kbd>F12</kbd>) to open Developer Tools.</li>
              <li>Go to the <strong>Application</strong> tab (Chrome/Edge) or <strong>Storage</strong> tab (Firefox).</li>
              <li>In the left sidebar, expand <strong>Cookies</strong> and click on <code>https://cses.fi</code>.</li>
              <li>Find the cookie named <strong><code>PHPSESSID</code></strong> and double-click its <strong>Value</strong> to copy it. Paste it in the input box above.</li>
            </ol>
          </div>
        </div>
      )}

      {/* Method 2: Browser Bookmarklet */}
      <div className="stats-panel" style={{ padding: '1.5rem' }}>
        <h3 className="stats-panel-title">
          🚀 {isLocalhost ? 'Method 2: 1-Click Sync (CSES Bookmarklet)' : '1-Click Sync (CSES Bookmarklet)'}
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '1rem' }}>
          An alternative 1-click browser bookmarklet to sync without copy-pasting cookies.
        </p>

        <div className="sync-bookmarklet-box">
          <a 
            href={bookmarkletCode} 
            className="bookmarklet-btn"
            onClick={(e) => e.preventDefault()}
            title="Drag me to your Bookmarks Bar!"
          >
            ⭐ CSES Sync
          </a>
          <span style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.75rem' }}>
            ← Drag this button to your browser's Bookmarks Bar
          </span>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>How to use:</h4>
          <ol className="sync-list" style={{ fontSize: '0.8rem', color: '#888' }}>
            <li>Drag the <strong>⭐ CSES Sync</strong> button above to your browser's bookmarks bar.</li>
            <li>Go to the CSES Problemset page: <a href="https://cses.fi/problemset/" target="_blank" rel="noopener noreferrer">cses.fi/problemset/</a> (Make sure you are logged in).</li>
            <li>Click the <strong>CSES Sync</strong> bookmark in your bookmarks bar.</li>
            <li>You will be redirected back here, and all solved problems will import instantly!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
