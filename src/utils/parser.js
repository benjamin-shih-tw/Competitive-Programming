/**
 * Parses pasted HTML or text from CSES problemset page and extracts solved problem IDs.
 * @param {string} text - The pasted HTML or text content.
 * @returns {string[]} List of solved problem IDs.
 */
export function parseCSESHtml(text) {
  if (!text) return [];
  
  const solvedIds = new Set();
  
  // Method 1: Try using DOMParser for structured HTML
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    
    // Look for all task items
    const tasks = doc.querySelectorAll('.task');
    if (tasks.length > 0) {
      tasks.forEach(task => {
        // If task is solved, the task-score icon will have class "full"
        const isSolved = task.querySelector('.task-score.full');
        if (isSolved) {
          const a = task.querySelector('a');
          if (a) {
            const href = a.getAttribute('href');
            const match = href.match(/task\/(\d+)/);
            if (match) {
              solvedIds.add(match[1]);
            }
          }
        }
      });
    }
  } catch (e) {
    console.error("DOMParser failed, falling back to regex", e);
  }
  
  // Method 2: Fallback Regex matching (runs if DOMParser didn't find anything or failed)
  if (solvedIds.size === 0) {
    // Regex for task lists with solved status
    // Matching <li class="task">... href="/problemset/task/1068" ... task-score icon full ...
    // Let's look for any link containing task/ID and an icon showing full score
    
    // 1. First, search for all tasks in the HTML text
    // E.g., <li class="task">...</li>
    const parts = text.split('<li class="task">');
    for (let i = 1; i < parts.length; i++) {
      const taskHtml = parts[i];
      // Check if it has the full score icon
      if (taskHtml.includes('task-score') && taskHtml.includes('full')) {
        const hrefMatch = taskHtml.match(/href="\/problemset\/task\/(\d+)"/);
        if (hrefMatch) {
          solvedIds.add(hrefMatch[1]);
        }
      }
    }
    
    // 2. If still empty, search for raw task links with a green checkmark or "full" in close proximity
    if (solvedIds.size === 0) {
      // Find all matches of /task/ID
      const idRegex = /task\/(\d+)/g;
      const ids = [];
      let idMatch;
      while ((idMatch = idRegex.exec(text)) !== null) {
        ids.push({ id: idMatch[1], index: idMatch.index });
      }
      
      // If we find task links, let's check if the text contains indications of "full" near the link
      // This is a last-resort heuristic
      ids.forEach(({ id, index }) => {
        // Look at the surrounding 200 characters
        const start = Math.max(0, index - 50);
        const end = Math.min(text.length, index + 200);
        const surrounding = text.substring(start, end);
        if (surrounding.includes('task-score') && surrounding.includes('full')) {
          solvedIds.add(id);
        }
      });
    }
  }
  
  return Array.from(solvedIds);
}

/**
 * Generates the bookmarklet code for the current app deployment.
 * @param {string} appUrl - The base URL of the app.
 * @returns {string} The javascript URI scheme for the bookmarklet.
 */
export function generateBookmarkletCode(appUrl) {
  // Clean appUrl to prevent escaping issues
  const cleanUrl = appUrl.endsWith('/') ? appUrl : appUrl + '/';
  
  return `javascript:(function(){var t=document.querySelectorAll(".task"),s=[];t.forEach(function(e){var r=e.querySelector(".task-score");if(r&&(r.classList.contains("full")||r.className.indexOf("full")!==-1)){var a=e.querySelector("a");if(a){var o=a.getAttribute("href").match(/task\\/(\\d+)/);o&&s.push(o[1])}}});if(s.length===0){alert("No solved tasks found. Make sure you are logged in to CSES and on the problemset page: https://cses.fi/problemset/");return}window.location.href="${cleanUrl}#solved="+s.join(",");})();`;
}
