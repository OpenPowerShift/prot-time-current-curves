# Changelog

All notable changes to this project are documented here. The format follows
[Conventional Commits](https://www.conventionalcommits.org/) and releases are
cut by [release-please](https://github.com/googleapis/release-please); entries
below this line are generated from commit messages.

## [0.2.0](https://github.com/OpenPowerShift/prot-time-current-curves/compare/v0.1.1...v0.2.0) (2026-11-13)


### Features

* axis settings belong to the view; fix dense ticks printed many times over ([68c6f9f](https://github.com/OpenPowerShift/prot-time-current-curves/commit/68c6f9f7317524823bd516d2a51e8f68fc26aff5)), closes [#15](https://github.com/OpenPowerShift/prot-time-current-curves/issues/15)
* give rating rules their own page style; rename the other "currents" keys ([a042d71](https://github.com/OpenPowerShift/prot-time-current-curves/commit/a042d719f1b3e55e4565c57d74d2348696673bf5)), closes [#8](https://github.com/OpenPowerShift/prot-time-current-curves/issues/8)
* migrate old syntax by rewriting the source; remove blocks nested in a view ([b070c18](https://github.com/OpenPowerShift/prot-time-current-curves/commit/b070c18f44031b08165cc089f4222566acf6d186)), closes [#3](https://github.com/OpenPowerShift/prot-time-current-curves/issues/3) [#4](https://github.com/OpenPowerShift/prot-time-current-curves/issues/4)
* place a curve between two others (grade below/middle/above, spacing) ([f590cbf](https://github.com/OpenPowerShift/prot-time-current-curves/commit/f590cbf237ac9379e0d61ea93ee9097e6581c725)), closes [#11](https://github.com/OpenPowerShift/prot-time-current-curves/issues/11)
* remove the delay-means-definite spelling ([7040703](https://github.com/OpenPowerShift/prot-time-current-curves/commit/704070328c97fdfb59b8c800381e26f2575c06fa)), closes [#10](https://github.com/OpenPowerShift/prot-time-current-curves/issues/10)
* scope devices with views; refuse a view that lists its items ([83eeaa4](https://github.com/OpenPowerShift/prot-time-current-curves/commit/83eeaa46266d8beb69a1ade8685d29ce56237eed))
* t_floor, a minimum operating time for inverse curves ([116af3d](https://github.com/OpenPowerShift/prot-time-current-curves/commit/116af3df66db5abbcea397be8d20d449865ed47b))
* write percentages with % ([916784b](https://github.com/OpenPowerShift/prot-time-current-curves/commit/916784bbc0cca60327e88536d814aa799b91a41a)), closes [#12](https://github.com/OpenPowerShift/prot-time-current-curves/issues/12)


### Bug Fixes

* a secondary-amps sheet is bounded and referenced in its own terms ([9dc39b4](https://github.com/OpenPowerShift/prot-time-current-curves/commit/9dc39b47b6c8e9bc4d116e44ae48cb0ba5f39194))
* an I_cutoff is inclusive, and a computed current at it counts as at it ([8247253](https://github.com/OpenPowerShift/prot-time-current-curves/commit/8247253728d2642e20d3f3d917659c04edad4427)), closes [#20](https://github.com/OpenPowerShift/prot-time-current-curves/issues/20)
* an unplaceable middle curve is not a pass; skill gaps from Sonnet testing ([2e87508](https://github.com/OpenPowerShift/prot-time-current-curves/commit/2e875086f35fa0287d25caec2de7687858ceb6f6))
* hold every legend section to the column's budget ([5486c4b](https://github.com/OpenPowerShift/prot-time-current-curves/commit/5486c4bdedb91f70c8f5a079ef1753046588c899)), closes [#5](https://github.com/OpenPowerShift/prot-time-current-curves/issues/5)
* name keys as written in diagnostics; drop FAULT_SINGLE_POINT ([e30e460](https://github.com/OpenPowerShift/prot-time-current-curves/commit/e30e460c1307037cdb88e28bc27834102162a648)), closes [#6](https://github.com/OpenPowerShift/prot-time-current-curves/issues/6)
* one rule per required time, and leaders that never cross ([ff22551](https://github.com/OpenPowerShift/prot-time-current-curves/commit/ff22551db0cfdeb9f0fa091faf9a894ee235f98c)), closes [#9](https://github.com/OpenPowerShift/prot-time-current-curves/issues/9)
* report a missing semicolon, and insert it on migrate ([f422102](https://github.com/OpenPowerShift/prot-time-current-curves/commit/f42210228a029c6b6c02474a4a9ac30f7bb3151a))
* report page keys outside their sub-block instead of dropping them ([d348c57](https://github.com/OpenPowerShift/prot-time-current-curves/commit/d348c5774f01537977c5423c05dbe4261afa4043)), closes [#7](https://github.com/OpenPowerShift/prot-time-current-curves/issues/7)
* surface what grading finds; act on the blind skill evaluation ([cadb153](https://github.com/OpenPowerShift/prot-time-current-curves/commit/cadb15325ecc0d52398643fbcd2838566e5a38d4)), closes [#14](https://github.com/OpenPowerShift/prot-time-current-curves/issues/14)
* sweep an earth or sequence pair to the largest fault it measures ([2ce30b1](https://github.com/OpenPowerShift/prot-time-current-curves/commit/2ce30b1fe4809495a76b5192f29e91a3173b6fb9)), closes [#19](https://github.com/OpenPowerShift/prot-time-current-curves/issues/19)
* theme the editor's Find panel ([698a580](https://github.com/OpenPowerShift/prot-time-current-curves/commit/698a5804d2a555c7cc2c923c52cf6693f871a91b)), closes [#13](https://github.com/OpenPowerShift/prot-time-current-curves/issues/13)


### Documentation

* language spec 0.2.0 ([47fd68a](https://github.com/OpenPowerShift/prot-time-current-curves/commit/47fd68a448725e54cf6b817f852ea7c24e3f784b))

## [0.1.1](https://github.com/OpenPowerShift/prot-time-current-curves/compare/v0.1.0...v0.1.1) (2026-08-12)


### Bug Fixes

* convert README with downdoc instead of a hand-rolled regex ([2622867](https://github.com/OpenPowerShift/prot-time-current-curves/commit/26228677411c9043057e2ddf6c532cf73713eaec))
* point the playground links at the renamed GitHub Pages URL ([24880d7](https://github.com/OpenPowerShift/prot-time-current-curves/commit/24880d7633ec499883323435f2c69c95319e11bc))

## 0.1.0 (2026-08-12)

Initial release.

### Features

* prepare for the initial release ([5f36b75](https://github.com/OpenPowerShift/prot-time-current-curves/commit/5f36b75e7956d5a22abb05593a535ad77bbf58a1))
