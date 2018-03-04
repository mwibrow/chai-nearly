import { nearly } from './chai-nearly'
import { deepEquals,
  Comparison,
  ICompare,
  ICompareConfiguration,
  IComparison,
  ICompareOptions,
  ICompareParams,
  ICompareTypes,
  comparison } from './deep-equals'

export * from './chai-nearly'
export * from './deep-equals'

/* Need this for JavaScript */
module.exports = nearly
/* Need this for Typescript */
module.exports.nearly = nearly
module.exports.deepEquals = deepEquals
module.exports.comparison = comparison
module.exports.Comparison = Comparison

export type ICompare = ICompare
export type ICompareConfiguration = ICompareConfiguration
export type IComparison = IComparison
export type ICompareOptions = ICompareOptions
export type ICompareParams = ICompareParams
export type ICompareTypes = ICompareTypes
