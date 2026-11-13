/**
 * Devices are scoped the way elements are.
 *
 * A `device` took no `views`, and the renderer drew every device on
 * every sheet -- so an MV fuse protecting an auxiliary transformer was
 * drawn on the BESS phase sheet too, and a group listing a device did
 * not keep it off the other chain's sheets either.
 *
 * And scoping runs one way: an item names its sheets. A view that
 * lists its items is refused with the fix, rather than warned and
 * dropped (which is what drew a study's ratings on every sheet).
 */

import { describe, expect, it } from 'vitest';
import { process, renderStudy } from '@tc/index';

const FUSE = (id: string, extra: string) => `
device ${id} { kind = fuse; voltage = "MV"; rating_I = 11 A; ${extra}
  min_melt = [(20 A, 600 s), (150 A, 20 ms)];
  total_clear = [(24 A, 600 s), (240 A, 20 ms)]; }`;

const STUDY = `
system { voltages { "MV" { V = 33 kV; } } }
relay R { voltage = "MV"; ct_ratio = 200/1;
  element 51 { function = "phase_oc"; curve = iec.si; I_pickup = 200 A; tms = 0.15; } }
${FUSE('F_AUX', 'views = ["Aux"];')}
${FUSE('F_ANY', '')}
${FUSE('F_CHAIN', '')}
group CHAIN { members = [R, F_CHAIN]; }
view Aux  { voltage = "MV"; quantity = phase; current_min = 10 A; current_max = 10 kA; }
view Bess { voltage = "MV"; quantity = phase; current_min = 10 A; current_max = 10 kA; }
view Chain { voltage = "MV"; quantity = phase; group = CHAIN; current_min = 10 A; current_max = 10 kA; }
`;

const drawn = (name: string): string => {
  const r = process(STUDY);
  expect([...r.parseErrors, ...r.diagnostics].filter((d) => d.severity === 'error')
    .map((d) => `${d.code}: ${d.message}`)).toEqual([]);
  const view = r.study!.views.find((v) => v.id === name);
  return renderStudy(r, { theme: 'light', view });
};

describe('a device scoped to one sheet', () => {
  it('is drawn there and nowhere else', () => {
    expect(drawn('Aux')).toContain('F_AUX');
    expect(drawn('Bess')).not.toContain('F_AUX');
  });

  it('is drawn everywhere when it names no sheet', () => {
    expect(drawn('Aux')).toContain('F_ANY');
    expect(drawn('Bess')).toContain('F_ANY');
  });

  it('follows a group that lists it', () => {
    expect(drawn('Chain')).toContain('F_CHAIN');
    expect(drawn('Chain')).not.toContain('F_ANY');
  });

  it('reports a sheet name that does not exist', () => {
    const r = process(STUDY.replace('views = ["Aux"]', 'views = ["Auxx"]'));
    expect(r.diagnostics.map((d) => d.code)).toContain('UNRESOLVED_VIEW');
  });
});

describe('a view that lists its items', () => {
  it('is refused with the fix', () => {
    const r = process(`${STUDY}
      currents { "Load" { I = 150 A; voltage = "MV"; } }
      view Lists { voltage = "MV"; currents = ["Load"]; }`);
    const e = r.parseErrors.find((d) => d.code === 'VIEW_LISTS_ITEMS');
    expect(e?.severity).toBe('error');
    expect(e?.message).toBe('a view does not list its currents; put views = ["Lists"] on each current instead');
  });

  it('points relays at group or their elements', () => {
    const r = process(`${STUDY} view Lists { voltage = "MV"; relays = [R]; }`);
    expect(r.parseErrors.find((d) => d.code === 'VIEW_LISTS_ITEMS')?.message)
      .toMatch(/select a chain with group, or put views = \["Lists"\] on each element/);
  });
});
