import React, { useState, useEffect, useMemo } from 'react';
import { SimpleProject, VibeTool } from './types/project';
import { INITIAL_PROJECTS } from './data/seedProjects';
import {
  detectImportInput,
  validateSimpleProject,
  filterSimpleProjects,
  generateStandaloneRootHtml,
} from './utils/projectHelpers';
import {
  Plus,
  Search,
  Maximize2,
  ExternalLink,
  Trash2,
  Download,
  Code2,
  Link2,
  X,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

const STORAGE_KEY = 'simple_vibelab_projects_v1';

export default function App() {
  const [projects, setProjects] = useState<SimpleProject[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore localStorage error
    }
    return INITIAL_PROJECTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch {
      // ignore localStorage error
    }
  }, [projects]);

  // Filter state
  const [search, setSearch] = useState('');
  const [selectedTool, setSelectedTool] = useState<VibeTool | 'All'>('All');

  // Modals / Overlays
  const [showImportModal, setShowImportModal] = useState(false);
  const [expandedProject, setExpandedProject] = useState<SimpleProject | null>(
    null
  );
  const [showDeployHelp, setShowDeployHelp] = useState(false);

  // Import Form State
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [rawContent, setRawContent] = useState('');
  const [toolOverride, setToolOverride] = useState<VibeTool | ''>('');
  const [formError, setFormError] = useState('');

  const detectedInfo = useMemo(
    () => detectImportInput(rawContent),
    [rawContent]
  );
  const finalTool: VibeTool = toolOverride || detectedInfo.tool;

  const filteredProjects = useMemo(
    () => filterSimpleProjects(projects, search, selectedTool),
    [projects, search, selectedTool]
  );

  const handleLoadQuickDemo = () => {
    setTitle('Interactive Pendulum Wave');
    setAuthor('Lab Researcher');
    setDescription(
      'Harmonic pendulum wave phase simulation pasted from a Claude Artifact.'
    );
    setToolOverride('Claude');
    setRawContent(`<!DOCTYPE html>
<html>
<body style="margin:0;background:#0f172a;overflow:hidden;display:flex;align-items:center;justify-content:center;height:100vh;">
<canvas id="c"></canvas>
<script>
  const c = document.getElementById('c');
  const ctx = c.getContext('2d');
  c.width = window.innerWidth; c.height = window.innerHeight;
  let t = 0;
  function loop() {
    t += 0.03;
    ctx.fillStyle = 'rgba(15,23,42,0.3)';
    ctx.fillRect(0, 0, c.width, c.height);
    for (let i = 0; i < 14; i++) {
      const freq = 0.8 + i * 0.06;
      const x = c.width / 2 + Math.sin(t * freq) * (120 + i * 4);
      const y = 40 + i * 16;
      ctx.fillStyle = 'hsl(' + (190 + i * 10) + ', 90%, 60%)';
      ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
    }
    requestAnimationFrame(loop);
  }
  loop();
</script>
</body>
</html>`);
    setFormError('');
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const check = validateSimpleProject({ title, content: rawContent });
    if (!check.valid) {
      setFormError(check.error || 'Invalid input');
      return;
    }

    const trimmed = rawContent.trim();
    const newProj: SimpleProject = {
      id: `proj-${Date.now()}`,
      title: title.trim(),
      author: author.trim() || 'Lab Member',
      tool: finalTool,
      description:
        description.trim() || `Imported from ${finalTool}`,
      type: detectedInfo.type,
      code: detectedInfo.type === 'code' ? trimmed : undefined,
      url: detectedInfo.type === 'url' ? trimmed : undefined,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setProjects((prev) => [newProj, ...prev]);
    setTitle('');
    setAuthor('');
    setDescription('');
    setRawContent('');
    setToolOverride('');
    setFormError('');
    setShowImportModal(false);
  };

  const handleDelete = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const handleDownloadRootIndexHtml = () => {
    const htmlString = generateStandaloneRootHtml(projects);
    const blob = new Blob([htmlString], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const badgeStyle = (tool: VibeTool) => {
    switch (tool) {
      case 'Claude':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Lovable':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'v0':
        return 'bg-slate-200 text-slate-800 border-slate-300';
      case 'Bolt':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Simple Top Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                Research Lab
              </h1>
              <p className="text-xs text-slate-500">
                Interactive Vibecoded Projects
              </p>
            </div>

            {/* Minimal Navigation with placeholders for future lab pages */}
            <nav className="hidden md:flex items-center gap-1 text-xs font-medium">
              <span className="rounded-lg bg-slate-900 px-3 py-1.5 text-white">
                Home (Projects)
              </span>
              <span
                className="rounded-lg px-3 py-1.5 text-slate-400 cursor-default"
                title="Placeholder for future Publications page"
              >
                Publications (Soon)
              </span>
              <span
                className="rounded-lg px-3 py-1.5 text-slate-400 cursor-default"
                title="Placeholder for future Team page"
              >
                Team (Soon)
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowDeployHelp(true)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
            >
              <Download className="h-3.5 w-3.5 text-slate-600" />
              <span className="hidden sm:inline">Save for GitHub Pages</span>
            </button>

            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm transition"
            >
              <Plus className="h-4 w-4" />
              <span>Import from Claude / Lovable</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Home Page Content */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 space-y-6">
        {/* Simple Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              aria-label="Search projects"
              className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {(['All', 'Claude', 'Lovable', 'v0', 'Bolt'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTool(t)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  selectedTool === t
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
            <p className="text-sm text-slate-600">No projects found.</p>
            <button
              onClick={() => setShowImportModal(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              + Import a Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.map((project) => (
              <article
                key={project.id}
                className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"
              >
                {/* Live Interactive Preview right on the card */}
                <div className="relative h-64 w-full bg-slate-900 border-b border-slate-200">
                  {project.type === 'code' && project.code ? (
                    <iframe
                      title={project.title}
                      srcDoc={project.code}
                      sandbox="allow-scripts allow-forms"
                      className="h-full w-full border-0"
                    />
                  ) : project.url ? (
                    <iframe
                      title={project.title}
                      src={project.url}
                      sandbox="allow-scripts allow-same-origin allow-forms"
                      className="h-full w-full border-0 bg-white"
                    />
                  ) : null}

                  <button
                    onClick={() => setExpandedProject(project)}
                    className="absolute bottom-2.5 right-2.5 rounded-lg bg-slate-900/80 backdrop-blur px-2.5 py-1.5 text-xs font-medium text-white hover:bg-slate-900 flex items-center gap-1.5 shadow"
                    title="Expand full view"
                    aria-label={`Expand ${project.title}`}
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                    <span>Expand</span>
                  </button>
                </div>

                {/* Card Details */}
                <div className="flex flex-1 flex-col justify-between p-4">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="font-bold text-base text-slate-900">
                        {project.title}
                      </h2>
                      <span
                        className={`shrink-0 rounded-md border px-2 py-0.5 text-[11px] font-semibold ${badgeStyle(
                          project.tool
                        )}`}
                      >
                        {project.tool}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>By {project.author}</span>

                    <div className="flex items-center gap-2">
                      {project.url && (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:underline font-medium"
                        >
                          <span>Open URL</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {project.id.startsWith('proj-') && (
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                          title="Delete project"
                          aria-label={`Delete ${project.title}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Simple Import Modal (Lovable URL or Claude Code) */}
      {showImportModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="import-modal-title"
        >
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2
                  id="import-modal-title"
                  className="text-base font-bold text-slate-900"
                >
                  Import Project from Claude or Lovable
                </h2>
                <p className="text-xs text-slate-500">
                  Paste a Lovable/v0 link OR paste HTML code from a Claude Artifact.
                </p>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="p-5 space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-xs text-blue-900">
                <span>Want to try it right now?</span>
                <button
                  type="button"
                  onClick={handleLoadQuickDemo}
                  className="font-semibold text-blue-700 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Fill Example Claude Artifact</span>
                </button>
              </div>

              {formError && (
                <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Neural Maze Sim"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g., Alex"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Paste Lovable URL or Claude HTML Code *
                  </label>
                  {rawContent.trim() && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700">
                      {detectedInfo.type === 'url' ? (
                        <>
                          <Link2 className="h-3 w-3" />
                          <span>Detected Live URL ({finalTool})</span>
                        </>
                      ) : (
                        <>
                          <Code2 className="h-3 w-3" />
                          <span>Detected HTML Code ({finalTool})</span>
                        </>
                      )}
                    </span>
                  )}
                </div>
                <textarea
                  rows={5}
                  value={rawContent}
                  onChange={(e) => setRawContent(e.target.value)}
                  placeholder="https://your-project.lovable.app   OR   <!DOCTYPE html><html>...</html>"
                  className="w-full rounded-lg border border-slate-300 p-3 font-mono text-xs text-slate-800 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Short Description
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What does this prototype do?"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vibe Tool
                  </label>
                  <select
                    value={finalTool}
                    onChange={(e) =>
                      setToolOverride(e.target.value as VibeTool)
                    }
                    aria-label="Vibe Tool"
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs bg-white focus:border-blue-600 focus:outline-none"
                  >
                    <option value="Claude">Claude</option>
                    <option value="Lovable">Lovable</option>
                    <option value="v0">v0</option>
                    <option value="Bolt">Bolt</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Add to Home Page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simple Deploy from main / root Modal */}
      {showDeployHelp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="deploy-modal-title"
        >
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2
                id="deploy-modal-title"
                className="text-base font-bold text-slate-900"
              >
                Deploy Directly from `main` / `/ (root)`
              </h2>
              <button
                onClick={() => setShowDeployHelp(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close deploy modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-600 leading-relaxed">
              <p className="text-slate-800 font-medium">
                Want to host on GitHub Pages straight from your <code>main</code> branch root folder with zero GitHub Actions workflows?
              </p>

              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  Add all the Claude or Lovable projects you want on the site.
                </li>
                <li>
                  Click the button below to download a single, self-contained{' '}
                  <code>index.html</code> file with all {projects.length}{' '}
                  projects baked inside it.
                </li>
                <li>
                  Upload that <code>index.html</code> to the root of your GitHub
                  repository&apos;s <code>main</code> branch, and set{' '}
                  <strong>Settings &rarr; Pages &rarr; Deploy from a branch &rarr; main / (root)</strong>.
                </li>
              </ol>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleDownloadRootIndexHtml}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm"
                >
                  <Download className="h-4 w-4" />
                  <span>
                    Download Ready-to-Host `index.html` ({projects.length} projects)
                  </span>
                </button>

                <button
                  onClick={() => {
                    localStorage.removeItem(STORAGE_KEY);
                    setProjects(INITIAL_PROJECTS);
                  }}
                  className="flex items-center justify-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-500 hover:text-rose-600 hover:bg-slate-50"
                  title="Reset to default sample projects"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Expanded View for a Single Project */}
      {expandedProject && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-slate-900/90 p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={expandedProject.title}
        >
          <div className="flex items-center justify-between rounded-t-xl bg-white px-4 py-3 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <h3 className="font-bold text-sm text-slate-900">
                {expandedProject.title}
              </h3>
              <span
                className={`rounded border px-2 py-0.5 text-[11px] font-semibold ${badgeStyle(
                  expandedProject.tool
                )}`}
              >
                {expandedProject.tool}
              </span>
              <span className="text-xs text-slate-400">
                by {expandedProject.author}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {expandedProject.url && (
                <a
                  href={expandedProject.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-slate-50"
                >
                  <span>Open in New Tab</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              <button
                onClick={() => setExpandedProject(null)}
                className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>

          <div className="flex-1 bg-slate-950 rounded-b-xl overflow-hidden">
            {expandedProject.type === 'code' && expandedProject.code ? (
              <iframe
                title={expandedProject.title}
                srcDoc={expandedProject.code}
                sandbox="allow-scripts allow-forms"
                className="h-full w-full border-0"
              />
            ) : expandedProject.url ? (
              <iframe
                title={expandedProject.title}
                src={expandedProject.url}
                sandbox="allow-scripts allow-same-origin allow-forms"
                className="h-full w-full border-0 bg-white"
              />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
