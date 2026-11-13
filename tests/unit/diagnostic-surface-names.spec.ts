/**
 * Messages name keys as the author writes them.
 *
 * The model carries unit-suffixed field names (`I_A`, `min_A`,
 * `t_delay_s`, `I_pu_A`, `current_pct`), and messages built from it
 * kept leaking them: "declares only I_A; min_A and max_A default to it"
 * names three keys that do not exist in the language. A reader -- or an
 * AI fixing the file -- then writes `I_min_A` or goes looking for a key
 * that is not there.
 *
 * Static rather than per-diagnostic: most messages are only reachable
 * through a specific malformed study, so a test that triggers each one
 * would cover a fraction of them. This reads every string literal in
 * the code that builds messages and refuses an internal name in any of
 * them. Interpolations are dropped first -- `${fault.I_A}` is a value,
 * not a name the reader sees.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';

const SOURCES = [
  ...readdirSync('src/semantics').filter((f) => f.endsWith('.ts')).map((f) => join('src/semantics', f)),
  'src/parser/parser.ts',
  'src/cli.ts',
];

/** Internal names that are never what an author types. */
const INTERNAL = new RegExp(
  '\\b(?:'
  + [
    'I_A', 'I1_A', 'I2_A', 'I0_A', 'earth_A',
    'min_A', 'max_A', '[A-Za-z0-9]+_(?:min|max)_A',
    't_s', 't_delay_s', 'at_t_s', 'at_[A-Za-z0-9]+_A',
    'I_pu', 'I_pu_A', 'I_cutoff_A',
    'margin_s', 'CTI_min_s', 'CTI_min',
    'current_pct', 'tolerance_pct',
    'rating_A', 'rating_kV', 'rating_MVA',
  ].join('|')
  + ')\\b',
);

/*
 * Only literals with a space in them are prose. A bare `'I_A'` is a
 * field lookup or the old spelling the rename table must recognise --
 * code, not something a reader is shown.
 */
const isProse = (text: string): boolean => /\s/.test(text.trim());

/**
 * Every string and template literal, read with the TypeScript parser so
 * comments, regex literals and nesting cannot confuse it. Interpolated
 * expressions are dropped: only the text a reader would see is kept.
 */
function literals(file: string): Array<{ text: string; line: number }> {
  const sf = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
  const out: Array<{ text: string; line: number }> = [];
  const push = (node: ts.Node, text: string): void => {
    out.push({ text, line: sf.getLineAndCharacterOfPosition(node.getStart()).line + 1 });
  };
  const visit = (node: ts.Node): void => {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      push(node, node.text);
    } else if (ts.isTemplateExpression(node)) {
      push(node, [node.head.text, ...node.templateSpans.map((s) => s.literal.text)].join(' '));
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return out;
}

describe('diagnostic and report text', () => {
  it('never names an internal field', () => {
    const leaks: string[] = [];
    for (const file of SOURCES) {
      for (const { text, line } of literals(file)) {
        if (!isProse(text)) continue;
        if (INTERNAL.test(text)) leaks.push(`${file}:${line}  ${text}`);
      }
    }
    expect(leaks).toEqual([]);
  });
});
