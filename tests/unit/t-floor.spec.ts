/**
 * `t_floor`: an inverse characteristic never operates faster than it.
 *
 * And `t_delay` on an inverse stage, which nothing read -- the curve
 * drew as if it were absent -- is refused with what is supported.
 */

import { describe, expect, it } from 'vitest';
import { process } from '@tc/index';
import { tTripStage } from '@tc/semantics/curves';

const RELAY = (element: string): string => `
system { voltages { MV { V = 33 kV; } } }
relay R { voltage = MV; ct_ratio = 400/1; ${element} }
`;

const stageOf = (element: string) => {
  const r = process(RELAY(element));
  return { r, stage: r.study!.relays.get('R')!.elements[0].stages[0] };
};

describe('t_floor', () => {
  const { r, stage } = stageOf(
    'element 51 { curve = iec.si; I_pickup = 400 A; tms = 0.1; t_floor = 100 ms; }');

  it('parses cleanly', () => {
    expect([...r.parseErrors, ...r.diagnostics].filter((d) => d.severity === 'error')).toEqual([]);
  });

  it('holds the time up at high multiples', () => {
    /* IEC SI at M = 50, TMS 0.1: 0.1 * 0.14 / (50^0.02 - 1) = 0.17 s ... at M = 200, 0.13 s */
    expect(tTripStage(stage, 400 * 1000)).toBeCloseTo(0.1, 6);
  });

  it('leaves the curve alone where it is already slower', () => {
    expect(tTripStage(stage, 400 * 2)).toBeGreaterThan(1);
  });

  it('does not make a stage operate below pickup', () => {
    expect(tTripStage(stage, 100)).toBe(Infinity);
  });

  it('is refused on a definite stage', () => {
    const { r: d } = stageOf('element 50 { curve = definite; I_pickup = 4 kA; t_delay = 50 ms; t_floor = 100 ms; }');
    expect(d.diagnostics.map((x) => x.code)).toContain('FLOOR_ON_DEFINITE');
  });
});

describe('t_delay on an inverse stage', () => {
  it('is refused, pointing at t_floor', () => {
    const { r } = stageOf('element 51 { curve = iec.si; I_pickup = 400 A; tms = 0.1; t_delay = 200 ms; }');
    const d = r.diagnostics.find((x) => x.code === 'DELAY_ON_INVERSE');
    expect(d?.severity).toBe('error');
    expect(d?.message).toMatch(/use t_floor/);
  });

  it('is not charged to an inverse stage that inherits it from its element', () => {
    const { r } = stageOf(`element 51 { t_delay = 300 ms; stages {
      stage IDMT { curve = iec.si; I_pickup = 400 A; tms = 0.1; }
      stage HIGH { curve = definite; I_pickup = 4 kA; } } }`);
    expect(r.diagnostics.map((x) => x.code)).not.toContain('DELAY_ON_INVERSE');
  });
});
