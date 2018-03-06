import { nearly } from './chai-nearly'
import { deepEquals } from './deep-equals'

export * from './chai-nearly'
export * from './deep-equals'

/* Need this for JavaScript */
module.exports = nearly
/* Need this for Typescript */
module.exports.nearly = nearly
module.exports.deepEquals = deepEquals
module.exports.comparison = deepEquals.comparison
module.exports.Comparison = deepEquals.Comparison

export type ICompare = deepEquals.ICompare
export type ICompareConfiguration = deepEquals.ICompareConfiguration
export type IComparison = deepEquals.IComparison
export type ICompareOptions = deepEquals.ICompareOptions
export type ICompareParams = deepEquals.ICompareParams
export type ICompareTypes = deepEquals.ICompareTypes
