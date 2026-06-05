import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getAllCppFiles } from '../../../lib/cppFiles';

// Keep in sync with CSES_METADATA_MAP from cppFiles.ts
const CSES_METADATA_MAP: Record<string, { displayName: string; category: string; url?: string }> = {
  'Weird.cpp': { displayName: 'Weird Algorithm', category: 'Introductory Problems', url: 'https://cses.fi/problemset/task/1068' },
  'Missing_Number.cpp': { displayName: 'Missing Number', category: 'Introductory Problems', url: 'https://cses.fi/problemset/task/1083' },
  'missing_numbers.cpp': { displayName: 'Missing Number (Alternative)', category: 'Introductory Problems', url: 'https://cses.fi/problemset/task/1083' },
  'Apartments.cpp': { displayName: 'Apartments', category: 'Sorting and Searching', url: 'https://cses.fi/problemset/task/1084' },
  'Ferris.cpp': { displayName: 'Ferris Wheel', category: 'Sorting and Searching', url: 'https://cses.fi/problemset/task/1090' },
  'Concert Tickets.cpp': { displayName: 'Concert Tickets', category: 'Sorting and Searching', url: 'https://cses.fi/problemset/task/1091' },
  'Distinct.cpp': { displayName: 'Distinct Numbers', category: 'Sorting and Searching', url: 'https://cses.fi/problemset/task/1621' },
  'CountingRooms.cpp': { displayName: 'Counting Rooms', category: 'Graph Algorithms', url: 'https://cses.fi/problemset/task/1192' },
  'Labyrinth.cpp': { displayName: 'Labyrinth', category: 'Graph Algorithms', url: 'https://cses.fi/problemset/task/1193' },
  'BuildingRoads.cpp': { displayName: 'Building Roads', category: 'Graph Algorithms', url: 'https://cses.fi/problemset/task/1666' },
  'BuildingTeams.cpp': { displayName: 'Building Teams', category: 'Graph Algorithms', url: 'https://cses.fi/problemset/task/1668' },
  'RoundTrip.cpp': { displayName: 'Round Trip', category: 'Graph Algorithms', url: 'https://cses.fi/problemset/task/1669' },
  'ShortestRoutesI.cpp': { displayName: 'Shortest Routes I', category: 'Graph Algorithms', url: 'https://cses.fi/problemset/task/1671' },
  'ShortestRoutesII.cpp': { displayName: 'Shortest Routes II', category: 'Graph Algorithms', url: 'https://cses.fi/problemset/task/1672' },
  'SubarraySumsI.cpp': { displayName: 'Subarray Sums I', category: 'Sorting and Searching', url: 'https://cses.fi/problemset/task/1660' },
  'SubarraySumsII.cpp': { displayName: 'Subarray Sums II', category: 'Sorting and Searching', url: 'https://cses.fi/problemset/task/1661' },
  'Subordinates.cpp': { displayName: 'Subordinates', category: 'Tree Algorithms', url: 'https://cses.fi/problemset/task/1674' },
  'Tree Matching.cpp': { displayName: 'Tree Matching', category: 'Tree Algorithms', url: 'https://cses.fi/problemset/task/1130' },
  'DynamicRangeMinimumQueries.cpp': { displayName: 'Dynamic Range Minimum Queries', category: 'Range Queries', url: 'https://cses.fi/problemset/task/1649' },
  'RangeUpdateQueries.cpp': { displayName: 'Range Update Queries', category: 'Range Queries', url: 'https://cses.fi/problemset/task/1651' },
  'RangeUpdatesandSums.cpp': { displayName: 'Range Updates and Sums', category: 'Range Queries', url: 'https://cses.fi/problemset/task/1735' },
  'RangeXorQueries.cpp': { displayName: 'Range Xor Queries', category: 'Range Queries', url: 'https://cses.fi/problemset/task/1650' },
  'SalaryQueries.cpp': { displayName: 'Salary Queries', category: 'Range Queries', url: 'https://cses.fi/problemset/task/1144' },
  'SubarraySumQueries.cpp': { displayName: 'Subarray Sum Queries', category: 'Range Queries', url: 'https://cses.fi/problemset/task/1190' },
  'RangeIntervalQueries.cpp': { displayName: 'Range Interval Queries', category: 'Range Queries', url: 'https://cses.fi/problemset/task/1739' },
};

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function cleanFilename(title: string): string {
  const cleaned = title.replace(/[^\w\s-]/g, '');
  const words = cleaned.split(/\s+/);
  const filename = words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  return `${filename}.cpp`;
}

// Scrape helper functions
function extractResultLink(html: string): string | null {
  const regex = /<a href="(\/problemset\/result\/\d+)\/">\s*<span class="[^"]*full[^"]*">/g;
  const match = regex.exec(html);
  if (match) return match[1];

  const fallbackRegex = /<a href="(\/problemset\/result\/\d+)\/">/g;
  let m;
  while ((m = fallbackRegex.exec(html)) !== null) {
    const index = m.index;
    const snippet = html.substring(index, index + 150);
    if (snippet.includes('full')) {
      return m[1];
    }
  }
  return null;
}

function extractCode(html: string): string | null {
  const matchLinenums = html.match(/<pre class="linenums">([\s\S]*?)<\/pre>/);
  if (matchLinenums) {
    return decodeHtmlEntities(matchLinenums[1]);
  }
  const matchPre = html.match(/<pre>([\s\S]*?)<\/pre>/);
  if (matchPre) {
    return decodeHtmlEntities(matchPre[1]);
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const { action, cookie } = await request.json();

    if (!cookie) {
      return NextResponse.json({ error: 'Cookie is required' }, { status: 400 });
    }

    // 1. Fetch CSES problemset
    const headers = {
      'Cookie': `PHPSESSID=${cookie}`,
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    };

    const res = await fetch('https://cses.fi/problemset/', { headers, cache: 'no-store' });
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to connect to CSES' }, { status: 500 });
    }

    const html = await res.text();
    
    // Check if successfully logged in
    const accountMatch = html.match(/<a class="account"[^>]*>([^<]+)<\/a>/);
    if (!accountMatch || accountMatch[1] === 'Login') {
      return NextResponse.json({ error: 'Invalid PHPSESSID cookie or session expired.' }, { status: 401 });
    }
    const username = accountMatch[1].trim();

    // 2. Parse solved problems (restrict to main content area to avoid sidebar pollution)
    const contentMatch = html.match(/<div class="content">([\s\S]*?)<\/div>/);
    const parsingHtml = contentMatch ? contentMatch[1] : html;

    const solvedTasks: Array<{ id: string; title: string; url: string; filename: string; onGithub: boolean }> = [];
    const taskRegex = /<li class="task"><a href="\/problemset\/task\/(\d+)">([^<]+)<\/a>([\s\S]*?)<span class="task-score icon\s*([^"]*)">/g;

    
    let match;
    const taskIdsToFilename: Record<string, string> = {};
    const taskIdsToTitle: Record<string, string> = {};

    // Build mapping of ID -> Filename from our metadata map
    Object.entries(CSES_METADATA_MAP).forEach(([fn, meta]) => {
      const idMatch = meta.url?.match(/\/task\/(\d+)/);
      if (idMatch) {
        taskIdsToFilename[idMatch[1]] = fn;
        taskIdsToTitle[idMatch[1]] = meta.displayName;
      }
    });

    // Scan github files to check what is already uploaded
    const githubFiles = await getAllCppFiles();
    const githubFilenames = new Set(githubFiles.map(f => f.filename.toLowerCase()));

    while ((match = taskRegex.exec(parsingHtml)) !== null) {
      const id = match[1];
      const title = match[2].trim();
      const scoreClasses = match[4] || '';
      const isSolved = scoreClasses.includes('full');

      if (isSolved) {
        let filename = taskIdsToFilename[id];
        if (!filename) {
          // Fallback matching by title
          const titleMatch = Object.entries(CSES_METADATA_MAP).find(
            ([_, meta]) => meta.displayName.toLowerCase() === title.toLowerCase()
          );
          filename = titleMatch ? titleMatch[0] : cleanFilename(title);
        }

        const onGithub = githubFilenames.has(filename.toLowerCase());

        solvedTasks.push({
          id,
          title,
          url: `https://cses.fi/problemset/task/${id}`,
          filename,
          onGithub,
        });
      }
    }

    const missingTasks = solvedTasks.filter(t => !t.onGithub);

    // ACTION 1: Return current status
    if (action === 'GET_STATUS') {
      return NextResponse.json({
        success: true,
        username,
        solvedCount: solvedTasks.length,
        githubCount: githubFiles.length,
        solvedTasks,
        missingCount: missingTasks.length,
      });
    }

    // ACTION 2: Download missing files directly to local workspace
    if (action === 'SYNC_DOWNLOAD') {
      const repoDir = path.resolve(process.cwd(), '../');
      
      if (!fs.existsSync(repoDir)) {
        return NextResponse.json({ error: 'Local workspace directory not found.' }, { status: 500 });
      }

      const syncResults: Array<{ id: string; title: string; filename: string; status: 'success' | 'failed' | 'skipped' }> = [];
      let successCount = 0;

      for (const task of missingTasks) {
        try {
          // Fetch task page
          const taskRes = await fetch(task.url, { headers, cache: 'no-store' });
          if (!taskRes.ok) {
            syncResults.push({ id: task.id, title: task.title, filename: task.filename, status: 'failed' });
            continue;
          }

          const taskHtml = await taskRes.text();
          const resultPath = extractResultLink(taskHtml);

          if (!resultPath) {
            syncResults.push({ id: task.id, title: task.title, filename: task.filename, status: 'failed' });
            continue;
          }

          // Fetch submission page
          const resultUrl = `https://cses.fi${resultPath}`;
          const resultRes = await fetch(resultUrl, { headers, cache: 'no-store' });
          if (!resultRes.ok) {
            syncResults.push({ id: task.id, title: task.title, filename: task.filename, status: 'failed' });
            continue;
          }

          const resultHtml = await resultRes.text();
          const code = extractCode(resultHtml);

          if (!code) {
            syncResults.push({ id: task.id, title: task.title, filename: task.filename, status: 'failed' });
            continue;
          }

          // Write code to local folder and perform Git push flow
          const taskName = task.filename.replace('.cpp', '');
          const filePath = path.join(repoDir, task.filename);
          const untitledPath = path.join(repoDir, 'Untitled-3.cpp');
          
          if (!fs.existsSync(untitledPath)) {
            fs.writeFileSync(untitledPath, '// CSES Workspace', 'utf-8');
          }

          fs.writeFileSync(filePath, code, 'utf-8');

          const { execSync } = require('child_process');
          let pushSuccess = false;

          try {
            // Get current branch
            let currentBranch = 'cses-solutions';
            try {
              currentBranch = execSync('git branch --show-current', { cwd: repoDir }).toString().trim() || 'cses-solutions';
            } catch (e) {}

            // Abort locks
            try { execSync('git merge --abort', { cwd: repoDir }); } catch (e) {}
            try { execSync('git rebase --abort', { cwd: repoDir }); } catch (e) {}

            // Setup sparse checkout
            execSync('git sparse-checkout init --cone', { cwd: repoDir });
            execSync('git sparse-checkout set "/*" "!/cses/*.cpp" "cses/Untitled-3.cpp"', { cwd: repoDir });
            execSync(`git sparse-checkout add "cses/${task.filename}"`, { cwd: repoDir });

            // Git add & commit
            execSync(`git add "${task.filename}"`, { cwd: repoDir });
            execSync(`git commit -m "AC: ${taskName}"`, { cwd: repoDir });

            // Git pull with rebase & autostash
            execSync(`git pull origin ${currentBranch} --rebase -X ours --autostash`, { cwd: repoDir });
            
            // Git push
            execSync(`git push origin ${currentBranch}`, { cwd: repoDir });
            pushSuccess = true;
          } catch (gitErr) {
            console.error(`Git push failed for ${task.filename}:`, gitErr);
          } finally {
            // Reapply cleanup rules and remove the file locally
            try {
              execSync('git sparse-checkout set "/*" "!/cses/*.cpp" "cses/Untitled-3.cpp"', { cwd: repoDir });
            } catch (e) {}
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          }

          if (pushSuccess) {
            syncResults.push({ id: task.id, title: task.title, filename: task.filename, status: 'success' });
            successCount++;
          } else {
            syncResults.push({ id: task.id, title: task.title, filename: task.filename, status: 'failed' });
          }
        } catch (err) {
          console.error(`Error syncing task ${task.title}:`, err);
          syncResults.push({ id: task.id, title: task.title, filename: task.filename, status: 'failed' });
        }
      }


      return NextResponse.json({
        success: true,
        username,
        solvedCount: solvedTasks.length,
        githubCount: githubFiles.length + successCount,
        syncResults,
        successCount,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('API Error in cses-sync:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
