import test from 'node:test';
import assert from 'node:assert/strict';
import {
  detectImportInput,
  validateSimpleProject,
  filterSimpleProjects,
  generateStandaloneRootHtml,
} from './projectHelpers';
import { SimpleProject } from '../types/project';

test('detectImportInput detects Lovable URLs, Claude URLs, and pasted HTML code', () => {
  assert.deepEqual(detectImportInput('https://my-app.lovable.app'), {
    type: 'url',
    tool: 'Lovable',
  });
  assert.deepEqual(detectImportInput('https://claude.site/artifacts/123'), {
    type: 'url',
    tool: 'Claude',
  });
  assert.deepEqual(detectImportInput('https://v0.dev/chat/xyz'), {
    type: 'url',
    tool: 'v0',
  });
  assert.deepEqual(
    detectImportInput('<!DOCTYPE html><html><body>Hello</body></html>'),
    {
      type: 'code',
      tool: 'Claude',
    }
  );
});

test('validateSimpleProject checks title and content', () => {
  assert.equal(validateSimpleProject({ title: '', content: '<h1>Hi</h1>' }).valid, false);
  assert.equal(validateSimpleProject({ title: 'Demo', content: '' }).valid, false);
  assert.equal(
    validateSimpleProject({ title: 'My Claude Demo', content: '<h1>Hi</h1>' }).valid,
    true
  );
});

test('filterSimpleProjects filters by search query and tool', () => {
  const sample: SimpleProject[] = [
    {
      id: '1',
      title: 'Particle Sim',
      author: 'Alice',
      tool: 'Claude',
      description: 'Vector field simulator',
      type: 'code',
      code: '<div>1</div>',
      createdAt: '2026-03-01',
    },
    {
      id: '2',
      title: 'Agent Tree',
      author: 'Bob',
      tool: 'Lovable',
      description: 'Decision tree',
      type: 'url',
      url: 'https://agent.lovable.app',
      createdAt: '2026-03-02',
    },
  ];

  assert.equal(filterSimpleProjects(sample, '', 'All').length, 2);
  assert.equal(filterSimpleProjects(sample, '', 'Lovable').length, 1);
  assert.equal(filterSimpleProjects(sample, 'vector', 'All').length, 1);
});

test('generateStandaloneRootHtml outputs valid self-contained HTML for main/root branch', () => {
  const html = generateStandaloneRootHtml([
    {
      id: '1',
      title: 'Test App',
      author: 'Maya',
      tool: 'Claude',
      description: 'Simple test',
      type: 'code',
      code: '<h1>Hello</h1>',
      createdAt: '2026-03-01',
    },
  ]);
  assert.ok(html.includes('<!DOCTYPE html>'));
  assert.ok(html.includes('Test App'));
  assert.ok(html.includes('Hosted on GitHub Pages (main / root)'));
});
