import { isFunction, isNumber, isObject } from 'util'
import { deepEquals, equals, ICompare, mergeOptions } from './deep-equals'

export type ICompare = ICompare

const TOLERANCE = 1e-6

export function nearlyEqual(lhs: number, rhs: number, tolerance: number = TOLERANCE): boolean {
  return Math.abs(lhs - rhs) <= Math.abs(tolerance * Math.min(lhs, rhs))
}

const numberComparitor: ICompare = function(
  lhs: number, rhs: number, options: any): boolean {
  return nearlyEqual(lhs, rhs, options._tolerance)
}

const DEFAULT_OPTIONS = {
  number: numberComparitor
}

export function nearly (chai: any, utils: any) {
  const Assertion: any = chai.Assertion
  const flag: any = utils.flag

  function overrideAssertEqual (_super: any) {
    return function checkNearlyEqual (value: any) {
      const obj = this._obj
      const objType = typeof obj
      const options = flag(this, 'options') || {}
      if (options[objType] || options.any) {
        this.assert(
          equals(obj, value, options),
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
      const options = flag(this, 'options')
      if (options[objType] || options.any || isObject(obj)) {
        this.assert(
          deepEquals(obj, value, options),
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
      flag(this, 'options', Object.assign({ _tolerance: options }, DEFAULT_OPTIONS))
    } else {
      if (isFunction(options)) {
        flag(this, 'options', Object.assign(Object.assign({}, DEFAULT_OPTIONS), { any: options }))
      } else {
        flag(this, 'options', Object.assign(Object.assign({}, DEFAULT_OPTIONS), options || {}))
      }
    }
  }

  function chainNoOptions(): any {
    flag(this, 'options', Object.assign({ tolerance: TOLERANCE }, DEFAULT_OPTIONS))
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
