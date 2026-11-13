# Skill evaluation prompts

Each prompt is a small setting report. An agent given only
`docs/skill.adoc` writes one study per prompt, named `NN.ptc`; then

    npx tsx scripts/skill-eval/evaluate.ts <dir-of-studies>

checks every study, tallies the diagnostics by code and renders each
sheet for a visual review. Recurring mistakes go back into the skill
(and, where they are the tool's fault, into the tool) and into tests.

Report what the prompt does not give as missing; do not invent it.

## 01 — Feeder and incomer
11 kV switchboard. Feeder relay: CT 400/5, IEC SI, pickup 480 A, TMS
0.10. Incomer: CT 800/5, IEC SI, pickup 800 A, TMS 0.25. Maximum
three-phase fault at the feeder 6.2 kA. Grading margin 0.3 s.

## 02 — Low-set and high-set
33 kV feeder, CT 600/1. 51: IEC VI, 300 A, TMS 0.15. 50: 3.6 kA,
definite 50 ms, blocked above 9 kA. Upstream incomer, CT 1200/1, IEC SI
900 A TMS 0.3, high-set 8 kA at 300 ms. Bus fault 9 kA max, 5.5 kA
min. Margin 0.3 s.

## 03 — Earth fault on its own sheet
11 kV feeder CT 300/1: 51 IEC SI 360 A TMS 0.1; 51N IEC SI 60 A TMS
0.1. Incomer CT 1200/1: 51 IEC SI 960 A TMS 0.3; 51N IEC SI 120 A TMS
0.25. Phase fault 7 kA; earth fault (residual) 1.2 kA. Separate
phase and earth sheets. Margin 0.3 s.

## 04 — Across a Dyn11 transformer
33/11 kV Dyn11 transformer. 33 kV relay CT 200/1, IEC SI 180 A TMS
0.2. 11 kV incomer CT 800/1, IEC SI 640 A TMS 0.15. 11 kV bus
three-phase fault 8.5 kA. Draw in 33 kV amps. Margin 0.4 s.

## 05 — Negative sequence
11 kV feeder relay 46, set in I2 (not 3I2): 120 A definite 1 s. Its
backup 46 on the incomer: 200 A definite 1.5 s, also I2. Phase-phase
fault on the feeder 5.2 kA (I2 = 3.0 kA). Negative-sequence sheet only.

## 06 — Clearance times and a cable rating
33 kV feeder CT 800/1 IEC SI 660 A TMS 0.07, high-set 2.64 kA 350 ms.
Grid code: primary clearance 200 ms and backup 750 ms at 20.8 kA. Cable
continuous rating 592 A. Bus fault 20.8 kA.

## 07 — Fuse and relay
11 kV transformer fuse 100 A: min melt (200 A, 10 s), (400 A, 1.2 s),
(800 A, 0.14 s); total clear (200 A, 16 s), (400 A, 2 s), (800 A,
0.26 s). Upstream relay CT 400/5 IEC VI 300 A TMS 0.2. Fault at the
transformer 2.5 kA. Margin 0.25 s.

## 08 — Two chains, two sheets
33 kV incomer CT 2500/1 IEC SI 2400 A TMS 0.2 backs up two feeders:
BESS feeder CT 800/1 IEC SI 660 A TMS 0.07 and auxiliary feeder CT
200/1 IEC SI 200 A TMS 0.15. Each feeder has an RMU below it: BESS RMU
CT 300/1 IEC SI 90 A TMS 0.1; auxiliary RMU CT 300/1 IEC SI 45 A TMS
0.1. Faults: BESS RMU 850 A, auxiliary RMU 455 A, 33 kV feeder 12 kA.
One sheet per chain. Auxiliary fuses (11 A) belong only on the
auxiliary sheet; the BESS feeder load (592 A) only on the BESS sheet.

## 09 — Choose a setting
Same chain as 08's BESS side. Choose the BESS feeder TMS so it sits
half-way in time between the RMU and the incomer at the 33 kV feeder
fault (12 kA), which all three relays see. Margin 0.3 s.

## 10 — Minimum time of the curve
Siemens 7SJ85 33 kV feeder, CT 800/1: IEC SI 660 A TMS 0.1 with a
minimum time of the curve of 100 ms. Incomer CT 2500/1 IEC SI 2400 A
TMS 0.2. Bus fault 20 kA. Margin 0.3 s.
