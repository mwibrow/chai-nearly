import { isArray, isFunction, isNull, isNumber, isObject, isPrimitive, isString, isUndefined } from 'util'

const MAX_DEPTH = Number.MAX_SAFE_INTEGER

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
  return compare(lhs, rhs, processOptions(options), 0)
}

function processOptions(options?: any) {

  const processed = mergeOptions(DEEP_EQUAL_DEFAULTS, options || {})
  return processed
}

export function mergeOptions(lhs: ICompareOptions, rhs: ICompareOptions): ICompareOptions {
  return (<ICompareOptions>mergeOptionsHelper(lhs, rhs))
}

function mergeOptionsHelper(lhs: any, rhs: any): any {
  if (isPrimitive(lhs) || isArray(lhs) || isNull(lhs)) {
    return rhs
  }
  if (isPrimitive(rhs) || isArray(rhs) || isNull(rhs) || isFunction(rhs)) {
    return rhs
  }
  const options: any = Object.assign({}, lhs)
  for (let key in rhs) {
    if (rhs.hasOwnProperty(key)) {
      if (options[key]) {
        options[key] = mergeOptionsHelper(options[key], rhs[key])
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
 * @param options options to customer the behaviour of the function
 * @param depth level of recursion, default Number.MAX_SAFE_INTEGER
 */
function compare (lhs: any, rhs: any, options?: any, depth?: number): boolean {
  return compareHelper(lhs, rhs, options, depth, [])
}

/**
 *
 * @param lhs first object to compare
 * @param rhs second object to compare
 * @param options options to customer the behaviour of the function
 * @param depth level of recursion, default Number.MAX_SAFE_INTEGER
 * @param parents stack of parents
 */
function compareHelper(lhs: any, rhs: any, options: any = {}, depth: number = MAX_DEPTH, parents: any[] = []): boolean {
  depth --
  const compare: Function = depth > 0 ? compareHelper : (lhs: any, rhs: any, ...args: any[]) => lhs === rhs
  const lhsType: string = typeof lhs
  const rhsType: string = typeof rhs
  let comparison: boolean
  /* Objects */
  if (isObject(lhs)) {
    /* Class prototypes */
    const chain = getPrototypeChain(lhs)
    for (let i = 0; i < chain.length; i ++) {
      if (options[chain[i]]) {
        return options[chain[i]](lhs, rhs, options)
      }
    }
    /* Types */
    if (lhsType !== rhsType) {
      return false
    }
    /* Custom comparitor for types */
    if (options[lhsType]) {
      return options[lhsType](lhs, rhs, options)
    }
    /* Generic 'any' type */
    if (options.any) {
      return options.any(lhs, rhs, options)
    }
    /* Arrays */
    if (isArray(lhs)) {
      if (lhs.length !== rhs.length) {
        return false
      }
      return lhs.reduce((assert: boolean, value: any, index: number) =>
        assert && compareHelper(value, rhs[index], options, depth, parents), true)
    }
    /* Circular references are ignored */
    if (parents.indexOf(lhs) !== -1) {
      return true
    }
    parents = parents.concat(lhs)
    if (lhs === rhs) {
      return true
    }
    const lhsKeys = Object.keys(lhs).filter(key => !isUndefined(lhs[key]) || options.strict)
    const rhsKeys = Object.keys(rhs).filter(key => !isUndefined(rhs[key]) || options.strict)
    if (lhsKeys.length !== rhsKeys.length) {
      return false
    }
    return lhsKeys
      .reduce((assert: boolean, key: string) =>
        assert && compareHelper(lhs[key], rhs[key], options, depth, parents), true)
  }
  /* Primatives */
  if (options[lhsType]) {
    return options[lhsType](lhs, rhs, options)
  }
  if (options.any) {
    return options.any(lhs, rhs, options)
  }
  return lhsType === rhsType && lhs === rhs
}

export interface IComparitor {
  (lhs: any, rhs: any, options?: any): boolean
}

export interface ICompareOptions {
  strict?: boolean,
  tolerance?: number
  [key: string]: any
}

export interface IDeepEqualComparitors {
  [key: string]: IComparitor
}

export interface IDeepEqualIgnoreKeys {
  [key: string]: string[]
}

export const primitiveComparitor: IComparitor = function(lhs: any, rhs: any) {
  return typeof lhs === typeof rhs && lhs === rhs
}

export const numberComparitor: IComparitor = function(lhs: any, rhs: any) {
  if (isNaN(lhs)) {
    return isNumber(rhs) && isNaN(rhs)
  }
  return lhs === rhs
}

export const DEEP_EQUAL_DEFAULTS: ICompareOptions = {
  number: numberComparitor
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
