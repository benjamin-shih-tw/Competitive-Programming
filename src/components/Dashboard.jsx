import React, { useState } from 'react';
import { parseCSESHtml } from '../utils/parser';

export default function Dashboard({ 
  problemsData, 
  solvedIds, 
  rivalSolvedIds,
  userId,
  rivalId,
  onUpdateSolved,
  onClearSolved
}) {
  const [pasteOpen, setPasteOpen] = useState(false);
  const [rivalPasteOpen, setRivalPasteOpen] = useState(false);
  const [pastedHtml, setPastedHtml] = useState('');
  const [rivalPastedHtml, setRivalPastedHtml] = useState('');

  // Total problems
  const totalProblems = problemsData.reduce((acc, cat) => acc + cat.problems.length, 0);

  // Compute profile stats
  const getStats = (ids) => {
    const solved = ids.length;
    const percentage = totalProblems > 0 ? ((solved / totalProblems) * 100).toFixed(1) : 0;
    return { solved, percentage };
  };

  const userStats = getStats(solvedIds);
  const rivalStats = getStats(rivalSolvedIds);

  // Category stats helper
  const getCategoryStats = (ids) => {
    return problemsData.map(cat => {
      const total = cat.problems.length;
      const solved = cat.problems.filter(p => ids.includes(p.id)).length;
      return {
        name: cat.category,
        total,
        solved,
        percentage: total > 0 ? (solved / total) * 100 : 0
      };
    });
  };

  const userCategoryStats = getCategoryStats(solvedIds);

  // Difficulty color stats helper
  const colorBands = ['gray', 'brown', 'green', 'cyan', 'blue', 'yellow', 'orange', 'red'];
  const colorNames = {
    gray: 'Gray (< 400)',
    brown: 'Brown (400 - 799)',
    green: 'Green (800 - 1199)',
    cyan: 'Cyan (1200 - 1599)',
    blue: 'Blue (1600 - 1999)',
    yellow: 'Yellow (2000 - 2399)',
    orange: 'Orange (2400 - 2799)',
    red: 'Red (>= 2800)'
  };

  const getDifficultyStats = (ids) => {
    return colorBands.map(color => {
      let total = 0;
      let solved = 0;
      problemsData.forEach(cat => {
        cat.problems.forEach(p => {
          if (p.color === color) {
            total++;
            if (ids.includes(p.id)) {
              solved++;
            }
          }
        });
      });
      return {
        color,
        name: colorNames[color],
        total,
        solved,
        percentage: total > 0 ? (solved / total) * 100 : 0
      };
    });
  };

  const userDifficultyStats = getDifficultyStats(solvedIds);

  // Parse HTML submissions paste
  const handleImport = (text, targetUser) => {
    const ids = parseCSESHtml(text);
    if (ids.length > 0) {
      onUpdateSolved(ids, targetUser);
      if (targetUser === userId) {
        setPastedHtml('');
        setPasteOpen(false);
      } else {
        setRivalPastedHtml('');
        setRivalPasteOpen(false);
      }
      alert(`Successfully imported ${ids.length} solved problems for ${targetUser}!`);
    } else {
      alert("No solved problems detected. Make sure you copy/paste the entire CSES problem set page (Ctrl+A then Ctrl+C) while logged in.");
    }
  };

  return (
    <div className="stats-tab-container animated-fade">
      {/* User profile card */}
      <div className="stats-panel">
        <div className="stats-panel-title">
          <span>User: {userId}</span>
        </div>
        <div className="stats-avatar-row">
          <div className="stats-avatar" style={{ background: '#213100', color: '#3faf3f' }}>
            {userId.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{userId}</p>
            <p style={{ fontSize: '0.85rem', color: '#aaa' }}>
              Solved: <strong>{userStats.solved}</strong> / {totalProblems} ({userStats.percentage}%)
            </p>
          </div>
        </div>

        <div className="stat-progress-track mb-4">
          <div className="stat-progress-fill fill-green" style={{ width: `${userStats.percentage}%` }}></div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-sm" onClick={() => setPasteOpen(!pasteOpen)}>
            {pasteOpen ? 'Close Import' : 'Import CSES HTML'}
          </button>
          <button className="btn-sm" style={{ borderColor: '#ff4f4f', color: '#ff4f4f' }} onClick={() => onClearSolved(userId)}>
            Clear Data
          </button>
        </div>

        {pasteOpen && (
          <div className="paste-area-box mt-4 animated-slide-down">
            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>Paste {userId}'s CSES Problemset HTML</h4>
            <p className="instruction-text">
              Go to <a href="https://cses.fi/problemset/" target="_blank" rel="noreferrer">cses.fi/problemset/</a> (logged in), press <strong>Ctrl+A</strong> then <strong>Ctrl+C</strong>, and paste the code/text below:
              <br />
              <span style={{ color: '#aaa', fontSize: '0.75rem', display: 'block', marginTop: '4px' }}>
                💡 Tip: Set up automatic background updates using the <strong>Sync Settings</strong> button in the top navigation bar.
              </span>
            </p>
            <textarea
              className="textarea-field"
              value={pastedHtml}
              onChange={(e) => setPastedHtml(e.target.value)}
              rows={4}
              placeholder="Paste HTML here..."
            />
            <button className="btn-sm mt-4 active" onClick={() => handleImport(pastedHtml, userId)}>
              Parse & Import
            </button>
          </div>
        )}
      </div>

      {/* Rival profile card */}
      <div className="stats-panel">
        <div className="stats-panel-title">
          <span>Rival: {rivalId || 'None'}</span>
        </div>
        
        {rivalId ? (
          <>
            <div className="stats-avatar-row">
              <div className="stats-avatar" style={{ background: '#4f0000', color: '#ff4f4f' }}>
                {rivalId.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{rivalId}</p>
                <p style={{ fontSize: '0.85rem', color: '#aaa' }}>
                  Solved: <strong>{rivalStats.solved}</strong> / {totalProblems} ({rivalStats.percentage}%)
                </p>
              </div>
            </div>

            <div className="stat-progress-track mb-4">
              <div className="stat-progress-fill fill-red" style={{ width: `${rivalStats.percentage}%` }}></div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-sm" onClick={() => setRivalPasteOpen(!rivalPasteOpen)}>
                {rivalPasteOpen ? 'Close Import' : 'Import Rival HTML'}
              </button>
              <button className="btn-sm" style={{ borderColor: '#ff4f4f', color: '#ff4f4f' }} onClick={() => onClearSolved(rivalId)}>
                Clear Data
              </button>
            </div>

            {rivalPasteOpen && (
              <div className="paste-area-box mt-4 animated-slide-down">
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>Paste {rivalId}'s CSES Problemset HTML</h4>
                <p className="instruction-text">
                  Go to <a href="https://cses.fi/problemset/" target="_blank" rel="noreferrer">cses.fi/problemset/</a> logged in as {rivalId}, copy and paste below:
                  <br />
                  <span style={{ color: '#aaa', fontSize: '0.75rem', display: 'block', marginTop: '4px' }}>
                    💡 Tip: Set up automatic background updates using the <strong>Sync Settings</strong> button in the top navigation bar.
                  </span>
                </p>
                <textarea
                  className="textarea-field"
                  value={rivalPastedHtml}
                  onChange={(e) => setRivalPastedHtml(e.target.value)}
                  rows={4}
                  placeholder="Paste Rival HTML here..."
                />
                <button className="btn-sm mt-4 active" onClick={() => handleImport(rivalPastedHtml, rivalId)}>
                  Parse & Import
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '80%', alignItems: 'center', color: '#888' }}>
            <p>No Rival selected.</p>
            <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>Enter a Rival ID in the top bar to compare progress!</p>
          </div>
        )}
      </div>

      {/* Difficulty stats breakdown */}
      <div className="stats-panel">
        <div className="stats-panel-title">Difficulty Breakdown ({userId})</div>
        <div>
          {userDifficultyStats.map(stat => (
            <div key={stat.color} className="stat-row">
              <div className="stat-row-meta">
                <span>
                  <span className={`diff-dot color-${stat.color}`} style={{ marginRight: '6px' }}></span>
                  {stat.name}
                </span>
                <span>
                  <strong>{stat.solved}</strong> / {stat.total} ({stat.percentage.toFixed(0)}%)
                </span>
              </div>
              <div className="stat-progress-track">
                <div className={`stat-progress-fill fill-${stat.color}`} style={{ width: `${stat.percentage}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category stats breakdown */}
      <div className="stats-panel">
        <div className="stats-panel-title">Category Progress ({userId})</div>
        <div style={{ maxHeight: '380px', overflowY: 'auto', paddingRight: '0.5rem' }}>
          {userCategoryStats.map(cat => (
            <div key={cat.name} className="stat-row">
              <div className="stat-row-meta">
                <span style={{ fontWeight: '500' }}>{cat.name}</span>
                <span>
                  <strong>{cat.solved}</strong> / {cat.total} ({cat.percentage.toFixed(0)}%)
                </span>
              </div>
              <div className="stat-progress-track">
                <div className="stat-progress-fill" style={{ width: `${cat.percentage}%`, background: '#007bff' }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
