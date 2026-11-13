/**
 * A `page` key outside its sub-block is reported, not dropped.
 *
 * `page { nudge_px = 0; }` used to parse, validate and render with
 * curves still nudged: the setting lives in `page { curves { nudge_px } }`
 * and the top-level form was read into a placeholder and thrown away.
 */

import { describe, it, expect } from 'vitest';
import { process as parse } from '@tc/index';

const diags = (page: string): string[] => {
  const r = parse(`page { ${page} }`);
  return [...r.parseErrors, ...r.diagnostics].map((d) => `${d.code}: ${d.message}`);
};

describe('a page key in the wrong place', () => {
  it('names the sub-block it belongs in', () => {
    expect(diags('nudge_px = 0;')).toContainEqual(
      'UNKNOWN_KEY: the page does not accept "nudge_px" directly; it belongs in curves { nudge_px }');
  });

  it('reports a word the page does not know at all', () => {
    expect(diags('foo = 1;').join('\n')).toMatch(/UNKNOWN_KEY: the page does not accept "foo"/);
  });

  it('reports a sub-block the page does not have', () => {
    expect(diags('bogus { a = 1; }').join('\n')).toMatch(/UNKNOWN_KEY: the page does not accept "bogus"/);
  });

  it('accepts its own keys and sub-blocks without comment', () => {
    expect(diags('size = "A4"; orientation = "landscape"; border = true; curves { nudge_px = 0; }'))
      .toEqual([]);
  });
});
