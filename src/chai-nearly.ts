import { isFunction, isNumber, isObject, isPrimitive } from 'util'
import { deepEquals } from './deep-equals'

export * from './deep-equals'

const TOLERANCE = 1e-6

export function nearlyEqual(lhs: number, rhs: number, tolerance: number = TOLERANCE): boolean {
  return Math.abs(lhs - rhs) <= Math.abs(tolerance * Math.min(lhs, rhs))
}

const numberComparitor: deepEquals.ICompare = function(
  lhs: number, rhs: number, options: any): boolean {
  return nearlyEqual(lhs, rhs, options.tolerance || options._default)
}

const DEFAULT_CONFIGURATION: deepEquals.ICompareConfiguration = {
  options: {},
  types: {
    number: numberComparitor
  },
  params: {
    strict: true
  }
}

export function nearly (chai: any, utils: any) {
  return nearly.nearly(chai, utils)
}

export namespace nearly {

  export let CONFIGURATION: deepEquals.ICompareConfiguration | deepEquals.IComparison = DEFAULT_CONFIGURATION

  export function initialise(config?: deepEquals.ICompareConfiguration | deepEquals.IComparison) {
    CONFIGURATION = config || DEFAULT_CONFIGURATION
  }

  export function nearly (chai: any, utils: any) {
    const Assertion: any = chai.Assertion
    const flag: any = utils.flag

    function overrideAssertEqual (_super: any) {
      return function checkNearlyEqual (value: any) {
        const obj = this._obj
        const objType = typeof obj
        const config: any = flag(this, 'config') ||
          (CONFIGURATION as deepEquals.IComparison).config || CONFIGURATION
        if (config._nearly) {
          if (config._deep) {
            return this.assert(
              deepEquals(obj, value, config.config || config),
              'expected #{this} to be nearly deeply equal to #{exp} but got #{act}',
              'expected #{this} to be not nearly deeply equal to #{act}',
              value,
              obj)
          }
          this.assert(
            deepEquals.equals(obj, value, config.config || config),
            'expected #{this} to be nearly equal to #{exp} but got #{act}',
            'expected #{this} to be not nearly equal to #{act}',
            value,
            obj)
        } else {
          _super.apply(this, arguments)
        }
      }
    }

    function overwritePropertyDeep(_super: any) {
      return function checkModel() {
        const config = flag(this, 'config')
        if (config && config._nearly) {
          flag(this, 'config', Object.assign(config, { _deep: true }))
        }
        _super.call(this)
      }
    }

    Assertion.overwriteMethod('equal', overrideAssertEqual)
    Assertion.overwriteMethod('equals', overrideAssertEqual)
    Assertion.overwriteProperty('deep', overwritePropertyDeep)

    function chainWithOptions(options: any): any {
      const config = (CONFIGURATION as deepEquals.IComparison).config || CONFIGURATION
      const defaults = Object.assign({ _nearly: true }, config)
      if (isPrimitive(options)) {
        flag(this, 'config', Object.assign(defaults, { options: { _default:  options } }))
      } else {
        if (isFunction(options)) {
          flag(this, 'config', Object.assign(defaults, { types: { any: options } }))
        } else {
          flag(this, 'config', Object.assign(defaults, options || {}))
        }
      }
    }

    function chainNoOptions(): any {
      const config = (CONFIGURATION as deepEquals.IComparison).config || CONFIGURATION
      const defaults = Object.assign({ _nearly: true }, config)
      flag(this, 'config', Object.assign({ options: { _default: TOLERANCE }, types: {} }, defaults))
    }

    Assertion.addChainableMethod('nearly', chainWithOptions, chainNoOptions)
  }

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
    export interface NearlyAssertionCompare extends NearlyAssertionTolerance {
      /**
       * @param comparitor A comparitor for comparing objects
       */
      (compare: deepEquals.ICompare): Assertion
    }
    export interface NearlyAssertion extends NearlyAssertionCompare {
      /**
       * @param options Some options
       */
      (options: any): Assertion
    }
  }
}
