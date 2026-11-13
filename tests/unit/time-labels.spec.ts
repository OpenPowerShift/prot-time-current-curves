/**
 * Required times sharing a value are one rule with one caption, and no
 * leader on the sheet crosses another.
 *
 * Six GPS limits at three times, anchored at the same fault current,
 * drew six rules (three pairs on top of each other) and six captions;
 * the placer pushed them apart independently and their leaders
 * crossed, so the 200 ms name pointed at the 500 ms rule.
 */

import { describe, expect, it } from 'vitest';
import { process, renderStudy } from '@tc/index';
import { LabelPlacer } from '@tc/renderer/labels';

const STUDY = `
system { voltages { MV { V = 33 kV; } } }
relay R { voltage = MV; ct_ratio = 800/1;
  element 51 { function = phase_oc; curve = iec.si; I_pickup = 660 A; tms = 0.07; } }
times {
  BUS_P { name = "bus primary";        t = 200 ms; at_I = 20 kA; }
  BUS_B { name = "bus backup";         t = 750 ms; at_I = 20 kA; }
  FDR_P { name = "feeder primary";     t = 500 ms; at_I = 20 kA; }
  FDR_B { name = "feeder backup";      t = 750 ms; at_I = 20 kA; }
  TX_P  { name = "transformer primary"; t = 200 ms; at_I = 20 kA; }
  TX_B  { name = "transformer backup";  t = 500 ms; at_I = 20 kA; }
}
view V { voltage = MV; quantity = phase; current_min = 50 A; current_max = 30 kA;
  time_min = 10 ms; time_max = 10 s; }
`;

const svg = (src = STUDY): string => renderStudy(process(src), { theme: 'light' });

describe('required times at the same value', () => {
  it('draw one rule each', () => {
    const rules = [...svg().matchAll(/class="tc-time" data-time-name="([^"]*)"/g)].map((m) => m[1]);
    expect(rules).toEqual([
      'bus backup / feeder backup',
      'feeder primary / transformer backup',
      'bus primary / transformer primary',
    ]);
  });

  it('share one caption naming them all', () => {
    expect(svg()).toContain('bus backup / feeder backup');
  });

  it('say so when the anchor is off the sheet', () => {
    const narrow = STUDY.replace('current_max = 30 kA', 'current_max = 1 kA');
    expect(svg(narrow)).toContain('6 time captions anchored off the');
  });
});

describe('leaders', () => {
  it('never cross one another', () => {
    /* Four labels on one anchor column, all forced off their anchors. */
    const placer = new LabelPlacer({ x: 0, y: 0, w: 400, h: 400 });
    placer.reserve({ x: 150, y: 100, w: 100, h: 200 });
    const anchors = [120, 160, 200, 240].map((y) => ({ x: 200, y }));
    const leaders = anchors.map((anchor) => {
      const p = placer.place({ anchor, size: { w: 80, h: 12 }, prefer: ['above', 'below'] });
      const x2 = p.side === 'left' ? p.rect.x + p.rect.w : p.rect.x;
      return { a: anchor, b: { x: x2, y: p.rect.y + p.rect.h / 2 }, displaced: p.displaced };
    });
    const cross = (p: typeof leaders[0], q: typeof leaders[0]): boolean => {
      const s = (a: { x: number; y: number }, b: { x: number; y: number }, c: { x: number; y: number }) =>
        (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
      const d1 = s(p.a, p.b, q.a); const d2 = s(p.a, p.b, q.b);
      const d3 = s(q.a, q.b, p.a); const d4 = s(q.a, q.b, p.b);
      return d1 * d2 < 0 && d3 * d4 < 0;
    };
    for (let i = 0; i < leaders.length; i++) {
      for (let j = i + 1; j < leaders.length; j++) {
        expect(cross(leaders[i], leaders[j]), `leaders ${i} and ${j}`).toBe(false);
      }
    }
  });
});
