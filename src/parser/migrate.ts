/**
 * Rewrite a study's old forms into current ones.
 *
 * The language keeps one way to say each thing, so a renamed key or a
 * removed form is an error -- but a study written last year must not
 * break for it. Where the parser recognises an old form whose rewrite
 * preserves meaning exactly, it attaches that rewrite to the error
 * (`ParseError.fix`). This applies them.
 *
 * The parser is the only place that knows the context -- `current_max`
 * is an old spelling on an element and a current one on a view -- so
 * the rules live there, beside the diagnostics they fix, and this file
 * holds none of its own.
 *
 * An old form with no safe rewrite (a value the old reader ignored,
 * whose intent cannot be inferred) carries no fix and is left for the
 * author: it stays an error.
 */

import { parse } from './parser.js';
import type { TextEdit } from './ast.js';

export interface Migration {
  /** The rewritten source; identical to the input when nothing applied. */
  text: string;
  /** One line per rewrite, in source order, from the error it fixed. */
  changes: string[];
}

/*
 * A fix can expose another (a block moved out of a view may itself use
 * an old key), so the pass repeats until it settles. Every rule removes
 * the form it matches, so this converges well inside the bound; the
 * bound is there so that a rule that does not cannot hang the editor.
 */
const MAX_PASSES = 8;

export function migrate(source: string): Migration {
  let text = source;
  const changes: string[] = [];

  for (let pass = 0; pass < MAX_PASSES; pass++) {
    const fixed = parse(text).errors.filter((e) => e.fix && e.fix.length > 0);
    if (fixed.length === 0) break;

    /*
     * Each fix is taken whole or not at all: a block move is a cut and
     * an insert, and applying one without the other would lose the
     * block. A fix whose edits overlap one already taken waits for the
     * next pass, which re-parses the text the first one produced.
     */
    const taken: Array<{ start: number; end: number }> = [];
    const overlaps = (e: TextEdit): boolean => taken.some((r) =>
      e.length === 0
        ? e.offset > r.start && e.offset < r.end
        : e.offset < r.end && e.offset + e.length > r.start);
    const edits: Array<TextEdit & { seq: number }> = [];
    const applied: string[] = [];
    for (const err of fixed) {
      if (err.fix!.some(overlaps)) continue;
      for (const e of err.fix!) {
        taken.push({ start: e.offset, end: e.offset + e.length });
        edits.push({ ...e, seq: edits.length });
      }
      applied.push(err.message);
    }
    if (applied.length === 0) break;

    /*
     * Applied end-first so earlier offsets stay valid. Several
     * insertions at one offset (blocks moved out of one view) keep
     * their source order only if the last is applied first, since each
     * lands in front of the ones already there.
     */
    edits.sort((a, b) => b.offset - a.offset || b.length - a.length || b.seq - a.seq);
    for (const e of edits) {
      text = text.slice(0, e.offset) + e.text + text.slice(e.offset + e.length);
    }
    changes.push(...applied);
  }

  return { text, changes };
}
