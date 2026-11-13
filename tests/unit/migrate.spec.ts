/**
 * Old forms are rewritten, not just refused.
 *
 * The language keeps one way to say each thing, so a renamed key or a
 * removed form is an error. `migrate` applies the rewrite the parser
 * attaches to each one whose meaning is certain, so last year's study
 * opens as this year's without anyone retyping it.
 */

import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { migrate, process as parse } from '@tc/index';
import { main } from '../../src/cli.js';

const errorsIn = (src: string): string[] => {
  const r = parse(src);
  return [...r.parseErrors, ...r.diagnostics].filter((d) => d.severity === 'error')
    .map((d) => `${d.code}: ${d.message}`);
};

describe('a renamed key', () => {
  it('takes its new name and the unit its old name carried', () => {
    const { text } = migrate('faults { F { I_A = 4500; type = three_phase; } }');
    expect(text).toBe('faults { F { I = 4500 A; type = three_phase; } }');
  });

  it('keeps a unit the value already states', () => {
    expect(migrate('faults { F { I_A = 4.5 kA; type = three_phase; } }').text)
      .toBe('faults { F { I = 4.5 kA; type = three_phase; } }');
  });

  it('reads I_pu as amps, which is what a bare value meant', () => {
    expect(migrate('relay R { element 51 { curve = iec.si; I_pu = 400; tms = 0.1; } }').text)
      .toContain('I_pickup = 400 A;');
  });

  it('gives a time key seconds', () => {
    expect(migrate('grade { CTI_min_s = 0.3; }').text).toBe('grade { margin = 0.3 s; }');
  });

  it('renames current_max on an element and leaves a view\'s alone', () => {
    const src = 'relay R { element 51 { curve = iec.si; I_pickup = 4 A; tms = 0.1; current_max = 40 A; } }\n'
      + 'view V { current_min = 1 A; current_max = 1 kA; }';
    const { text } = migrate(src);
    expect(text).toContain('I_cutoff = 40 A;');
    expect(text).toContain('view V { current_min = 1 A; current_max = 1 kA; }');
  });
});

describe('a percentage', () => {
  it('states its unit, which a bare number always meant', () => {
    expect(migrate('relay R { element 51 { curve = iec.si; I_pickup = 4 A; tms = 0.1; share = 50; } }').text)
      .toContain('share = 50 %;');
  });

  it('turns tolerance_pct into tolerance with %', () => {
    expect(migrate('grade { tolerance_pct = 5; solve { tolerance_pct = 2; } }').text)
      .toBe('grade { tolerance = 5 %; solve { tolerance = 2 %; } }');
  });

  it('is an error until it is written with %', () => {
    const codes = parse('relay R { element 51 { curve = iec.si; I_pickup = 4 A; tms = 0.1; share = 50; } }')
      .parseErrors.map((e) => e.code);
    expect(codes).toContain('UNIT_MISSING');
  });
});

describe('a block inside a view', () => {
  const NESTED = [
    '# the phase sheet',
    'view "Phase sheet" {',
    '    quantity = phase;',
    '    times {',
    '        T1 {',
    '            t = 200 ms;   # bus clearance',
    '        }',
    '        T2 { t = 500 ms; }',
    '    }',
    '    point "P" { I = 1 kA; t = 2 s; }',
    '}',
    '',
  ].join('\n');

  it('moves to the top level, scoped to the view, in source order', () => {
    expect(migrate(NESTED).text).toBe([
      '# the phase sheet',
      'view "Phase sheet" {',
      '    quantity = phase;',
      '}',
      '',
      'times {',
      '    T1 {',
      '        views = ["Phase sheet"];',
      '        t = 200 ms;   # bus clearance',
      '    }',
      '    T2 { views = ["Phase sheet"]; t = 500 ms; }',
      '}',
      '',
      'point "P" { views = ["Phase sheet"]; I = 1 kA; t = 2 s; }',
      '',
    ].join('\n'));
  });

  it('leaves no error behind', () => {
    expect(errorsIn(migrate(NESTED).text)).toEqual([]);
  });
});

describe('migration as a whole', () => {
  it('is idempotent', () => {
    const once = migrate('faults { F { I_A = 4500; type = three_phase; } }\nview V { point P { I = 1 kA; t = 1 s; } }').text;
    expect(migrate(once)).toEqual({ text: once, changes: [] });
  });

  it('leaves an old form with no safe rewrite for the author', () => {
    /* A removed key whose value nothing read: dropping it loses what the author wrote. */
    const src = 'system { frequency_Hz = 50; }';
    expect(migrate(src).text).toBe(src);
  });

  it('has nothing to do on any shipped example', () => {
    for (const f of readdirSync('examples').filter((n) => n.endsWith('.ptc'))) {
      expect(migrate(readFileSync(join('examples', f), 'utf8')).changes, f).toEqual([]);
    }
  });
});

describe('tc-curves migrate', () => {
  const file = (src: string): string => {
    const p = join(mkdtempSync(join(tmpdir(), 'tc-migrate-')), 'study.ptc');
    writeFileSync(p, src);
    return p;
  };

  it('--check exits 1 when something would change, and writes nothing', async () => {
    const p = file('grade { CTI_min_s = 0.3; }');
    expect(await main(['migrate', p, '--check', '-q'])).toBe(1);
    expect(readFileSync(p, 'utf8')).toBe('grade { CTI_min_s = 0.3; }');
  });

  it('rewrites in place, after which --check passes', async () => {
    const p = file('grade { CTI_min_s = 0.3; }');
    expect(await main(['migrate', p, '-q'])).toBe(0);
    expect(readFileSync(p, 'utf8')).toBe('grade { margin = 0.3 s; }');
    expect(await main(['migrate', p, '--check', '-q'])).toBe(0);
  });
});

describe('a delay with no curve', () => {
  it('says curve = definite, which is what it always meant', () => {
    const old = 'relay R { element 50 { I_pickup = 4 kA; t_delay = 50 ms; } }';
    expect(parse(old).parseErrors.map((e) => e.code)).toContain('REMOVED_KEY');
    expect(migrate(old).text).toBe('relay R { element 50 { I_pickup = 4 kA; curve = definite; t_delay = 50 ms; } }');
  });

  it('is not charged to an element whose stages inherit it', () => {
    const src = `relay R { element 51 { t_delay = 300 ms; stages {
      stage A { curve = iec.si; I_pickup = 400 A; tms = 0.1; }
      stage B { curve = definite; I_pickup = 4 kA; } } } }`;
    expect(migrate(src).changes).toEqual([]);
  });
});

describe('a missing semicolon', () => {
  it('is reported and inserted, before the next statement or the closing brace', () => {
    const old = 'view V {\n  axis = secondary\n  current_min = 83 mA;\n}\ndevice D { kind = fuse; views = [ V ] }';
    expect(parse(old).parseErrors.filter((e) => e.code === 'MISSING_SEMICOLON')).toHaveLength(2);
    expect(migrate(old).text)
      .toBe('view V {\n  axis = secondary;\n  current_min = 83 mA;\n}\ndevice D { kind = fuse; views = [ V ]; }');
  });

  it('is not asked for after a closing brace', () => {
    expect(parse('page { legend { show = true; } axes { frame = true; } }').parseErrors
      .map((e) => e.code)).not.toContain('MISSING_SEMICOLON');
  });
});
