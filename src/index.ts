import { nearly } from './chai-nearly'
import { deepEquals, ICompare, comparison } from './deep-equals'

export * from './chai-nearly'
export * from './deep-equals'

/* Need this for JavaScript */
module.exports = nearly
/* Need this for Typescript */
module.exports.nearly = nearly
module.exports.deepEquals = deepEquals
module.exports.comparison = comparison
export type ICompare = ICompare

