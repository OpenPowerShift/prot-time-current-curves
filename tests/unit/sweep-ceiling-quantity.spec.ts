/**
 * The upstream sweep stops at the largest fault in the quantity graded.
 *
 * An earth pair graded at 1.2 kA residual was swept up to the 7 kA
 * phase fault, as though 7 kA of residual could flow, and failed there.
 */

import { describe, expect, it } from 'vitest';
import { process as run } from '@tc/index';

const STUDY = `
meta { margin = 300 ms; }
system { voltages { MV { V = 11 kV; } } }
faults {
  F_PH { type = three_phase; voltage = MV; I = 7 kA; }
  F_E  { type = single_phase_earth; voltage = MV; I = 1.2 kA; residual = 1.2 kA; }
}
relay R_F { voltage = MV; ct_ratio = 300/1;
  element 51N { function = earth_fault; curve = iec.si; I_pickup = 60 A; tms = 0.1; } }
relay R_I { voltage = MV; ct_ratio = 1200/1;
  element 51N { function = earth_fault; curve = iec.si; I_pickup = 120 A; tms = 0.25; } }
grade { primary = R_F:51N; backup = R_I:51N; fault = F_E; }
`;

describe('an earth pair', () => {
  it('is swept no higher than the largest residual, not the largest phase fault', () => {
    const report = run(STUDY).reports[0];
    const top = Math.max(...report.rows.map((r) => r.I_f_A));
    expect(top).toBeLessThanOrEqual(1200 + 1e-6);
  });
});
