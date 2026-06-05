import fs from 'fs';
import path from 'path';

export interface CppFileInfo {
  filename: string;
  displayName: string;
  category: string;
  code: string;
  problemUrl?: string;
}

// Map of known file basenames to CSES Problem Names and official Categories
const CSES_METADATA_MAP: Record<string, { displayName: string; category: string; url?: string }> = {
  'Weird.cpp': {
    displayName: 'Weird Algorithm',
    category: 'Introductory Problems',
    url: 'https://cses.fi/problemset/task/1068',
  },
  'Missing_Number.cpp': {
    displayName: 'Missing Number',
    category: 'Introductory Problems',
    url: 'https://cses.fi/problemset/task/1083',
  },
  'missing_numbers.cpp': {
    displayName: 'Missing Number (Alternative)',
    category: 'Introductory Problems',
    url: 'https://cses.fi/problemset/task/1083',
  },
  'Apartments.cpp': {
    displayName: 'Apartments',
    category: 'Sorting and Searching',
    url: 'https://cses.fi/problemset/task/1084',
  },
  'Ferris.cpp': {
    displayName: 'Ferris Wheel',
    category: 'Sorting and Searching',
    url: 'https://cses.fi/problemset/task/1090',
  },
  'Concert Tickets.cpp': {
    displayName: 'Concert Tickets',
    category: 'Sorting and Searching',
    url: 'https://cses.fi/problemset/task/1091',
  },
  'Distinct.cpp': {
    displayName: 'Distinct Numbers',
    category: 'Sorting and Searching',
    url: 'https://cses.fi/problemset/task/1621',
  },
  'CountingRooms.cpp': {
    displayName: 'Counting Rooms',
    category: 'Graph Algorithms',
    url: 'https://cses.fi/problemset/task/1192',
  },
  'Labyrinth.cpp': {
    displayName: 'Labyrinth',
    category: 'Graph Algorithms',
    url: 'https://cses.fi/problemset/task/1193',
  },
  'BuildingRoads.cpp': {
    displayName: 'Building Roads',
    category: 'Graph Algorithms',
    url: 'https://cses.fi/problemset/task/1666',
  },
  'BuildingTeams.cpp': {
    displayName: 'Building Teams',
    category: 'Graph Algorithms',
    url: 'https://cses.fi/problemset/task/1668',
  },
  'RoundTrip.cpp': {
    displayName: 'Round Trip',
    category: 'Graph Algorithms',
    url: 'https://cses.fi/problemset/task/1669',
  },
  'ShortestRoutesI.cpp': {
    displayName: 'Shortest Routes I',
    category: 'Graph Algorithms',
    url: 'https://cses.fi/problemset/task/1671',
  },
  'ShortestRoutesII.cpp': {
    displayName: 'Shortest Routes II',
    category: 'Graph Algorithms',
    url: 'https://cses.fi/problemset/task/1672',
  },
  'SubarraySumsI.cpp': {
    displayName: 'Subarray Sums I',
    category: 'Sorting and Searching',
    url: 'https://cses.fi/problemset/task/1660',
  },
  'SubarraySumsII.cpp': {
    displayName: 'Subarray Sums II',
    category: 'Sorting and Searching',
    url: 'https://cses.fi/problemset/task/1661',
  },
  'Subordinates.cpp': {
    displayName: 'Subordinates',
    category: 'Tree Algorithms',
    url: 'https://cses.fi/problemset/task/1674',
  },
  'Tree Matching.cpp': {
    displayName: 'Tree Matching',
    category: 'Tree Algorithms',
    url: 'https://cses.fi/problemset/task/1130',
  },
  'DynamicRangeMinimumQueries.cpp': {
    displayName: 'Dynamic Range Minimum Queries',
    category: 'Range Queries',
    url: 'https://cses.fi/problemset/task/1649',
  },
  'RangeUpdateQueries.cpp': {
    displayName: 'Range Update Queries',
    category: 'Range Queries',
    url: 'https://cses.fi/problemset/task/1651',
  },
  'RangeUpdatesandSums.cpp': {
    displayName: 'Range Updates and Sums',
    category: 'Range Queries',
    url: 'https://cses.fi/problemset/task/1735',
  },
  'RangeXorQueries.cpp': {
    displayName: 'Range Xor Queries',
    category: 'Range Queries',
    url: 'https://cses.fi/problemset/task/1650',
  },
  'SalaryQueries.cpp': {
    displayName: 'Salary Queries',
    category: 'Range Queries',
    url: 'https://cses.fi/problemset/task/1144',
  },
  'SubarraySumQueries.cpp': {
    displayName: 'Subarray Sum Queries',
    category: 'Range Queries',
    url: 'https://cses.fi/problemset/task/1190',
  },
  'RangeIntervalQueries.cpp': {
    displayName: 'Range Interval Queries',
    category: 'Range Queries',
    url: 'https://cses.fi/problemset/task/1739',
  },
};

const GITHUB_REPO_OWNER = 'benjamin-shih-tw';
const GITHUB_REPO_NAME = 'Competitive-Programming';
const GITHUB_BRANCH = 'cses-solutions';

// Formats file name into readable display name
function fallbackDisplayName(filename: string): string {
  const base = filename.replace(/\.cpp$/, '');
  return base
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .trim();
}

// Scans local directory (useful for backup or local environment)
function getLocalCppFiles(): CppFileInfo[] {
  try {
    const repoDir = path.resolve(process.cwd(), '../');
    const files = fs.readdirSync(repoDir);
    return files
      .filter((file) => file.endsWith('.cpp'))
      .map((filename) => {
        const mapped = CSES_METADATA_MAP[filename];
        return {
          filename,
          displayName: mapped ? mapped.displayName : fallbackDisplayName(filename),
          category: mapped ? mapped.category : 'General / Uncategorized',
          code: '', // Do not load code content for list to save memory
          problemUrl: mapped?.url,
        };
      });
  } catch (e) {
    return [];
  }
}

// Fetch all C++ files list from GitHub REST API
export async function getAllCppFiles(): Promise<CppFileInfo[]> {
  try {
    const url = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents?ref=${GITHUB_BRANCH}`;
    
    // Fetch using Next.js fetch cache (cached for 60 seconds)
    const response = await fetch(url, {
      next: { revalidate: 60 },
      headers: {
        'User-Agent': 'CSES-Solutions-Portal',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API returned status ${response.status}`);
    }

    const files = await response.json();
    if (!Array.isArray(files)) {
      throw new Error('GitHub API response is not an array');
    }

    const cppFiles = files
      .filter((f) => f.type === 'file' && f.name.endsWith('.cpp'))
      .map((f) => {
        const filename = f.name;
        const mapped = CSES_METADATA_MAP[filename];
        return {
          filename,
          displayName: mapped ? mapped.displayName : fallbackDisplayName(filename),
          category: mapped ? mapped.category : 'General / Uncategorized',
          code: '', // Load on-demand inside detail page
          problemUrl: mapped?.url,
        };
      })
      .sort((a, b) => a.displayName.localeCompare(b.displayName));

    return cppFiles.length > 0 ? cppFiles : getLocalCppFiles();
  } catch (error) {
    console.warn('Failed to fetch file list from GitHub API, falling back to local files:', error);
    return getLocalCppFiles();
  }
}

// Fetch a single C++ file's source code
export async function getCppFileByFilename(filename: string): Promise<CppFileInfo | null> {
  // Clean parameter
  const cleanFilename = path.basename(filename);
  if (!cleanFilename.endsWith('.cpp')) return null;

  try {
    // 1. Try fetching raw content from GitHub
    const rawUrl = `https://raw.githubusercontent.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/${GITHUB_BRANCH}/${encodeURIComponent(cleanFilename)}`;
    const response = await fetch(rawUrl, {
      next: { revalidate: 60 },
      headers: {
        'User-Agent': 'CSES-Solutions-Portal',
      },
    });

    if (response.ok) {
      const code = await response.text();
      const mapped = CSES_METADATA_MAP[cleanFilename];
      return {
        filename: cleanFilename,
        displayName: mapped ? mapped.displayName : fallbackDisplayName(cleanFilename),
        category: mapped ? mapped.category : 'General / Uncategorized',
        code,
        problemUrl: mapped?.url,
      };
    }
  } catch (error) {
    console.warn(`Failed to fetch raw file ${cleanFilename} from GitHub, trying local disk:`, error);
  }

  // 2. Fall back to local file read
  try {
    const repoDir = path.resolve(process.cwd(), '../');
    const filePath = path.join(repoDir, cleanFilename);
    
    // Safety check to prevent path traversal
    const relative = path.relative(repoDir, filePath);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      return null;
    }

    if (fs.existsSync(filePath)) {
      const code = fs.readFileSync(filePath, 'utf-8');
      const mapped = CSES_METADATA_MAP[cleanFilename];
      return {
        filename: cleanFilename,
        displayName: mapped ? mapped.displayName : fallbackDisplayName(cleanFilename),
        category: mapped ? mapped.category : 'General / Uncategorized',
        code,
        problemUrl: mapped?.url,
      };
    }
  } catch (error) {
    console.error(`Local file read failed for ${cleanFilename}:`, error);
  }

  return null;
}
