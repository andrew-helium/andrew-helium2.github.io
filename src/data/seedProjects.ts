import { SimpleProject } from '../types/project';

export const INITIAL_PROJECTS: SimpleProject[] = [
  {
    id: 'claude-particles',
    title: 'Semantic Vector Field Explorer',
    author: 'Maya Chen',
    tool: 'Claude',
    description: 'Interactive particle field showing how prompts steer trajectories toward different semantic attractors. Drag the colored poles or click to spawn particles.',
    type: 'code',
    prompt: 'Create an interactive HTML5 canvas with draggable attractor nodes and flowing particles.',
    createdAt: '2026-02-20',
    code: `<!DOCTYPE html>
<html>
<head>
<style>
  body { margin: 0; background: #0f172a; color: #f8fafc; font-family: system-ui, sans-serif; overflow: hidden; height: 100vh; user-select: none; }
  canvas { display: block; width: 100%; height: 100%; cursor: pointer; }
  .bar { position: absolute; top: 12px; left: 12px; background: rgba(15,23,42,0.85); border: 1px solid #334155; padding: 8px 12px; border-radius: 8px; font-size: 12px; display: flex; gap: 10px; align-items: center; }
  button { background: #38bdf8; color: #0f172a; border: none; padding: 4px 10px; border-radius: 5px; font-weight: 600; font-size: 11px; cursor: pointer; }
</style>
</head>
<body>
<div class="bar">
  <span><strong>Latent Field</strong> &bull; Drag nodes or click</span>
  <button id="burst">Burst</button>
</div>
<canvas id="c"></canvas>
<script>
  const c = document.getElementById('c');
  const ctx = c.getContext('2d');
  let w, h;
  function resize() { w = c.width = window.innerWidth; h = c.height = window.innerHeight; }
  window.addEventListener('resize', resize);
  resize();

  const poles = [
    { x: w * 0.3, y: h * 0.45, color: '#f43f5e', label: 'Creative' },
    { x: w * 0.7, y: h * 0.55, color: '#38bdf8', label: 'Precise' }
  ];
  let drag = null;
  const pts = Array.from({length: 180}, () => ({
    x: Math.random() * w, y: Math.random() * h, vx: 0, vy: 0
  }));

  c.onmousedown = (e) => {
    const r = c.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    for (const p of poles) {
      if (Math.hypot(p.x - mx, p.y - my) < 24) { drag = p; return; }
    }
    for (let i = 0; i < 15; i++) pts.push({ x: mx, y: my, vx: (Math.random()-0.5)*5, vy: (Math.random()-0.5)*5 });
    if (pts.length > 260) pts.splice(0, 15);
  };
  window.onmousemove = (e) => {
    if (!drag) return;
    const r = c.getBoundingClientRect();
    drag.x = e.clientX - r.left; drag.y = e.clientY - r.top;
  };
  window.onmouseup = () => drag = null;
  document.getElementById('burst').onclick = () => {
    for (let i = 0; i < 25; i++) pts.push({ x: w/2, y: h/2, vx: (Math.random()-0.5)*8, vy: (Math.random()-0.5)*8 });
    if (pts.length > 260) pts.splice(0, 25);
  };

  function loop() {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#818cf8';
    for (const pt of pts) {
      for (const p of poles) {
        const dx = p.x - pt.x, dy = p.y - pt.y;
        const d2 = dx*dx + dy*dy + 1200;
        const f = 140 / d2;
        pt.vx += dx / Math.sqrt(d2) * f;
        pt.vy += dy / Math.sqrt(d2) * f;
      }
      pt.vx *= 0.95; pt.vy *= 0.95;
      pt.x += pt.vx; pt.y += pt.vy;
      if (pt.x < 0 || pt.x > w || pt.y < 0 || pt.y > h) {
        pt.x = Math.random() * w; pt.y = Math.random() * h;
      }
      ctx.beginPath(); ctx.arc(pt.x, pt.y, 2, 0, Math.PI*2); ctx.fill();
    }
    for (const p of poles) {
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, 14, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(p.label, p.x, p.y - 20);
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
</script>
</body>
</html>`,
  },
  {
    id: 'lovable-reasoning-tree',
    title: 'Agent Tree-of-Thought Visualizer',
    author: 'Julian Vance',
    tool: 'Lovable',
    description: 'Interactive reasoning tree prototype showing how an autonomous agent scores and prunes decision branches. Click "+ Add Branch" to grow the tree.',
    type: 'code',
    prompt: 'Build an interactive Tree-of-Thought node graph where clicking buttons adds evaluated decision branches.',
    createdAt: '2026-02-24',
    code: `<!DOCTYPE html>
<html>
<head>
<style>
  body { margin: 0; background: #090d16; color: #f1f5f9; font-family: system-ui, sans-serif; height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
  .top { padding: 10px 14px; background: #111827; border-bottom: 1px solid #1f2937; display: flex; justify-content: space-between; align-items: center; font-size: 12px; }
  .btns { display: flex; gap: 6px; }
  button { background: #2563eb; color: #fff; border: none; padding: 5px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; }
  button.alt { background: #374151; }
  svg { flex: 1; width: 100%; height: 100%; }
</style>
</head>
<body>
<div class="top">
  <span><strong>Tree-of-Thought</strong> (Click a node or add branch)</span>
  <div class="btns">
    <button id="addBtn">+ Explore Branch</button>
    <button id="resetBtn" class="alt">Reset</button>
  </div>
</div>
<svg id="svg"></svg>
<script>
  const svg = document.getElementById('svg');
  const baseNodes = [
    { id: 0, x: 90, y: 105, label: 'Root Goal', score: '0.95', color: '#38bdf8' },
    { id: 1, parent: 0, x: 250, y: 55, label: 'Path A (Pruned)', score: '0.38', color: '#ef4444' },
    { id: 2, parent: 0, x: 250, y: 155, label: 'Path B (Active)', score: '0.91', color: '#22c55e' }
  ];
  let nodes = JSON.parse(JSON.stringify(baseNodes));

  function draw() {
    svg.innerHTML = '';
    nodes.forEach(n => {
      if (n.parent !== undefined) {
        const p = nodes.find(x => x.id === n.parent);
        if (p) {
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', p.x); line.setAttribute('y1', p.y);
          line.setAttribute('x2', n.x); line.setAttribute('y2', n.y);
          line.setAttribute('stroke', n.color); line.setAttribute('stroke-width', '2');
          svg.appendChild(line);
        }
      }
    });
    nodes.forEach(n => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.style.cursor = 'pointer';
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', n.x); c.setAttribute('cy', n.y); c.setAttribute('r', '18');
      c.setAttribute('fill', '#1e293b'); c.setAttribute('stroke', n.color); c.setAttribute('stroke-width', '3');
      g.appendChild(c);

      const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t.setAttribute('x', n.x); t.setAttribute('y', n.y + 4);
      t.setAttribute('text-anchor', 'middle'); t.setAttribute('fill', '#fff');
      t.setAttribute('font-size', '10'); t.setAttribute('font-weight', 'bold');
      t.textContent = n.score;
      g.appendChild(t);

      const l = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      l.setAttribute('x', n.x); l.setAttribute('y', n.y + 32);
      l.setAttribute('text-anchor', 'middle'); l.setAttribute('fill', '#94a3b8');
      l.setAttribute('font-size', '10');
      l.textContent = n.label;
      g.appendChild(l);

      g.onclick = () => addChild(n);
      svg.appendChild(g);
    });
  }

  function addChild(parent) {
    const score = (Math.random() * 0.5 + 0.45).toFixed(2);
    nodes.push({
      id: nodes.length,
      parent: parent.id,
      x: Math.min(480, parent.x + 130),
      y: Math.max(40, Math.min(240, parent.y + (Math.random() - 0.5) * 110)),
      label: 'Step ' + nodes.length,
      score: score,
      color: score > 0.7 ? '#22c55e' : '#eab308'
    });
    draw();
  }

  document.getElementById('addBtn').onclick = () => {
    const p = nodes[nodes.length - 1];
    addChild(p);
  };
  document.getElementById('resetBtn').onclick = () => {
    nodes = JSON.parse(JSON.stringify(baseNodes));
    draw();
  };
  draw();
</script>
</body>
</html>`,
  },
  {
    id: 'claude-attention-viz',
    title: 'Transformer Attention Token Inspector',
    author: 'Sarah Lin',
    tool: 'Claude',
    description: 'Hover or click tokens to see live self-attention weights across a sentence. Built with a single Claude Artifact prompt.',
    type: 'code',
    prompt: 'Create a self-attention token weight visualizer where clicking a word highlights its attention distribution.',
    createdAt: '2026-03-01',
    code: `<!DOCTYPE html>
<html>
<head>
<style>
  body { margin: 0; background: #0f172a; color: #f8fafc; font-family: system-ui, sans-serif; padding: 16px; }
  .hint { font-size: 11px; color: #94a3b8; margin-bottom: 10px; }
  .tokens { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
  .tok { padding: 6px 10px; border-radius: 6px; background: #1e293b; border: 1px solid #334155; cursor: pointer; font-family: monospace; font-size: 12px; }
  .row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; font-family: monospace; font-size: 11px; }
  .track { flex: 1; background: #1e293b; height: 8px; border-radius: 4px; overflow: hidden; }
  .fill { height: 100%; background: #38bdf8; transition: width 0.2s; }
</style>
</head>
<body>
  <div class="hint"><strong>Self-Attention Head #2</strong> &mdash; Click or hover any token:</div>
  <div class="tokens" id="toks"></div>
  <div id="bars"></div>
<script>
  const words = ["Labs", "prototype", "faster", "using", "vibecoded", "artifacts"];
  const mat = [
    [0.50, 0.20, 0.05, 0.05, 0.10, 0.10],
    [0.25, 0.40, 0.15, 0.05, 0.05, 0.10],
    [0.05, 0.45, 0.30, 0.05, 0.05, 0.10],
    [0.05, 0.15, 0.10, 0.40, 0.15, 0.15],
    [0.05, 0.10, 0.05, 0.10, 0.40, 0.30],
    [0.10, 0.20, 0.05, 0.05, 0.25, 0.35]
  ];
  const toks = document.getElementById('toks');
  const bars = document.getElementById('bars');

  function select(idx) {
    const w = mat[idx];
    document.querySelectorAll('.tok').forEach((el, i) => {
      el.style.background = i === idx ? '#0284c7' : 'rgba(56, 189, 248, ' + (w[i]*1.2) + ')';
    });
    bars.innerHTML = words.map((word, i) =>
      '<div class="row"><span style="width:75px">' + word + '</span>' +
      '<div class="track"><div class="fill" style="width:' + (w[i]*100) + '%"></div></div>' +
      '<span style="width:36px;text-align:right">' + Math.round(w[i]*100) + '%</span></div>'
    ).join('');
  }
  words.forEach((w, i) => {
    const b = document.createElement('div');
    b.className = 'tok'; b.textContent = w;
    b.onmouseenter = () => select(i); b.onclick = () => select(i);
    toks.appendChild(b);
  });
  select(1);
</script>
</body>
</html>`,
  },
];
