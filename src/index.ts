import { nearly } from './nearly'
import { deepEquals } from './deep-equals'

export * from './deep-equals'
export * from './nearly'

/* Need this for JavaScript */
module.exports = nearly
/* Need this for Typescript */
module.exports.nearly = nearly
module.exports.deepEquals = deepEquals
