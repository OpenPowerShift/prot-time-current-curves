/**
 * Check a folder of AI-written studies against the language.
 *
 *   npx tsx scripts/skill-eval/evaluate.ts <dir> [--png]
 *
 * For each `*.ptc`: parse, validate and grade; count diagnostics by
 * code and severity; with `--png`, render every sheet beside it for a
 * visual review. Writes `<dir>/summary.md`. Exit 0 always: this is a
 * survey of mistakes, not a gate.
 */

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, basename } from 'node:path';
import { process as run, renderStudy } from '../../src/index.js';
import { exportPng } from '../../src/export/export-png.js';

const dir = process.argv[2];
const png = process.argv.includes('--png');
if (!dir) {
  console.error('usage: evaluate.ts <dir-of-studies> [--png]');
  process.exit(2);
}

const tally = new Map<string, { severity: string; files: Set<string>; example: string }>();
const rows: string[] = [];

for (const file of readdirSync(dir).filter((f) => f.endsWith('.ptc')).sort()) {
  const src = readFileSync(join(dir, file), 'utf8');
  const r = run(src);
  const findings = [...r.parseErrors, ...r.diagnostics];
  for (const d of findings) {
    const t = tally.get(d.code) ?? { severity: d.severity, files: new Set(), example: d.message };
    t.files.add(file);
    tally.set(d.code, t);
  }
  const errors = findings.filter((d) => d.severity === 'error').length;
  const warnings = findings.filter((d) => d.severity === 'warning').length;
  const grades = r.reports.map((g) => (g.pass === false ? 'FAIL' : g.pass ? 'pass' : '-')).join(' ');
  rows.push(`| ${file} | ${errors} | ${warnings} | ${grades || '(none)'} |`);

  if (png && r.study) {
    const views = r.study.views.length > 0 ? r.study.views : [undefined];
    for (const [i, view] of views.entries()) {
      const svg = renderStudy(r, { theme: 'light', view } as never);
      const out = join(dir, `${basename(file, '.ptc')}-${i + 1}.png`);
      writeFileSync(out, await exportPng(svg, { width: 1600 } as never));
    }
  }
}

const byCount = [...tally.entries()].sort((a, b) => b[1].files.size - a[1].files.size);
const summary = [
  '# Skill evaluation',
  '',
  '| Study | Errors | Warnings | Grades |',
  '|---|---|---|---|',
  ...rows,
  '',
  '## Findings by code (studies affected)',
  '',
  '| Code | Severity | Studies | Example |',
  '|---|---|---|---|',
  ...byCount.map(([code, t]) =>
    `| ${code} | ${t.severity} | ${t.files.size} (${[...t.files].join(', ')}) | ${t.example.replace(/\|/g, '\\|')} |`),
  '',
].join('\n');
writeFileSync(join(dir, 'summary.md'), summary);
console.log(summary);
