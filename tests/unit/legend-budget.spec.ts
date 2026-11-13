/**
 * The legend never runs past the frame.
 *
 * Only curve entries were ever dropped when the column ran out, so a
 * sheet with a dozen faults, ratings and times -- the Bellambi Heights
 * auxiliary sheet in the playground's pane -- drew its legend off the
 * bottom of the page. Every section is now held to the same budget and
 * what does not fit is counted.
 */

import { describe, expect, it } from 'vitest';
import { process } from '@tc/index';
import { renderSvg } from '@tc/renderer/index';

const faults = Array.from({ length: 10 }, (_, i) =>
  `F_${i} { I = ${(i + 1) * 300} A; voltage = MV; type = three_phase; }`).join('\n');
const ratings = Array.from({ length: 6 }, (_, i) =>
  `"Rating ${i}" { I = ${(i + 1) * 40} A; voltage = MV; at_t = 5 s; }`).join('\n');
const times = Array.from({ length: 6 }, (_, i) =>
  `T_${i} { t = ${(i + 1) * 100} ms; at_I = 2 kA; }`).join('\n');

const STUDY = `
system { voltages { MV { V = 33 kV; } } }
relay R { voltage = MV; ct_ratio = 800/1;
  element 51 { function = phase_oc; curve = iec.si; I_pickup = 660 A; tms = 0.07; } }
faults { ${faults} }
currents { ${ratings} }
times { ${times} }
view V { voltage = MV; quantity = phase; current_min = 20 A; current_max = 10 kA;
  time_min = 10 ms; time_max = 10 s; }
`;

describe('a legend with more entries than room', () => {
  for (const [w, h] of [[1400, 970], [1100, 700], [900, 600], [700, 500]]) {
    it(`stays inside a ${w} x ${h} sheet and says what it left out`, () => {
      const r = process(STUDY);
      const svg = renderSvg(r.document, {
        theme: 'light', width: w, height: h, view: r.study!.views[0], study: r.study, reports: r.reports,
      } as never);
      const ys = [...svg.matchAll(/<text[^>]*?y="([\d.]+)"[^>]*class="tc-legend/g)].map((m) => Number(m[1]));
      expect(Math.max(...ys)).toBeLessThan(h);
      if (h <= 500) expect(svg).toMatch(/\+\d+ more not shown/);
    });
  }
});

describe('a rating entry', () => {
  it('does not spend a line saying it is a rating', () => {
    const r = process(STUDY);
    const svg = renderSvg(r.document, { theme: 'light', width: 1400, height: 970, view: r.study!.views[0], study: r.study, reports: r.reports } as never);
    expect(svg).not.toMatch(/class="tc-legend-muted"[^>]*>rating</);
  });
});
