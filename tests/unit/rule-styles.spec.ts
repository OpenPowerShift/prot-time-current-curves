/**
 * Each kind of rule has a style block of its own name.
 *
 * Rating rules (`currents { }`) took the required-time style, so
 * changing how clearance times were drawn changed every rating too.
 * And `currents` named three unrelated things: the rating block, the
 * legend's choice of primary or secondary amps, and whether a fault's
 * figure is printed. The last two are now `I_units` and `values`.
 */

import { describe, expect, it } from 'vitest';
import { process, renderStudy, migrate } from '@tc/index';

const STUDY = (page: string): string => `
system { voltages { HV { V = 33 kV; } LV { V = 400 V; } } }
relay R { voltage = HV; ct_ratio = 400/5;
  element 51 { function = phase_oc; curve = iec.si; I_pickup = 400 A; tms = 0.2; } }
faults { F_BUS { I = 8 kA; voltage = HV; type = three_phase; } }
times { T_CLR { t = 500 ms; at_I = 2 kA; } }
currents { "Cable rating" { I = 600 A; voltage = HV; at_t = 5 s; } }
view V { voltage = HV; quantity = phase; second_axis = LV;
  current_min = 100 A; current_max = 20 kA; time_min = 20 ms; time_max = 20 s; }
page { ${page} }
`;

const svg = (page: string): string => {
  const r = process(STUDY(page));
  expect([...r.parseErrors, ...r.diagnostics].filter((d) => d.severity === 'error')
    .map((d) => d.message)).toEqual([]);
  return renderStudy(r, { theme: 'light' });
};

const ratingLine = (s: string): string => /<line[^>]*class="tc-current-rating"[^>]*>/.exec(s)![0];

describe('rating rules', () => {
  it('do not follow the times style', () => {
    expect(ratingLine(svg('times = { color = "#ff0000"; style = "solid"; };')))
      .not.toContain('#ff0000');
  });

  it('follow their own block', () => {
    const line = ratingLine(svg('currents = { color = "#00aa00"; style = "solid"; width_px = 3; };'));
    expect(line).toContain('#00aa00');
    expect(line).toContain('stroke-width="3"');
    expect(line).not.toContain('stroke-dasharray');
  });

  it('can drop their figure and keep their name', () => {
    const s = svg('currents = { values = false; };');
    const labels = [...s.matchAll(/class="tc-current-rating-label"[^>]*>([^<]*)</g)].map((m) => m[1]);
    expect(labels).toEqual(['Cable rating']);
  });
});

describe('the band above a second-axis sheet', () => {
  it('carries the figure only; the name is under the bottom axis', () => {
    const s = svg('');
    const labels = [...s.matchAll(/class="tc-fault-label"[^>]*>([^<]*)</g)].map((m) => m[1]);
    expect(labels.filter((t) => t.includes('F_BUS'))).toHaveLength(1);
    expect(labels).toContain('660 kA');   /* 8 kA at 33 kV, in 400 V amps */
  });
});

describe('the old names', () => {
  it('are errors that migrate to the new ones', () => {
    const old = 'page { legend = { currents = "both"; }; faults = { currents = false; }; }';
    const codes = process(old).parseErrors.map((e) => e.code);
    expect(codes.filter((c) => c === 'RENAMED_KEY')).toHaveLength(2);
    expect(migrate(old).text)
      .toBe('page { legend = { I_units = "both"; }; faults = { values = false; }; }');
  });
});
