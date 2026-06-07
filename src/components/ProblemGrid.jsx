import React, { useState, useMemo } from 'react';

export default function ProblemGrid({ 
  problemsData, 
  solvedIds, 
  rivalSolvedIds, 
  onToggleSolvedManual, 
  showDifficulty, 
  hideSolved,
  selectedFriend,
  viewMode
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, solved, unsolved
  const [selectedColors, setSelectedColors] = useState([]); // difficulty color filters
  const [sortOption, setSortOption] = useState('rating-asc'); // for List view only

  const difficultyColors = ['gray', 'brown', 'green', 'cyan', 'blue', 'yellow', 'orange', 'red'];

  const toggleColorFilter = (color) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  // Helper to determine circle style
  const getCircleStyle = (rating, color) => {
    let min = 0;
    if (color === 'brown') min = 400;
    else if (color === 'green') min = 800;
    else if (color === 'cyan') min = 1200;
    else if (color === 'blue') min = 1600;
    else if (color === 'yellow') min = 2000;
    else if (color === 'orange') min = 2400;
    else if (color === 'red') min = 2800;

    const percent = Math.min(100, Math.max(0, ((rating - min) / 400) * 100));
    
    // Vibrant RGB representation for gradients
    const colorsMap = {
      gray: 'rgb(192, 192, 192)',
      brown: 'rgb(192, 128, 64)',
      green: 'rgb(63, 175, 63)',
      cyan: 'rgb(66, 224, 224)',
      blue: 'rgb(136, 136, 255)',
      yellow: 'rgb(224, 224, 63)',
      orange: 'rgb(255, 153, 51)',
      red: 'rgb(255, 79, 79)'
    };
    
    const colorRgb = colorsMap[color] || 'rgb(192, 192, 192)';
    return {
      borderColor: colorRgb,
      background: `linear-gradient(to top, ${colorRgb} ${percent}%, rgba(0, 0, 0, 0) ${percent}%) border-box border-box`
    };
  };

  // Filter checker
  const matchesFilters = (problem) => {
    // 1. Search Query
    const query = searchQuery.toLowerCase().trim();
    if (query && !problem.name.toLowerCase().includes(query) && !problem.id.includes(query)) {
      return false;
    }

    // 2. Status Filter
    const isUserSolved = solvedIds.includes(problem.id);
    if (statusFilter === 'solved' && !isUserSolved) return false;
    if (statusFilter === 'unsolved' && isUserSolved) return false;

    // 3. Color Filter
    if (selectedColors.length > 0 && !selectedColors.includes(problem.color)) {
      return false;
    }

    return true;
  };

  // Determine background class for a cell
  const getCellBgClass = (problemId) => {
    const userSolved = solvedIds.includes(problemId);
    const rivalSolved = selectedFriend ? rivalSolvedIds.includes(problemId) : false;

    if (selectedFriend) {
      if (userSolved) {
        return 'table-success'; // User solved (takes priority, showing green)
      } else if (rivalSolved) {
        return 'table-danger'; // Rival solved only (showing red)
      }
      return '';
    }
    return userSolved ? 'table-success' : '';
  };

  // 37 is the maximum number of problems in a single category (Mathematics)
  const maxProblemsCount = 37;

  // Render Table View (Kenkoooo style grid)
  const tableView = useMemo(() => {
    return (
      <div className="table-container animated-fade">
        <table className="kenkoooo-table">
          <thead>
            <tr>
              <th>Category</th>
              {Array.from({ length: maxProblemsCount }, (_, idx) => (
                <th key={idx} style={{ width: '160px', textAlign: 'center' }}>{idx + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {problemsData.map(cat => {
              // Get category problems in order
              const problemsList = cat.problems;
              
              return (
                <tr key={cat.category}>
                  {/* First Column: Sticky Category Name */}
                  <td>
                    {cat.category}
                    <div style={{ fontSize: '10px', color: '#666', fontFamily: 'monospace' }}>
                      {problemsList.filter(p => solvedIds.includes(p.id)).length}/{problemsList.length}
                    </div>
                  </td>
                  
                  {/* Problem slots 1 to 37 */}
                  {Array.from({ length: maxProblemsCount }, (_, idx) => {
                    const problem = problemsList[idx];
                    
                    if (!problem) {
                      // Empty cell
                      return <td key={idx} className="table-problem-empty" />;
                    }

                    const isUserSolved = solvedIds.includes(problem.id);
                    const isFiltered = matchesFilters(problem);
                    const bgClass = getCellBgClass(problem.id);

                    if (!isFiltered) {
                      // If problem doesn't match active filters, render as empty cell to keep grid alignment
                      return <td key={idx} className="table-problem-empty" />;
                    }

                    // "Hide Solved" makes solved cells empty while keeping background colors
                    const shouldHideContent = hideSolved && isUserSolved;

                    return (
                      <td 
                        key={problem.id} 
                        className={`table-problem ${bgClass}`}
                        style={{ textAlign: 'left' }}
                        onClick={(e) => {
                          if (e.shiftKey || e.ctrlKey || e.metaKey) {
                            e.preventDefault();
                            onToggleSolvedManual(problem.id);
                          }
                        }}
                      >
                        {!shouldHideContent && (
                          <>
                            <div className="table-problem-content">
                              {/* Difficulty Circle */}
                              {showDifficulty && (
                                <span 
                                  className="topcoder-like-circle difficulty-circle"
                                  style={getCircleStyle(problem.rating, problem.color)}
                                  title={`Rating: ${problem.rating} (${problem.color_name})`}
                                />
                              )}
                              
                              {/* Problem Link */}
                              <a 
                                href={`https://cses.fi/problemset/task/${problem.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`table-problem-link difficulty-${problem.color}`}
                                title={problem.name}
                              >
                                {problem.name}
                              </a>
                            </div>
                            
                            {/* Difficulty Rating inside cell */}
                            {showDifficulty && (
                              <div className="table-problem-point">
                                {problem.rating}
                              </div>
                            )}

                            {/* Hover Tooltip Box */}
                            <div className="tooltip-box">
                              <div className="tooltip-text-row" style={{ fontWeight: 'bold' }}>{problem.name}</div>
                              <div className="tooltip-text-row">ID: {problem.id}</div>
                              <div className="tooltip-text-row">Rating: <span className={`difficulty-${problem.color}`} style={{ fontWeight: 'bold' }}>{problem.rating}</span></div>
                              <div className="tooltip-text-row">Solvers: {problem.solved_count.toLocaleString()}</div>
                              <div className="tooltip-text-row">Success: {(problem.solve_rate * 100).toFixed(1)}%</div>
                              <div className="tooltip-text-row" style={{ borderTop: '1px solid #333', paddingTop: '4px', marginTop: '4px', fontSize: '9px', color: '#888' }}>
                                Shift+Click to Toggle Solved
                              </div>
                            </div>
                          </>
                        )}
                        {shouldHideContent && (
                          <div style={{ width: '100%', height: '100%' }} title={`Solved: ${problem.name} (${problem.rating})`}>
                            {/* Tooltip even when hidden */}
                            <div className="tooltip-box">
                              <div className="tooltip-text-row" style={{ fontWeight: 'bold' }}>{problem.name} (Solved)</div>
                              <div className="tooltip-text-row">ID: {problem.id}</div>
                              <div className="tooltip-text-row">Rating: {problem.rating}</div>
                              <div className="tooltip-text-row" style={{ borderTop: '1px solid #333', paddingTop: '4px', marginTop: '4px', fontSize: '9px', color: '#888' }}>
                                Shift+Click to Toggle Solved
                              </div>
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }, [problemsData, solvedIds, rivalSolvedIds, selectedFriend, showDifficulty, hideSolved, searchQuery, statusFilter, selectedColors]);

  // Flatten and sort for List view
  const sortedList = useMemo(() => {
    const list = [];
    problemsData.forEach(cat => {
      cat.problems.forEach(p => {
        if (matchesFilters(p)) {
          list.push({ ...p, categoryName: cat.category });
        }
      });
    });

    return list.sort((a, b) => {
      if (sortOption === 'rating-asc') return a.rating - b.rating;
      if (sortOption === 'rating-desc') return b.rating - a.rating;
      if (sortOption === 'solved-desc') return b.solved_count - a.solved_count;
      if (sortOption === 'rate-desc') return b.solve_rate - a.solve_rate;
      return 0;
    });
  }, [problemsData, searchQuery, statusFilter, selectedColors, sortOption]);

  // Render List View
  const listView = useMemo(() => {
    return (
      <div className="list-table-container animated-fade">
        <table className="list-table">
          <thead>
            <tr>
              <th style={{ width: '70px' }}>Status</th>
              <th style={{ width: '80px' }}>ID</th>
              <th>Problem Name</th>
              <th>Category</th>
              <th style={{ width: '100px' }}>Difficulty</th>
              <th style={{ width: '120px' }}>Solve Count</th>
              <th style={{ width: '120px' }}>Success Rate</th>
            </tr>
          </thead>
          <tbody>
            {sortedList.map(problem => {
              const bgClass = getCellBgClass(problem.id);
              const isUserSolved = solvedIds.includes(problem.id);
              
              return (
                <tr key={problem.id} className={bgClass}>
                  <td>
                    <button 
                      className="btn-sm"
                      style={{ padding: '0.1rem 0.4rem', fontSize: '11px', background: '#333' }}
                      onClick={() => onToggleSolvedManual(problem.id)}
                    >
                      {isUserSolved ? '✓' : '○'}
                    </button>
                  </td>
                  <td style={{ fontFamily: 'monospace' }}>{problem.id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {showDifficulty && (
                        <span 
                          className="topcoder-like-circle difficulty-circle"
                          style={getCircleStyle(problem.rating, problem.color)}
                        />
                      )}
                      <a 
                        href={`https://cses.fi/problemset/task/${problem.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`table-problem-link difficulty-${problem.color}`}
                        style={{ fontWeight: '500' }}
                      >
                        {problem.name}
                      </a>
                    </div>
                  </td>
                  <td style={{ color: '#aaa' }}>{problem.categoryName}</td>
                  <td>
                    <span className={`diff-badge badge-${problem.color}`} style={{ padding: '0.1rem 0.3rem', borderRadius: '3px', fontSize: '11px' }}>
                      {problem.rating}
                    </span>
                  </td>
                  <td style={{ color: '#aaa' }}>{problem.solved_count.toLocaleString()}</td>
                  <td style={{ color: '#aaa' }}>{(problem.solve_rate * 100).toFixed(1)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {sortedList.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
            No problems found matching active filters.
          </div>
        )}
      </div>
    );
  }, [sortedList, solvedIds, rivalSolvedIds, selectedFriend, showDifficulty]);

  return (
    <div className="problems-grid-section">
      {/* Search Toolbar & Filter Options */}
      <div className="control-panel mb-4" style={{ padding: '0.5rem 1rem', display: 'flex', flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between' }}>
        
        {/* Search & Status Filters */}
        <div className="control-group">
          <input 
            type="text" 
            placeholder="Search problems..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-sm search-input-box"
          />
          
          <button 
            className={`btn-sm ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All
          </button>
          <button 
            className={`btn-sm ${statusFilter === 'unsolved' ? 'active' : ''}`}
            onClick={() => setStatusFilter('unsolved')}
          >
            Unsolved
          </button>
          <button 
            className={`btn-sm ${statusFilter === 'solved' ? 'active' : ''}`}
            onClick={() => setStatusFilter('solved')}
          >
            Solved
          </button>
        </div>

        {/* Sorting for List view */}
        {viewMode === 'list' && (
          <div className="control-group">
            <span className="control-label">Sort:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="input-sm"
              style={{ minWidth: '150px' }}
            >
              <option value="rating-asc">Difficulty (Low to High)</option>
              <option value="rating-desc">Difficulty (High to Low)</option>
              <option value="solved-desc">Solved Count</option>
              <option value="rate-desc">Success Rate</option>
            </select>
          </div>
        )}

        {/* Difficulty Color Buttons */}
        <div className="control-group">
          <span className="control-label">Filter:</span>
          <div className="color-buttons">
            {difficultyColors.map(color => (
              <button
                key={color}
                onClick={() => toggleColorFilter(color)}
                className={`color-toggle-btn bg-dot-${color} ${selectedColors.includes(color) ? 'active' : ''}`}
                style={{ width: '16px', height: '16px' }}
                title={`Filter ${color}`}
              />
            ))}
          </div>
          {selectedColors.length > 0 && (
            <button 
              className="btn-clear text-xs" 
              onClick={() => setSelectedColors([])}
              style={{ color: '#ff4f4f', border: 'none', background: 'none', cursor: 'pointer' }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div style={{ fontSize: '11px', color: '#666', marginBottom: '0.75rem' }}>
        💡 <strong>Pro Tip:</strong> Hold <strong>Shift</strong> or <strong>Ctrl</strong> and click on a cell to manually toggle its solved state.
      </div>

      {/* Renders Grid Table or List */}
      {viewMode === 'category' ? tableView : listView}
    </div>
  );
}
