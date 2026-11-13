/**
 * `I_cutoff` is inclusive, and a computed current at it counts as at it.
 *
 * A grade at exactly a high-set's 9 kA cutoff reported 0.250 s on the
 * declared row and "worst 0.230 s at 9000 A" overall: the range sweep's
 * last sample was 9000.000000000004 A, past the cutoff by rounding, so
 * the high-set dropped out at its own boundary.
 */

import { describe, expect, it } from 'vitest';
import { process as run } from '@tc/index';

const STUDY = `
meta { margin = 300 ms; }
system { voltages { MV { V = 33 kV; } } }
faults { F { type = three_phase; voltage = MV; I = 9 kA; I_min = 5.5 kA; I_max = 9 kA; } }
relay R_F { voltage = MV; ct_ratio = 600/1; element 51 { stages {
  stage IDMT { curve = iec.vi; I_pickup = 300 A; tms = 0.15; }
  stage HIGH { curve = definite; I_pickup = 3.6 kA; t_delay = 50 ms; I_cutoff = 9 kA; } } } }
relay R_I { voltage = MV; ct_ratio = 1200/1; element 51 { stages {
  stage IDMT { curve = iec.si; I_pickup = 900 A; tms = 0.3; }
  stage HIGH { curve = definite; I_pickup = 8 kA; t_delay = 300 ms; } } } }
grade { primary = R_F:51; backup = R_I:51; fault = F; }
`;

describe('a grade at exactly the cutoff', () => {
  it('reports one margin for one current', () => {
    const g = run(STUDY).reports[0];
    expect(g.achieved_margin_s).toBeCloseTo(0.25, 6);
    expect(g.min_margin_s).toBeCloseTo(0.25, 6);
  });

  it('is not told it is beyond the cutoff', () => {
    expect(run(STUDY).reports[0].diagnostics.map((d) => d.code)).not.toContain('GRADE_BEYOND_CUTOFF');
  });
});
