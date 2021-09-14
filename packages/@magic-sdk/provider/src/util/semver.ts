// We have to wrap `semver` functions due to a long-standing cyclic dependency
// which causes Rollup to break the `satisfies` function.
// See:
//   - https://github.com/magiclabs/magic-js/issues/198
//   - https://github.com/rollup/plugins/issues/879
//   - https://github.com/npm/node-semver/issues/318
//   - https://github.com/npm/node-semver/issues/381

/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */

// Do not remove or change the order of these requires.
const SemVer = require('semver/classes/semver');
const Comparator = require('semver/classes/comparator');
const Range = require('semver/classes/range');
const satisfies = require('semver/functions/satisfies') as typeof import('semver/functions/satisfies');
const coerce = require('semver/functions/satisfies') as typeof import('semver/functions/coerce');

export { satisfies, coerce };
export type { SemVer } from 'semver';
