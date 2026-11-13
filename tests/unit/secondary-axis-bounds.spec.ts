/**
 * A secondary-amps sheet is bounded, and referenced, in its own terms.
 *
 * `view { axis = secondary; current_min = 83 mA; current_max = 41 A; }`
 * took both bounds as *primary* amps, so the window sat three decades
 * below every curve and the sheet was empty -- with nothing saying why.
 * And the reference CT was the largest in the study, even a relay not
 * on the sheet.
 */

import { describe, expect, it } from 'vitest';
import { process as run, renderStudy } from '@tc/index';

const STUDY = (view: string, extra = ''): string => `
system { voltages { MV { V = 11 kV; } } }
relay R_FDR { voltage = MV; ct_ratio = 400/5;
  element 51 { curve = iec.si; I_pickup = 480 A; tms = 0.1; views = [S]; } }
relay R_INC { voltage = MV; ct_ratio = 1200/1;
  element 51 { curve = iec.si; I_pickup = 1200 A; tms = 0.2; views = [P]; } }
${extra}
view S { voltage = MV; axis = secondary; ${view} }
view P { voltage = MV; }
`;

const sheet = (src: string, id = 'S'): string => {
  const r = run(src);
  return renderStudy(r, { theme: 'light', view: r.study!.views.find((v) => v.id === id) });
};

/** The legend's text, lines joined, so a wrapped note still matches. */
const legendText = (svg: string): string =>
  [...svg.matchAll(/class="tc-legend[^"]*"[^>]*>([^<]*)</g)].map((m) => m[1]).join(' ');

describe('a secondary-amps sheet', () => {
  it('reads its bounds in secondary amps', () => {
    const svg = sheet(STUDY('current_min = 1 A; current_max = 100 A;'));
    /* The fixed domain, in primary amps, is the bounds times the CT (80). */
    expect(svg).toMatch(/data-domain-i="80,8000"|domain-i="80,8000"/);
  });

  it('takes its reference CT from a relay on the sheet, not the largest in the study', () => {
    expect(sheet(STUDY(''))).toContain('CT 80:1');
  });

  it('says so when nothing on it has a CT', () => {
    const fuseOnly = STUDY('', `device F { kind = fuse; voltage = MV; views = [S];
      min_melt = [(100 A, 60 s), (1500 A, 0.02 s)]; total_clear = [(100 A, 100 s), (1500 A, 0.04 s)]; }`)
      .replace('views = [S]; } }\nrelay R_INC', 'views = [P]; } }\nrelay R_INC');
    expect(legendText(sheet(fuseOnly))).toContain('axis = secondary needs a relay with a ct_ratio');
  });
});

describe('a curve entirely off the window', () => {
  it('is named in the notes rather than silently missing', () => {
    expect(legendText(sheet(STUDY('current_min = 0.01 A; current_max = 0.1 A;'))))
      .toMatch(/outside the plotted currents and times: R_FDR/);
  });
});
