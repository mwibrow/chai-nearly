import { assert, expect } from 'chai'
import * as chai from 'chai'
import * as mocha from 'mocha'
import { deepEquals, mergeOptions, ICompare, ICompareOptions } from '../src/deep-equals'


describe('Test merge options', () => {

  let lhs: ICompareOptions, rhs: ICompareOptions, options: ICompareOptions
  it('Should merge empty objects', () => {
    lhs = {}
    rhs = {}
    options = mergeOptions(lhs, rhs)
    assert.isTrue(deepEquals(options, {}))
  })

  it('Should replace property', () => {
    lhs = { a: 1 }
    rhs = { a: 2 }
    options = mergeOptions(lhs, rhs)
    expect(options).is.not.equal(rhs)
    assert.isTrue(deepEquals(options, rhs))
  })

  it('Should replace nested property', () => {
    lhs = { a: { b: 2 } }
    rhs = { a: { b: 3 } }
    options = mergeOptions(lhs, rhs)
    expect(options).is.not.equal(rhs)
    assert.isTrue(deepEquals(options, rhs))
  })
})