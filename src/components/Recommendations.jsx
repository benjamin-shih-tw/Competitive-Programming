import React, { useMemo } from 'react';

export default function Recommendations({ problemsData, solvedIds }) {
  
  const recommendations = useMemo(() => {
    // Flatten all problems
    const allProblems = [];
    problemsData.forEach(cat => {
      cat.problems.forEach(p => {
        allProblems.push({
          ...p,
          categoryName: cat.category
        });
      });
    });

    const unsolved = allProblems.filter(p => !solvedIds.includes(p.id));
    if (unsolved.length === 0) return null;

    const solved = allProblems.filter(p => solvedIds.includes(p.id));

    // Calculate user's level
    let userLevel = 600; // default starting rating
    if (solved.length >= 5) {
      const ratings = solved.map(p => p.rating).sort((a, b) => b - a);
      const topCount = Math.min(ratings.length, 10);
      const topSum = ratings.slice(0, topCount).reduce((sum, r) => sum + r, 0);
      userLevel = Math.round(topSum / topCount);
    }

    // 1. Easy Recommendation: Highest solve rate among unsolved
    const easy = [...unsolved].sort((a, b) => b.solve_rate - a.solve_rate)[0];

    // 2. Match Recommendation: Rating closest to userLevel
    const match = [...unsolved].sort((a, b) => Math.abs(a.rating - userLevel) - Math.abs(b.rating - userLevel))[0];

    // 3. Hard Recommendation: Rating closest to (userLevel + 300) but highly solved (most popular)
    const targetHardRating = userLevel + 300;
    const hardCandidates = unsolved.filter(p => p.rating >= userLevel + 100 && p.rating <= userLevel + 500);
    const hard = hardCandidates.length > 0 
      ? hardCandidates.sort((a, b) => b.solved_count - a.solved_count)[0] 
      : [...unsolved].filter(p => p.rating > userLevel).sort((a, b) => a.rating - b.rating)[0] || unsolved[0];

    // 4. Random Recommendation: Random unsolved problem
    const random = unsolved[Math.floor(Math.random() * unsolved.length)];

    return {
      userLevel,
      easy,
      match,
      hard,
      random
    };
  }, [problemsData, solvedIds]);

  if (!recommendations) {
    return (
      <div className="stats-panel animated-fade" style={{ textAlign: 'center', padding: '2rem' }}>
        <h3 className="stats-panel-title">Recommendations</h3>
        <p style={{ color: '#aaa' }}>🎉 Congratulations! You have solved all problems!</p>
      </div>
    );
  }

  const { userLevel, easy, match, hard, random } = recommendations;

  const renderRecCard = (title, problem, type) => {
    if (!problem) return null;
    return (
      <div className={`rec-item-card ${type}-card`} key={type}>
        <div>
          <div className="rec-item-type">{title}</div>
          <a 
            href={`https://cses.fi/problemset/task/${problem.id}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className={`rec-item-name difficulty-${problem.color}`}
          >
            {problem.name}
          </a>
        </div>
        <div className="rec-item-meta">
          <span>Category: <strong>{problem.categoryName}</strong></span>
          <span>Rating: <strong className={`difficulty-${problem.color}`}>{problem.rating}</strong></span>
        </div>
      </div>
    );
  };

  return (
    <div className="animated-fade">
      <div className="control-panel mb-4" style={{ padding: '0.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>Problem Recommender</span>
        <span className="checkbox-label" style={{ fontSize: '0.85rem' }}>
          Estimated Level: <strong style={{ color: '#007bff', marginLeft: '4px' }}>{userLevel}</strong>
        </span>
      </div>
      
      <div className="recommendations-container">
        {renderRecCard("Easy (High Success Rate)", easy, "easy")}
        {renderRecCard("Match (Your Rating Level)", match, "match")}
        {renderRecCard("Hard (Challenging)", hard, "hard")}
        {renderRecCard("Random Unsolved", random, "random")}
      </div>
    </div>
  );
}
