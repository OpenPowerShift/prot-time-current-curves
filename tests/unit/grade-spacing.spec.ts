/**
 * `grade { below; middle; above; spacing }` places the middle curve a
 * fraction of the way, in seconds at the fault, from below to above.
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { process } from '@tc/index';
import { tTripStage } from '@tc/semantics/curves';

const STUDY = (grade: string): string => `
meta { margin = 300 ms; }
system { voltages { MV { V = 33 kV; } } }
faults { F { I = 850 A; voltage = MV; type = three_phase; } }
relay R_RMU { voltage = MV; ct_ratio = 300/1; element 51P { curve = iec.si; I_pickup = 90 A; tms = 0.10; } }
relay R_FDR { voltage = MV; ct_ratio = 800/1; element 51P { curve = iec.si; I_pickup = 300 A; tms = 0.05; } }
relay R_INC { voltage = MV; ct_ratio = 2500/1; element 51P { curve = iec.si; I_pickup = 400 A; tms = 0.5; } }
grade { ${grade} }
`;

const placed = (pct: number) => {
  const r = process(STUDY(`below = R_RMU:51P; middle = R_FDR:51P; above = R_INC:51P; fault = F; spacing = ${pct} %;`));
  const t = (id: string) => tTripStage(r.study!.relays.get(id)!.elements[0].stages[0], 850);
  return { r, frac: (t('R_FDR') - t('R_RMU')) / (t('R_INC') - t('R_RMU')) };
};

describe('placing the middle curve', () => {
  it.each([25, 50, 75])('puts it %i %% of the way up, to the dial step', (pct) => {
    const { r, frac } = placed(pct);
    expect([...r.parseErrors, ...r.diagnostics].filter((d) => d.severity === 'error')).toEqual([]);
    expect(frac).toBeCloseTo(pct / 100, 1);
  });

  it('reports two pairs, each checked against margin', () => {
    const { r } = placed(50);
    expect(r.reports.map((g) => `${g.primaryRef}/${g.backupRef}`)).toEqual(['R_RMU:51P/R_FDR:51P', 'R_FDR:51P/R_INC:51P']);
    expect(r.reports.every((g) => g.pass === true)).toBe(true);
    expect(r.reports[0].spacing?.pct).toBe(50);
  });

  it('fails a pair the spacing squeezes below margin', () => {
    const { r } = placed(2);
    expect(r.reports[0].pass).toBe(false);
  });
});

describe('the shape', () => {
  const codes = (grade: string) => {
    const r = process(STUDY(grade));
    return [...r.parseErrors, ...r.diagnostics].map((d) => d.code);
  };

  it('may not be mixed with primary/backup', () => {
    expect(codes('primary = R_RMU:51P; below = R_RMU:51P; middle = R_FDR:51P; above = R_INC:51P; fault = F; spacing = 50 %;'))
      .toContain('GRADE_SHAPE');
  });

  it('needs spacing, in range, as a percentage', () => {
    expect(codes('below = R_RMU:51P; middle = R_FDR:51P; above = R_INC:51P; fault = F;')).toContain('GRADE_SHAPE');
    expect(codes('below = R_RMU:51P; middle = R_FDR:51P; above = R_INC:51P; fault = F; spacing = 150 %;')).toContain('GRADE_SHAPE');
    expect(codes('below = R_RMU:51P; middle = R_FDR:51P; above = R_INC:51P; fault = F; spacing = 200 ms;')).toContain('UNIT_WRONG_QUANTITY');
  });

  it('names the missing side in its own words', () => {
    const r = process(STUDY('below = R_RMU:51P; middle = R_FDR:51P; fault = F; spacing = 50 %;'));
    expect(r.diagnostics.map((d) => d.message)).toContain('grade block declares no above');
  });
});

describe('a time in meta', () => {
  it('is read in seconds, so margin = 300 ms is 0.3 s', () => {
    const r = process(readFileSync('examples/19-even-spacing.ptc', 'utf8'));
    expect(r.reports.every((g) => g.pass === true)).toBe(true);
    expect(r.study!.meta.margin).toBeCloseTo(0.3, 9);
  });
});
