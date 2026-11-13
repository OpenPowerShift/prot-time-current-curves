/**
 * Mistakes the blind skill evaluation found the tool letting through.
 *
 * Two agents given only `docs/skill.adoc` wrote ten studies; each of
 * these is something they did that the tool accepted in silence, or
 * told them in terms they could not act on.
 */

import { describe, expect, it } from 'vitest';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { process as run } from '@tc/index';
import { main } from '../../src/cli.js';

const SYS = 'system { voltages { MV { V = 11 kV; } } }\n';
const all = (src: string) => {
  const r = run(src);
  return [...r.parseErrors, ...r.diagnostics, ...r.reports.flatMap((g) => g.diagnostics)];
};

describe('a fault', () => {
  it('with a misspelt type is refused', () => {
    expect(all(`${SYS}faults { F { I = 1 kA; type = bogus_kind; voltage = MV; } }`).map((d) => d.code))
      .toContain('VALUE_UNKNOWN');
  });

  it('with no I is told what I is, not "I = NaN"', () => {
    const d = all(`${SYS}faults { F { I_min = 4 kA; I_max = 9 kA; voltage = MV; type = three_phase; } }`)
      .find((x) => x.code === 'FAULT_CURRENT_INVALID');
    expect(d?.message).toMatch(/gives no I -- the current it is graded at/);
    expect(d?.message).not.toMatch(/NaN/);
  });
});

describe('a device', () => {
  it('takes a name, as a relay does', () => {
    const src = `${SYS}device F_100T { name = "100 A fuse"; kind = fuse; voltage = MV;
      min_melt = [(200 A, 10 s), (800 A, 0.14 s)]; total_clear = [(200 A, 16 s), (800 A, 0.26 s)]; }`;
    expect(all(src).map((d) => d.code)).not.toContain('UNKNOWN_KEY');
    expect(run(src).study!.devices.get('F_100T')!.name).toBe('100 A fuse');
  });
});

const CHAIN = (extra: string): string => `${SYS}
faults { F { I = 2.5 kA; voltage = MV; type = three_phase; } }
device F_100T { kind = fuse; voltage = MV;
  min_melt = [(200 A, 10 s), (800 A, 0.14 s)]; total_clear = [(200 A, 16 s), (800 A, 0.26 s)]; }
relay R { voltage = MV; ct_ratio = 400/5; element 51 { curve = iec.vi; I_pickup = 300 A; tms = 0.2; } }
grade { primary = F_100T; backup = R:51; fault = F; ${extra} }`;

describe('a grade', () => {
  it('read past the end of a fuse table says so', () => {
    expect(all(CHAIN('margin = 0.25 s;')).map((d) => d.code)).toContain('DEVICE_BEYOND_TABLE');
  });

  it('with no margin says it has no verdict', () => {
    expect(all(CHAIN('')).map((d) => d.code)).toContain('GRADE_NOT_EVALUATED');
  });
});

describe('tc-curves check', () => {
  it('prints what grading found, not only what validation found', async () => {
    const p = join(mkdtempSync(join(tmpdir(), 'tc-check-')), 's.ptc');
    writeFileSync(p, CHAIN(''));
    const lines: string[] = [];
    const log = console.log;
    console.log = (...a: unknown[]) => { lines.push(a.join(' ')); };
    try { await main(['check', p]); } finally { console.log = log; }
    expect(lines.join('\n')).toMatch(/GRADE_NOT_EVALUATED: grade F_100T \/ R:51/);
  });
});
