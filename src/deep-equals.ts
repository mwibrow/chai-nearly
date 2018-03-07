import { isArray, isFunction, isNull, isNumber, isObject, isPrimitive, isString, isUndefined } from 'util'

export function deepEquals(lhs: any, rhs: any, config?: deepEquals.ICompareConfiguration): boolean {
  return deepEquals.compare(lhs, rhs, deepEquals.processOptions(config),
    ((config || {}).params || {}).depth || deepEquals.MAX_DEPTH)
}

export namespace deepEquals {

  export const MAX_DEPTH = Number.MAX_SAFE_INTEGER

  export interface IComparison {
    add: IComparison
    with: IComparison
    config: ICompareConfiguration

    options(options: ICompareOptions): IComparison
    types(types: ICompareTypes): IComparison
    compare(lhs: any, rhs: any, options?: ICompareOptions): boolean
    parameters(params: ICompareParams): IComparison
  }

  export interface ICompare {
    (lhs: any, rhs: any, options?: any): boolean
  }

  export interface ICompareOptions {
    [key: string]: any
  }

  export interface ICompareTypes {
    [key: string]: ICompare
  }

  export interface ICompareParams {
    depth?: number
    strict?: boolean,
    undefined?: true
  }

  export interface ICompareConfiguration {
    options?: ICompareOptions
    types?: ICompareTypes
    params?: ICompareParams
  }

  export interface ITypeCompare {
    [key: string]: ICompare
  }

  export interface ITypeComparison {
    [key: string]: IComparison
  }

  export const primitiveComparitor: ICompare = function(lhs: any, rhs: any) {
    return typeof lhs === typeof rhs && lhs === rhs
  }

  export const numberComparitor: ICompare = function(lhs: any, rhs: any) {
    if (isNaN(lhs)) {
      return isNumber(rhs) && isNaN(rhs)
    }
    return lhs === rhs
  }

  export const CONFIGURATION_DEFAULTS: ICompareConfiguration = {
    options: {},
    types: {
      number: numberComparitor
    }
  }

  const DEFAULT_PARAMETERS: ICompareParams = {
    depth: MAX_DEPTH,
    strict: false,
    undefined: true
  }

  let PARAMETERS: ICompareParams = DEFAULT_PARAMETERS

  export function initialise(parameters?: ICompareParams): void {
    PARAMETERS = parameters || DEFAULT_PARAMETERS
  }

  /**
   * Recursive comparion equality of objects
   * @param lhs first object to compare
   * @param rhs second object to compare
   * @param options options to customer the behaviour of the function
   */
  export function deepEquals(lhs: any, rhs: any, options?: ICompareOptions): boolean {
    return compare(lhs, rhs, processOptions(options), MAX_DEPTH)
  }

  /**
   * Shallow comparison equality of objects.
   * @param lhs first object to compare
   * @param rhs second object to compare
   * @param options options to customer the behaviour of the function
   */
  export function equals(lhs: any, rhs: any, options?: ICompareOptions): boolean {
    return compare(lhs, rhs, processOptions(options), 1)
  }


  export function processOptions(options?: any) {
    const processed = mergeOptions(CONFIGURATION_DEFAULTS, options || {})
    return processed
  }

  /**
   * Merge options.
   *
   * @param lhs Options to merge into.
   * @param rhs Options to merge.
   * @param deep Whether to do deep or shallow merging.
   */
  export function mergeOptions(
    lhs: ICompareOptions,
    rhs: ICompareOptions,
    deep: boolean = true): ICompareOptions {
    return (<ICompareOptions>mergeOptionsHelper(lhs, rhs, deep))
  }

  function mergeOptionsHelper(lhs: any, rhs: any, deep: boolean): any {
    if (isPrimitive(lhs) || isArray(lhs) || isNull(lhs)) {
      return rhs
    }
    if (isPrimitive(rhs) || isArray(rhs) || isNull(rhs) || isFunction(rhs)) {
      return rhs
    }
    const options: any = Object.assign({}, lhs)
    for (const key in rhs) {
      if (rhs.hasOwnProperty(key)) {
        if (options[key] && deep) {
          options[key] = mergeOptionsHelper(options[key], rhs[key], deep)
        } else {
          options[key] = rhs[key]
        }
      }
    }
    return options
  }

  /**
   *
   * @param lhs first object to compare
   * @param rhs second object to compare
   * @param config options to customer the behaviour of the function
   * @param depth level of recursion, default Number.MAX_SAFE_INTEGER
   */
  export function compare (lhs: any, rhs: any, config?: any, depth?: number): boolean {
    return compareHelper(lhs, rhs, config, depth, [])
  }

  /**
   *
   * @param lhs first object to compare
   * @param rhs second object to compare
   * @param options options to customer the behaviour of the function
   * @param depth level of recursion, default Number.MAX_SAFE_INTEGER
   * @param parents stack of parents
   */
  function compareHelper(lhs: any, rhs: any, config: ICompareConfiguration, depth: number = MAX_DEPTH, parents: any[] = []): boolean {
    depth--
    const lhsType: string = typeof lhs
    const rhsType: string = typeof rhs
    const compare: Function = depth > 0 ? compareHelper : (lhs: any, rhs: any, ...args: any[]) =>
      lhsType === rhsType && lhs === rhs
    const options: ICompareOptions = config.options || {}
    const types: ICompareTypes = config.types || {}
    const params: ICompareParams = config.params || PARAMETERS
    /* Objects */
    if (isObject(lhs)) {
      if (depth <= 0 && params.strict) {
        return lhsType === rhsType && lhs === rhs
      }
      /* Class prototypes */
      const chain = getPrototypeChain(lhs)
      for (let i = 0; i < chain.length; i ++) {
        if (types[chain[i]]) {
          return types[chain[i]](lhs, rhs, options)
        }
      }
      /* Types */
      if (lhsType !== rhsType) {
        return false
      }
      /* Custom comparitor for types */
      if (types[lhsType]) {
        return types[lhsType](lhs, rhs, options)
      }
      /* Generic 'any' type */
      if (types.any) {
        return types.any(lhs, rhs, options)
      }
      /* Arrays */
      if (isArray(lhs)) {
        if (lhs.length !== rhs.length) {
          return false
        }
        return lhs.reduce((assert: boolean, value: any, index: number) =>
          assert && compareHelper(value, rhs[index], config, depth, parents), true)
      }
      /* Circular references are ignored */
      if (parents.indexOf(lhs) !== -1) {
        return true
      }
      parents = parents.concat(lhs)
      if (lhs === rhs) {
        return true
      }
      const lhsKeys = Object.keys(lhs).filter(key => !isUndefined(lhs[key]) || params.undefined)
      const rhsKeys = Object.keys(rhs).filter(key => !isUndefined(rhs[key]) || params.undefined)
      if (lhsKeys.length !== rhsKeys.length) {
        return false
      }
      return lhsKeys
        .reduce((assert: boolean, key: string) =>
          assert && compareHelper(lhs[key], rhs[key], config, depth, parents), true)
    }
    /* Primatives */
    if (types[lhsType]) {
      return types[lhsType](lhs, rhs, options)
    }
    if (types.any) {
      return types.any(lhs, rhs, options)
    }
    return lhsType === rhsType && lhs === rhs
  }

  export class Comparison implements IComparison {

    add: IComparison
    with: IComparison
    config: ICompareConfiguration
    constructor() {
      this.add = this
      this.with = this
      this.config = {
        options: {},
        types: {},
        params: {}
      }
    }

    options(options: ICompareOptions): IComparison {
      this.config.options = mergeOptions(this.config.options || {}, options)
      return this
    }

    types(types: ICompare | ITypeCompare | ITypeComparison): IComparison {
      this.config.types = mergeOptions(this.config.types || {}, types)
      return this
    }

    compare(lhs: any, rhs: any, options: ICompareOptions = {}): boolean {
      const compareOptions = mergeOptions(this.config.options || {}, options)
      return compare(lhs, rhs, compareOptions, compareOptions.depth || MAX_DEPTH)
    }

    parameters(params: ICompareParams): IComparison {
      Object.assign(this.config.params, params)
      return this
    }

    params(params: ICompareParams): IComparison {
      return this.parameters(params)
    }
  }

  export function comparison(config?: ICompareConfiguration): IComparison {
    const cmp: IComparison = new Comparison()
    if (config) {
      if (config.options) {
        cmp.add.options(config.options)
      }
      if (config.types) {
        cmp.add.types(config.types)
      }
    }
    return cmp
  }

  /**
   * Return the prototype chain for an object
   * @param obj the object
   * @param stringify if use the constructor name (the default)
   *   else use the prototype class
   */
  export function getPrototypeChain(obj: any, stringify: boolean = true): any[] {
    const chain: any[] = []
    if (stringify) {
      while (obj.__proto__) {
        chain.push(obj.__proto__.constructor.name)
        obj = obj.__proto__
      }
    } else {
      while (obj.__proto__) {
        chain.push(obj.__proto__)
        obj = obj.__proto__
      }
    }
    return chain
  }
}
