import { isFunction, isNumber, isObject } from 'util'
import { deepEquals, equals, ICompare, ICompareConfiguration, mergeOptions } from './deep-equals'

export type ICompare = ICompare

const TOLERANCE = 1e-6

export function nearlyEqual(lhs: number, rhs: number, tolerance: number = TOLERANCE): boolean {
  return Math.abs(lhs - rhs) <= Math.abs(tolerance * Math.min(lhs, rhs))
}

const numberComparitor: ICompare = function(
  lhs: number, rhs: number, options: any): boolean {
  return nearlyEqual(lhs, rhs, options.tolerance)
}

const DEFAULT_OPTIONS: ICompareConfiguration = {
  options: { tolerance: TOLERANCE },
  types: {
    number: numberComparitor
  }
}

export function nearly (chai: any, utils: any) {
  const Assertion: any = chai.Assertion
  const flag: any = utils.flag

  function overrideAssertEqual (_super: any) {
    return function checkNearlyEqual (value: any) {
      const obj = this._obj
      const objType = typeof obj
      const config = flag(this, 'config') || { options: {}, types: {} }
      if (config.types[objType] || config.types.any) {
        this.assert(
          equals(obj, value, config),
          'expected #{this} to be nearly equal to #{exp} but got #{act}',
          'expected #{this} to be not nearly equal to #{act}',
          value,
          obj)
      } else {
        _super.apply(this, arguments)
      }
    }
  }

  function overrideAssertEql (_super: any) {
    return function checkNearlyEql (value: any) {
      const obj = this._obj
      const objType = typeof obj
      const config = flag(this, 'config') || { options: {}, types: {} }
      if (config.types[objType] || config.types.any || isObject(obj)) {
        this.assert(
          deepEquals(obj, value, config),
          'expected #{this} to be nearly deeply equal to #{exp} but got #{act}',
          'expected #{this} to be not nearly deeply equal to #{act}',
          value,
          obj)
      } else {
        _super.apply(this, arguments)
      }
    }
  }

  Assertion.overwriteMethod('equal', overrideAssertEqual)
  Assertion.overwriteMethod('eql', overrideAssertEql)
  Assertion.overwriteMethod('eqls', overrideAssertEql)

  function chainWithOptions(options: any = TOLERANCE): any {
    if (isNumber(options)) {
      flag(this, 'config', Object.assign(Object.assign({}, DEFAULT_OPTIONS), { options: { tolerance:  options } }))
    } else {
      if (isFunction(options)) {
        flag(this, 'config', Object.assign(Object.assign({}, DEFAULT_OPTIONS), { types: { any: options } }))
      } else {
        flag(this, 'config', Object.assign(Object.assign({}, DEFAULT_OPTIONS), options || {}))
      }
    }
  }

  function chainNoOptions(): any {
    flag(this, 'config', Object.assign({ options: { tolerance: TOLERANCE }, types: {} }, DEFAULT_OPTIONS))
  }

  Assertion.addChainableMethod('nearly', chainWithOptions, chainNoOptions)
}

declare global {
  export namespace Chai {
    export interface Assertion {
      nearly: NearlyAssertion
    }
    export interface NearlyAssertionTolerance extends Assertion {
      /**
       * @param tolerance Tolerance for number comparisons
       */
      (tolerance: number): Assertion
    }
    export interface NearlyAssertionComparitor extends NearlyAssertionTolerance {
      /**
       * @param comparitor A comparitor for comparing objects
       */
      (comparitor: ICompare): Assertion
    }
    export interface NearlyAssertion extends NearlyAssertionComparitor {
      /**
       * @param options Some options
       */
      (options: any): Assertion
    }
  }
}


