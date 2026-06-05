'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Copy, Check, Columns, Maximize2, Minimize2, BookOpen, Code2 } from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';

interface ProblemViewProps {
  displayName: string;
  filename: string;
  category: string;
  code: string;
  csesLink?: string;
  difficulty?: string;
  explanationHtml: string;
  isMock: boolean;
}

export default function ProblemView({
  displayName,
  filename,
  category,
  code,
  csesLink,
  difficulty,
  explanationHtml,
  isMock,
}: ProblemViewProps) {
  const [activeTab, setActiveTab] = useState<'explanation' | 'code'>('explanation');
  const [isSplitView, setIsSplitView] = useState(true);
  const [copied, setCopied] = useState(false);

  // Trigger Prism highlighting on component mount and view changes
  useEffect(() => {
    Prism.highlightAll();
  }, [code, activeTab, isSplitView]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // Split lines for line numbers gutter
  const codeLines = code.trim().split('\n');

  return (
    <div style={styles.container}>
      {/* Top Navigation Row */}
      <nav style={styles.navRow}>
        <Link href="/" style={styles.backLink}>
          <ArrowLeft size={16} /> 返回題目列表
        </Link>
        
        {/* Layout selector for desktop */}
        <div style={styles.layoutToggles} className="desktop-only-flex">
          <button 
            onClick={() => setIsSplitView(false)}
            style={{ ...styles.layoutBtn, ...(!isSplitView ? styles.layoutBtnActive : {}) }}
          >
            <Maximize2 size={14} /> 單欄分頁
          </button>
          <button 
            onClick={() => setIsSplitView(true)}
            style={{ ...styles.layoutBtn, ...(isSplitView ? styles.layoutBtnActive : {}) }}
          >
            <Columns size={14} /> 雙欄對照
          </button>
        </div>
      </nav>

      {/* Header card */}
      <header style={styles.header} className="glass-panel">
        <div style={styles.headerLeft}>
          <div style={styles.metaRow}>
            <span style={styles.category}>{category}</span>
            {difficulty && (
              <span style={{ 
                ...styles.difficulty,
                color: difficulty.toLowerCase() === 'easy' ? '#34d399' : difficulty.toLowerCase() === 'medium' ? '#fbbf24' : '#f87171',
                background: difficulty.toLowerCase() === 'easy' ? 'rgba(16, 185, 129, 0.12)' : difficulty.toLowerCase() === 'medium' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(239, 68, 68, 0.12)'
              }}>
                {difficulty}
              </span>
            )}
            {isMock && (
              <span style={styles.mockBadge}>本地模擬題解</span>
            )}
          </div>
          <h1 style={styles.title}>{displayName}</h1>
          <div style={styles.fileRow}>
            <Code2 size={14} style={{ color: 'var(--text-muted)' }} />
            <span style={styles.filename}>{filename}</span>
          </div>
        </div>

        {csesLink && (
          <a href={csesLink} target="_blank" rel="noreferrer" style={styles.csesBtn} className="pulse-glow">
            <ExternalLink size={16} /> CSES 原題連結
          </a>
        )}
      </header>

      {/* Mobile Tab Selector & Desktop single tab selector */}
      {(!isSplitView || typeof window !== 'undefined' && window.innerWidth < 1024) && (
        <div style={styles.tabRow} className="glass-panel">
          <button
            onClick={() => setActiveTab('explanation')}
            style={{ ...styles.tabBtn, ...(activeTab === 'explanation' ? styles.tabBtnActive : {}) }}
          >
            <BookOpen size={16} /> 題解說明
          </button>
          <button
            onClick={() => setActiveTab('code')}
            style={{ ...styles.tabBtn, ...(activeTab === 'code' ? styles.tabBtnActive : {}) }}
          >
            <Code2 size={16} /> C++ 原始碼
          </button>
        </div>
      )}

      {/* Main content grid */}
      <div style={{
        ...styles.contentGrid,
        gridTemplateColumns: isSplitView ? '1fr 1fr' : '1fr',
        // Responsive CSS is injected in styles block or layout
      }} className="content-grid-responsive">
        
        {/* Left Column: Notion Explanation */}
        {(isSplitView || activeTab === 'explanation') && (
          <section style={styles.section} className="glass-panel pane-responsive">
            <div style={styles.sectionHeader}>
              <BookOpen size={18} style={{ color: 'var(--primary-accent)' }} />
              <h2 style={styles.sectionTitle}>題解說明 (Notion)</h2>
            </div>
            
            <div style={styles.explanationBody}>
              <div 
                className="markdown-content"
                dangerouslySetInnerHTML={{ __html: explanationHtml }} 
              />
            </div>
          </section>
        )}

        {/* Right Column: Code Viewer */}
        {(isSplitView || activeTab === 'code') && (
          <section style={styles.section} className="glass-panel pane-responsive">
            <div style={styles.codeSectionHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Code2 size={18} style={{ color: 'var(--secondary-accent)' }} />
                <h2 style={styles.sectionTitle}>C++ 原始碼</h2>
              </div>
              
              <button onClick={handleCopyCode} style={styles.copyBtn}>
                {copied ? (
                  <>
                    <Check size={14} style={{ color: 'var(--success)' }} />
                    <span style={{ color: 'var(--success)', fontSize: '0.8rem' }}>已複製</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span style={{ fontSize: '0.8rem' }}>複製代碼</span>
                  </>
                )}
              </button>
            </div>

            <div style={styles.codeWrapper}>
              <div style={styles.gutter}>
                {codeLines.map((_, idx) => (
                  <div key={idx} style={styles.lineNumber}>{idx + 1}</div>
                ))}
              </div>
              <pre style={styles.pre}>
                <code className="language-cpp">{code}</code>
              </pre>
            </div>
          </section>
        )}
      </div>

      {/* Embedded CSS for responsive behaviors that inline styles can't cover */}
      <style jsx global>{`
        @media (max-width: 1023px) {
          .desktop-only-flex {
            display: none !important;
          }
          .content-grid-responsive {
            grid-template-columns: 1fr !important;
          }
        }
        @media (min-width: 1024px) {
          .content-grid-responsive {
            display: grid;
            gap: 1.5rem;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    padding: '2rem 0',
  },
  navRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: 500,
    transition: 'color 0.2s ease',
  },
  layoutToggles: {
    display: 'flex',
    background: 'rgba(255, 255, 255, 0.02)',
    padding: '0.25rem',
    borderRadius: '10px',
    border: '1px solid var(--border-color)',
  },
  layoutBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    padding: '0.4rem 0.8rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    transition: 'all 0.2s ease',
  },
  layoutBtnActive: {
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#fff',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  },
  header: {
    padding: '1.75rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1.5rem',
    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.02) 0%, rgba(6, 182, 212, 0.02) 100%)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  category: {
    fontSize: '0.75rem',
    color: 'var(--secondary-accent)',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  difficulty: {
    fontSize: '0.7rem',
    fontWeight: 700,
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  },
  mockBadge: {
    fontSize: '0.7rem',
    fontWeight: 600,
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    background: 'rgba(245, 158, 11, 0.1)',
    color: '#fbbf24',
    border: '1px solid rgba(245, 158, 11, 0.2)',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 800,
    color: '#fff',
    fontFamily: 'var(--font-display)',
    lineHeight: 1.2,
  },
  fileRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
  },
  filename: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
  },
  csesBtn: {
    background: 'var(--accent-mixed)',
    color: '#fff',
    padding: '0.75rem 1.25rem',
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 4px 15px var(--primary-glow)',
  },
  tabRow: {
    display: 'flex',
    padding: '0.25rem',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  tabBtn: {
    flex: 1,
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    padding: '0.75rem 1rem',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s ease',
  },
  tabBtnActive: {
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#fff',
  },
  contentGrid: {
    display: 'grid',
    gap: '1.5rem',
  },
  section: {
    padding: '1.75rem',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    marginBottom: '1.5rem',
  },
  codeSectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    marginBottom: '1.5rem',
  },
  sectionTitle: {
    fontSize: '1.15rem',
    fontWeight: 600,
    color: '#fff',
  },
  explanationBody: {
    overflowY: 'auto',
    maxHeight: '75vh',
    paddingRight: '0.5rem',
  },
  copyBtn: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    padding: '0.4rem 0.8rem',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  codeWrapper: {
    display: 'flex',
    background: '#0a0a0f',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    overflow: 'auto',
    maxHeight: '75vh',
  },
  gutter: {
    padding: '1.25rem 0.75rem',
    background: '#07070a',
    borderRight: '1px solid rgba(255, 255, 255, 0.04)',
    textAlign: 'right',
    userSelect: 'none',
    display: 'flex',
    flexDirection: 'column',
  },
  lineNumber: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    lineHeight: 1.5,
    height: '1.35rem', // Match height of line content
  },
  pre: {
    margin: 0,
    padding: '1.25rem 1rem',
    flexGrow: 1,
    background: 'transparent',
    border: 'none',
  },
};
