import { SimpleProject, VibeTool } from '../types/project';

/**
 * Automatically detects whether an input is a URL or raw HTML/code,
 * and identifies the vibecoding tool (Lovable, Claude, v0, Bolt, etc.).
 */
export function detectImportInput(rawInput: string): {
  type: 'code' | 'url';
  tool: VibeTool;
} {
  const trimmed = rawInput.trim();
  const lower = trimmed.toLowerCase();

  const isUrl =
    (lower.startsWith('http://') || lower.startsWith('https://')) &&
    !trimmed.includes('\n') &&
    !lower.includes('<html') &&
    !lower.includes('<script');

  if (isUrl) {
    if (lower.includes('lovable.app') || lower.includes('lovable.dev') || lower.includes('gptengineer')) {
      return { type: 'url', tool: 'Lovable' };
    }
    if (lower.includes('claude.site') || lower.includes('claude.ai')) {
      return { type: 'url', tool: 'Claude' };
    }
    if (lower.includes('v0.dev') || lower.includes('v0.app') || lower.includes('vercel.app')) {
      return { type: 'url', tool: 'v0' };
    }
    if (lower.includes('bolt.new') || lower.includes('stackblitz')) {
      return { type: 'url', tool: 'Bolt' };
    }
    return { type: 'url', tool: 'Other' };
  }

  // Otherwise treat as pasted code (e.g. Claude Artifact HTML/JS/SVG)
  return { type: 'code', tool: 'Claude' };
}

/**
 * Validates that a new project has a title and either code or a valid URL.
 */
export function validateSimpleProject(input: {
  title: string;
  content: string;
}): { valid: boolean; error?: string } {
  if (!input.title || input.title.trim().length < 2) {
    return { valid: false, error: 'Please enter a project title.' };
  }
  if (!input.content || input.content.trim().length === 0) {
    return {
      valid: false,
      error: 'Please paste a URL (from Lovable/Claude) or HTML code (from Claude).',
    };
  }
  return { valid: true };
}

/**
 * Filter projects by search text and tool filter.
 */
export function filterSimpleProjects(
  projects: SimpleProject[],
  query: string,
  toolFilter: VibeTool | 'All'
): SimpleProject[] {
  const q = query.trim().toLowerCase();
  return projects.filter((p) => {
    if (toolFilter !== 'All' && p.tool !== toolFilter) {
      return false;
    }
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.author.toLowerCase().includes(q) ||
      p.tool.toLowerCase().includes(q)
    );
  });
}

/**
 * Generates a single-file, zero-build `index.html` containing all current projects
 * so the user can drop it directly into the root of their `main` branch on GitHub Pages
 * with zero GitHub Actions or build workflows needed.
 */
export function generateStandaloneRootHtml(projects: SimpleProject[]): string {
  const projectsJson = JSON.stringify(projects, null, 2).replace(/<\/script>/gi, '<\\/script>');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Research Lab — Vibecoded Projects</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-50 text-slate-900 min-h-screen font-sans">
  <header class="border-b border-slate-200 bg-white sticky top-0 z-20">
    <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold tracking-tight text-slate-900">Research Lab Showcase</h1>
        <p class="text-xs text-slate-500">Interactive Vibecoded Projects from Claude &amp; Lovable</p>
      </div>
      <span class="text-xs font-medium bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
        Hosted on GitHub Pages (main / root)
      </span>
    </div>
  </header>
  <main class="max-w-6xl mx-auto px-4 py-8">
    <div id="grid" class="grid grid-cols-1 md:grid-cols-2 gap-6"></div>
  </main>
  <script>
    const PROJECTS = ${projectsJson};
    const grid = document.getElementById('grid');
    PROJECTS.forEach((p) => {
      const card = document.createElement('div');
      card.className = 'bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col';
      const preview = p.type === 'code'
        ? '<iframe sandbox="allow-scripts" class="w-full h-72 border-0 bg-slate-900" srcdoc="' + (p.code || '').replace(/"/g, '&quot;') + '"></iframe>'
        : '<iframe class="w-full h-72 border-0 bg-slate-100" src="' + p.url + '"></iframe>';
      card.innerHTML = preview +
        '<div class="p-4 flex-1 flex flex-col justify-between">' +
          '<div>' +
            '<div class="flex items-center justify-between gap-2 mb-1">' +
              '<h2 class="font-bold text-base text-slate-900">' + p.title + '</h2>' +
              '<span class="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">' + p.tool + '</span>' +
            '</div>' +
            '<p class="text-xs text-slate-600 mb-3">' + p.description + '</p>' +
          '</div>' +
          '<div class="text-xs text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100">' +
            '<span>By ' + p.author + '</span>' +
            (p.url ? '<a href="' + p.url + '" target="_blank" class="text-blue-600 hover:underline">Open Link &rarr;</a>' : '<span>Interactive Artifact</span>') +
          '</div>' +
        '</div>';
      grid.appendChild(card);
    });
  </script>
</body>
</html>`;
}
