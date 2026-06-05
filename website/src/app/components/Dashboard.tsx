'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Code2, Database, HelpCircle, CheckCircle, Clock, BookOpen, Check, RefreshCw } from 'lucide-react';
import { CppFileInfo } from '../../lib/cppFiles';
import { NotionSolution } from '../../lib/notion';

interface DashboardProps {
  cppFiles: CppFileInfo[];
  notionSolutions: NotionSolution[];
  isNotionConfigured: boolean;
}

// Official CSES category ordering
const CSES_CATEGORIES_ORDER = [
  'Introductory Problems',
  'Sorting and Searching',
  'Dynamic Programming',
  'Graph Algorithms',
  'Range Queries',
  'Tree Algorithms',
  'Mathematics',
  'Additional Problems',
];

export default function Dashboard({ cppFiles, notionSolutions, isNotionConfigured }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [showCsesSync, setShowCsesSync] = useState(false);
  const [csesCookie, setCsesCookie] = useState('');
  const [csesLoading, setCsesLoading] = useState(false);
  const [csesError, setCsesError] = useState('');
  const [csesStatus, setCsesStatus] = useState<any>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [isLocal, setIsLocal] = useState(true);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const local = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      setIsLocal(local);
    }
  }, []);

  const handleCheckCses = async () => {
    setCsesLoading(true);
    setCsesError('');
    setCsesStatus(null);
    setSyncResult(null);
    try {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
      const res = await fetch(`${basePath}/api/cses-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'GET_STATUS', cookie: csesCookie }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '無法取得 CSES 狀態');
      }
      setCsesStatus(data);
    } catch (err: any) {
      setCsesError(err.message || '連線錯誤，請確認網路與 PHPSESSID 是否正確。');
    } finally {
      setCsesLoading(false);
    }
  };

  const handleSyncDownload = async () => {
    setSyncing(true);
    setCsesError('');
    setSyncResult(null);
    try {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
      const res = await fetch(`${basePath}/api/cses-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SYNC_DOWNLOAD', cookie: csesCookie }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '同步下載失敗');
      }
      setSyncResult(data);
      if (csesStatus) {
        setCsesStatus({
          ...csesStatus,
          missingCount: 0,
          solvedTasks: csesStatus.solvedTasks.map((t: any) => ({ ...t, onGithub: true })),
        });
      }
      // Force reload page to see new files after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (err: any) {
      setCsesError(err.message || '同步時發生錯誤。');
    } finally {
      setSyncing(false);
    }
  };


  // Merge C++ files and Notion data
  const problems = useMemo(() => {
    const notionMap = new Map<string, NotionSolution>();
    notionSolutions.forEach((sol) => {
      notionMap.set(sol.filename, sol);
    });

    return cppFiles.map((file) => {
      const notionSol = notionMap.get(file.filename);
      const hasExplanation = !!notionSol && !notionSol.isMock;
      
      return {
        filename: file.filename,
        displayName: notionSol?.title || file.displayName,
        category: notionSol?.category || file.category,
        difficulty: notionSol?.difficulty || (file.filename.includes('Query') || file.filename.includes('Trip') || file.filename.includes('Tree') ? 'Medium' : 'Easy'),
        hasExplanation,
        csesLink: notionSol?.csesLink || file.problemUrl,
      };
    });
  }, [cppFiles, notionSolutions]);

  // Statistics
  const stats = useMemo(() => {
    const total = problems.length;
    const withExplanation = problems.filter((p) => p.hasExplanation).length;
    const pendingExplanation = total - withExplanation;
    
    return {
      total,
      withExplanation,
      pendingExplanation,
    };
  }, [problems]);

  // Filter problems
  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      const matchesSearch = 
        p.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.filename.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      
      const matchesStatus = 
        selectedStatus === 'All' ||
        (selectedStatus === 'completed' && p.hasExplanation) ||
        (selectedStatus === 'pending' && !p.hasExplanation);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [problems, searchQuery, selectedCategory, selectedStatus]);

  // Group filtered problems by category
  const groupedProblems = useMemo(() => {
    const groups: Record<string, typeof filteredProblems> = {};
    
    // Initialize groups with official ordering if category matches search/filter
    CSES_CATEGORIES_ORDER.forEach(cat => {
      groups[cat] = [];
    });

    filteredProblems.forEach(p => {
      const cat = p.category || 'General';
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(p);
    });

    // Remove empty categories
    return Object.fromEntries(
      Object.entries(groups).filter(([_, items]) => items.length > 0)
    );
  }, [filteredProblems]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '2rem 0' }}>
      
      {/* Header section */}
      <header style={styles.header}>
        <div style={styles.headerTitleContainer}>
          <div style={styles.badgeContainer}>
            <span style={styles.tag}>CSES Solutions Portal</span>
            {isNotionConfigured ? (
              <span style={{ ...styles.statusTag, ...styles.statusConnected }}>
                <CheckCircle size={12} /> Notion 連結正常
              </span>
            ) : (
              <span style={{ ...styles.statusTag, ...styles.statusMock }} onClick={() => setShowSetupGuide(true)}>
                <Database size={12} /> 預覽模式 (點擊設定)
              </span>
            )}
          </div>
          <h1 style={styles.mainTitle}>
            CSES <span className="gradient-text">競賽題解清單</span>
          </h1>
          <p style={styles.subtitle}>
            自動同步 GitHub 中的 C++ 程式碼與 Notion 中的精美題解。
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => {
              setShowCsesSync(!showCsesSync);
              if (showSetupGuide) setShowSetupGuide(false);
            }}
            style={{
              ...styles.guideButton,
              borderColor: showCsesSync ? 'var(--primary-accent)' : 'var(--border-color)',
              color: showCsesSync ? '#d8b4fe' : 'var(--text-primary)',
            }}
            className="glass-panel"
          >
            <RefreshCw size={18} className={csesLoading || syncing ? 'animate-spin' : ''} />
            {showCsesSync ? '隱藏同步區' : 'CSES 狀態同步'}
          </button>
          
          <button 
            onClick={() => {
              setShowSetupGuide(!showSetupGuide);
              if (showCsesSync) setShowCsesSync(false);
            }}
            style={{
              ...styles.guideButton,
              borderColor: showSetupGuide ? 'var(--primary-accent)' : 'var(--border-color)',
              color: showSetupGuide ? '#d8b4fe' : 'var(--text-primary)',
            }}
            className="glass-panel"
          >
            <HelpCircle size={18} />
            {showSetupGuide ? '隱藏設定說明' : 'Notion 連線設定'}
          </button>
        </div>
      </header>


      {/* CSES Sync Drawer */}
      {showCsesSync && (
        <section style={styles.setupPanel} className="glass-panel">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🔄 CSES 帳號狀態與程式碼同步
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            輸入您在瀏覽器中登入 CSES 後的 <code>PHPSESSID</code> Cookie，即可自動檢查哪些題目在 CSES 已通過（AC），但尚未放入本機與 GitHub 專案目錄中，並可一鍵自動下載！
          </p>
          
          {!isLocal && (
            <div style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              color: '#f59e0b',
              fontSize: '0.85rem',
              lineHeight: '1.4',
              marginBottom: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem'
            }}>
              <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                ⚠️ 靜態公開網頁限制 (Static Deployment Limit)
              </span>
              <span>
                此公開網站目前以 <strong>靜態 HTML</strong> 託管於 GitHub Pages，因此「一鍵下載與自動推送 API」在線上不可用。
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                💡 <strong>解決方案：</strong>請於本機執行 <code>python3 sync_cses.py --cookie &lt;您的PHPSESSID&gt;</code> 進行代碼同步與推送，或在本地運行開發伺服器（<code>npm run dev</code>）使用此同步按鈕。
              </span>
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
            <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>CSES PHPSESSID Cookie 值</label>
              <input 
                type="password" 
                placeholder="貼上您的 PHPSESSID Cookie..." 
                value={csesCookie}
                onChange={(e) => setCsesCookie(e.target.value)}
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '0.6rem 0.8rem',
                  color: '#fff',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  width: '100%',
                  outline: 'none',
                }}
              />
            </div>
            <button 
              onClick={handleCheckCses}
              disabled={csesLoading || !csesCookie}
              style={{
                background: 'var(--primary-accent)',
                color: '#fff',
                border: 'none',
                padding: '0.65rem 1.5rem',
                borderRadius: '8px',
                cursor: !csesCookie || csesLoading ? 'not-allowed' : 'pointer',
                opacity: !csesCookie || csesLoading ? 0.6 : 1,
                fontWeight: 600,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                height: '38px',
              }}
            >
              {csesLoading ? '檢查中...' : '檢查未同步題目'}
            </button>
          </div>

          {csesError && (
            <div style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              ⚠️ 錯誤：{csesError}
            </div>
          )}

          {csesStatus && (
            <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ color: '#34d399', fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem' }}>
                    👤 已偵測到使用者帳號：{csesStatus.username}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    CSES 已通過：<strong style={{ color: '#fff' }}>{csesStatus.solvedCount}</strong> 題 ｜ GitHub/本地現有：<strong style={{ color: '#fff' }}>{csesStatus.githubCount}</strong> 題
                  </div>
                </div>
                
                {csesStatus.missingCount > 0 && (
                  <button
                    onClick={handleSyncDownload}
                    disabled={syncing}
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#fff',
                      border: 'none',
                      padding: '0.65rem 1.5rem',
                      borderRadius: '8px',
                      cursor: syncing ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    {syncing ? '同步下載中...' : `一鍵下載 ${csesStatus.missingCount} 題原始碼`}
                  </button>
                )}
              </div>

              {csesStatus.missingCount > 0 ? (
                <div>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#fbbf24', fontWeight: 600 }}>
                    以下 {csesStatus.missingCount} 個題目尚未下載：
                  </h4>
                  <div style={{ maxHeight: '180px', overflowY: 'auto', background: 'rgba(0,0,0,0.25)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {csesStatus.solvedTasks.filter((t: any) => !t.onGithub).map((task: any) => (
                        <li key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '0.25rem' }}>
                          <span>📝 {task.title} <span style={{ color: 'var(--text-muted)' }}>(ID: {task.id})</span></span>
                          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--secondary-accent)' }}>{task.filename}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div style={{ color: '#34d399', fontSize: '0.95rem', fontWeight: 600, background: 'rgba(16, 185, 129, 0.08)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                  🎉 太棒了！您在 CSES 上通過的所有題目都已經存在於您的專案中！
                </div>
              )}
            </div>
          )}

          {syncResult && (
            <div style={{ marginTop: '1.25rem', background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <h4 style={{ color: '#34d399', fontSize: '0.95rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                ✅ 同步成功！成功下載了 {syncResult.successCount} 題程式碼！
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                新檔案已寫入本機。網頁將在 3 秒後自動重新載入更新清單。
              </p>
            </div>
          )}

          <div style={{ marginTop: '1.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
            💡 <strong>如何獲取 Cookie：</strong> 登入 cses.fi ➡️ 按 F12 ➡️ 應用程式(Application)/儲存空間(Storage) ➡️ Cookies ➡️ 點擊 cses.fi ➡️ 複製 <code>PHPSESSID</code> 的 Value。
          </div>
        </section>
      )}

      {/* Notion Setup Guide Drawer */}
      {showSetupGuide && (
        <section style={styles.setupPanel} className="glass-panel">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#f8fafc' }}>⚙️ 如何連接您的 Notion 資料庫</h2>

          <div style={styles.guideGrid}>
            <div style={styles.guideStep}>
              <div style={styles.stepNum}>1</div>
              <div>
                <h4 style={styles.stepTitle}>建立 Notion Integration</h4>
                <p style={styles.stepText}>
                  前往 <a href="https://www.notion.so/my-integrations" target="_blank" rel="noreferrer" style={styles.link}>notion.so/my-integrations</a> 建立整合，複製 <strong>Internal Integration Token</strong>。
                </p>
              </div>
            </div>
            <div style={styles.guideStep}>
              <div style={styles.stepNum}>2</div>
              <div>
                <h4 style={styles.stepTitle}>建立資料庫與欄位</h4>
                <p style={styles.stepText}>
                  Notion 資料庫必備屬性：
                  <br />• <strong>Name</strong> (標題): 題目名稱
                  <br />• <strong>Filename</strong> (純文字): 檔名如 <code>Weird.cpp</code> (需與 Repo 一致)
                  <br />• <strong>Category</strong> (單選/多選): 題目分類 (e.g. <code>Graph Algorithms</code>)
                  <br />• <strong>Difficulty</strong> (單選): 難易度 (e.g. <code>Easy</code>, <code>Medium</code>)
                  <br />• <strong>CSESLink</strong> (網址): 原題連結
                </p>
              </div>
            </div>
            <div style={styles.guideStep}>
              <div style={styles.stepNum}>3</div>
              <div>
                <h4 style={styles.stepTitle}>配置環境變數</h4>
                <p style={styles.stepText}>
                  將資料庫分享給 Integration。並於專案 <code>website/.env.local</code> 中配置：
                  <code style={styles.envCode}>
                    NOTION_API_KEY=your_token_here<br />
                    NOTION_DATABASE_ID=your_database_id_here
                  </code>
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Quick Stats Grid */}
      <section style={styles.statsGrid}>
        <div style={styles.statCard} className="glass-panel">
          <div style={{ ...styles.statIcon, color: 'var(--secondary-accent)' }}>
            <Code2 size={20} />
          </div>
          <div>
            <div style={styles.statVal}>{stats.total}</div>
            <div style={styles.statLabel}>已解題目 (C++)</div>
          </div>
        </div>
        
        <div style={styles.statCard} className="glass-panel">
          <div style={{ ...styles.statIcon, color: 'var(--success)' }}>
            <CheckCircle size={20} />
          </div>
          <div>
            <div style={styles.statVal}>{stats.withExplanation}</div>
            <div style={styles.statLabel}>Notion 題解已同步</div>
          </div>
        </div>

        <div style={styles.statCard} className="glass-panel">
          <div style={{ ...styles.statIcon, color: 'var(--warning)' }}>
            <Clock size={20} />
          </div>
          <div>
            <div style={styles.statVal}>{stats.pendingExplanation}</div>
            <div style={styles.statLabel}>未寫題解</div>
          </div>
        </div>
      </section>

      {/* Filter and Search controls */}
      <section style={styles.controlsRow}>
        <div style={styles.searchWrapper} className="glass-panel">
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="搜尋題目 (e.g. Weird, Apartments, RoundTrip)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.filtersWrapper}>
          <div style={styles.filterGroup} className="glass-panel">
            <button 
              onClick={() => setSelectedStatus('All')}
              style={{ ...styles.filterBtn, ...(selectedStatus === 'All' ? styles.filterBtnActive : {}) }}
            >
              全部
            </button>
            <button 
              onClick={() => setSelectedStatus('completed')}
              style={{ ...styles.filterBtn, ...(selectedStatus === 'completed' ? styles.filterBtnActive : {}) }}
            >
              已寫題解
            </button>
            <button 
              onClick={() => setSelectedStatus('pending')}
              style={{ ...styles.filterBtn, ...(selectedStatus === 'pending' ? styles.filterBtnActive : {}) }}
            >
              未寫題解
            </button>
          </div>
        </div>
      </section>

      {/* Category Horizontal Filter Buttons */}
      <section style={styles.categoriesRow}>
        <button
          onClick={() => setSelectedCategory('All')}
          style={{ 
            ...styles.catTab, 
            ...(selectedCategory === 'All' ? styles.catTabActive : {}),
          }}
          className="glass-panel"
        >
          顯示全部單元
        </button>
        {CSES_CATEGORIES_ORDER.map((cat) => {
          const count = problems.filter(p => p.category === cat).length;
          if (count === 0) return null; // Don't show filter button if there are no solved problems in it
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{ 
                ...styles.catTab, 
                ...(selectedCategory === cat ? styles.catTabActive : {}),
              }}
              className="glass-panel"
            >
              {cat}
              <span style={styles.catCount}>{count}</span>
            </button>
          );
        })}
      </section>

      {/* Vertical List grouped by Categories (CSES Style) */}
      <section style={styles.listSection}>
        {Object.keys(groupedProblems).length > 0 ? (
          Object.entries(groupedProblems).map(([category, items]) => (
            <div key={category} style={styles.categoryBlock}>
              <h2 style={styles.categoryTitle}>{category}</h2>
              
              <div style={styles.csesTable} className="glass-panel">
                {items.map((problem, idx) => (
                  <div key={problem.filename} style={styles.csesRow}>
                    
                    {/* Left: Document/Page Icon */}
                    <div style={styles.rowIconCell}>
                      <span style={styles.docIcon}>📄</span>
                    </div>

                    {/* Middle: Linked Problem Name & details */}
                    <div style={styles.rowTitleCell}>
                      <Link href={`/problem/${problem.filename}`} style={styles.problemLink}>
                        {problem.displayName}
                      </Link>
                      <span style={styles.rowFilename}>{problem.filename}</span>
                    </div>

                    {/* Middle Right: Difficulty badge */}
                    <div style={styles.rowMetaCell}>
                      <span style={{ 
                        ...styles.difficultyBadge,
                        color: problem.difficulty.toLowerCase() === 'easy' ? '#34d399' : problem.difficulty.toLowerCase() === 'medium' ? '#fbbf24' : '#f87171',
                      }}>
                        {problem.difficulty}
                      </span>
                    </div>

                    {/* Right: Solved Status Checkmark Box */}
                    <div style={styles.rowStatusCell}>
                      {problem.hasExplanation ? (
                        <div style={{ ...styles.checkmarkBox, ...styles.checkmarkSolved }}>
                          <Check size={14} style={{ color: '#fff' }} />
                        </div>
                      ) : (
                        <div style={{ ...styles.checkmarkBox, ...styles.checkmarkCodeOnly }} title="僅有程式碼，待寫 Notion 題解">
                          <Code2 size={12} style={{ color: '#60a5fa' }} />
                        </div>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div style={styles.emptyState} className="glass-panel">
            <BookOpen size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <h3 style={{ marginBottom: '0.5rem' }}>沒有符合篩選條件的題目</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              請嘗試更換搜尋關鍵字或點選其他單元。
            </p>
          </div>
        )}
      </section>
      
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '1.5rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '1.5rem',
  },
  headerTitleContainer: {
    flex: '1 1 500px',
  },
  badgeContainer: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '0.75rem',
    alignItems: 'center',
  },
  tag: {
    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)',
    border: '1px solid rgba(168, 85, 247, 0.3)',
    color: '#d8b4fe',
    fontSize: '0.75rem',
    fontWeight: 600,
    padding: '0.2rem 0.6rem',
    borderRadius: '9999px',
    fontFamily: 'var(--font-display)',
  },
  statusTag: {
    fontSize: '0.75rem',
    fontWeight: 500,
    padding: '0.2rem 0.6rem',
    borderRadius: '9999px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
  },
  statusConnected: {
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    color: '#34d399',
  },
  statusMock: {
    background: 'rgba(245, 158, 11, 0.1)',
    border: '1px solid rgba(245, 158, 11, 0.25)',
    color: '#fbbf24',
    cursor: 'pointer',
  },
  mainTitle: {
    fontSize: '2rem',
    fontWeight: 800,
    lineHeight: 1.2,
    marginBottom: '0.5rem',
    fontFamily: 'var(--font-display)',
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '0.95rem',
  },
  guideButton: {
    background: 'rgba(255, 255, 255, 0.02)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-color)',
    padding: '0.6rem 1rem',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 500,
  },
  setupPanel: {
    padding: '1.5rem',
    background: 'rgba(168, 85, 247, 0.03)',
    borderColor: 'rgba(168, 85, 247, 0.15)',
    borderRadius: '12px',
  },
  guideGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
    marginTop: '1rem',
  },
  guideStep: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start',
  },
  stepNum: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'var(--primary-accent)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '0.8rem',
    flexShrink: 0,
  },
  stepTitle: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginBottom: '0.25rem',
  },
  stepText: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.4,
  },
  link: {
    color: 'var(--secondary-accent)',
    textDecoration: 'underline',
  },
  envCode: {
    display: 'block',
    background: 'rgba(0, 0, 0, 0.3)',
    padding: '0.5rem',
    borderRadius: '6px',
    marginTop: '0.5rem',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    lineHeight: 1.4,
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  statCard: {
    padding: '1rem 1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    borderRadius: '12px',
  },
  statIcon: {
    padding: '0.5rem',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statVal: {
    fontSize: '1.5rem',
    fontWeight: 800,
    lineHeight: 1.1,
    color: '#fff',
    fontFamily: 'var(--font-display)',
  },
  statLabel: {
    color: 'var(--text-secondary)',
    fontSize: '0.8rem',
  },
  controlsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  searchWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.6rem 0.85rem',
    flex: '1 1 350px',
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '10px',
  },
  searchInput: {
    background: 'none',
    border: 'none',
    color: 'var(--text-primary)',
    outline: 'none',
    width: '100%',
    fontSize: '0.9rem',
    fontFamily: 'var(--font-sans)',
  },
  filtersWrapper: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  filterGroup: {
    display: 'flex',
    padding: '0.2rem',
    background: 'rgba(255, 255, 255, 0.01)',
    borderRadius: '8px',
  },
  filterBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    padding: '0.4rem 0.85rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: 500,
  },
  filterBtnActive: {
    background: 'var(--primary-accent)',
    color: '#fff',
    boxShadow: '0 2px 8px var(--primary-glow)',
  },
  categoriesRow: {
    display: 'flex',
    gap: '0.5rem',
    overflowX: 'auto',
    paddingBottom: '0.25rem',
    scrollbarWidth: 'none',
  },
  catTab: {
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    padding: '0.4rem 1rem',
    borderRadius: '9999px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  catTabActive: {
    borderColor: 'var(--primary-accent)',
    background: 'rgba(168, 85, 247, 0.08)',
    color: '#d8b4fe',
  },
  catCount: {
    background: 'rgba(255, 255, 255, 0.04)',
    color: 'var(--text-muted)',
    fontSize: '0.7rem',
    padding: '0.05rem 0.3rem',
    borderRadius: '4px',
  },
  listSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  categoryBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  categoryTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#fff',
    fontFamily: 'var(--font-display)',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.4rem',
  },
  csesTable: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid var(--border-color)',
    background: 'rgba(11, 13, 20, 0.3)',
  },
  csesRow: {
    display: 'grid',
    gridTemplateColumns: '40px 1fr 100px 60px',
    alignItems: 'center',
    padding: '0.5rem 1rem',
    borderBottom: '1px solid var(--border-color)',
    transition: 'background-color 0.15s ease',
    minHeight: '44px',
  },
  rowIconCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docIcon: {
    fontSize: '1rem',
  },
  rowTitleCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  problemLink: {
    color: '#3b82f6',
    fontWeight: 500,
    textDecoration: 'none',
    fontSize: '0.95rem',
    transition: 'color 0.15s ease',
  },
  rowFilename: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  rowMetaCell: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  difficultyBadge: {
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  rowStatusCell: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkBox: {
    width: '22px',
    height: '22px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  checkmarkSolved: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
    boxShadow: '0 0 8px rgba(16, 185, 129, 0.4)',
  },
  checkmarkCodeOnly: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.25)',
  },
  emptyState: {
    padding: '3rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
