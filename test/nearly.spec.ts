import { assert, expect } from 'chai'
import * as chai from 'chai'
import * as mocha from 'mocha'

import { nearly } from '../src/chai-nearly'
import { deepEquals } from '../src/deep-equals'

chai.use(nearly)

describe('Test chai-nearly', () => {

  beforeEach( () => nearly.initialise() )

  it('Should (using defaults) find numbers equal', () => {
    expect(4.0).to.nearly.equal(4.0)
  })

  it('Should not (using defaults) find numbers equal', () => {
    expect(4.0).to.not.nearly.equal(4.0 - 1e-3)
  })

  it('Should (with larger tolerance) find numbers equal', () => {
    expect(4.0).to.nearly(1e-2).equal(4.0 - 1e-3)
  })

  it('Should (with larger tolerance) find numbers equal', () => {
    expect(4.0).to.nearly(1e-2).equal(4.0 - 1e-3)
  })

  it('Should find strings nearly equal (using options)', () => {
    const byPrefix = {
        string: (lhs: string, rhs: string) => lhs.startsWith(rhs)
    }
    expect('abcdef').to.nearly({ types: byPrefix }).equal('abcde')
  })

  it('Should find strings nearly equal (by prefix) ', () => {
    const byPrefix: deepEquals.ICompare =
      (lhs: string, rhs: string) => lhs.startsWith(rhs)
    expect('abcdef').to.nearly(byPrefix).equal('abcde')
  })

  it('Should find strings nearly equal (ignoring case) ', () => {
    const ignoringCase: deepEquals.ICompare =
      (lhs: string, rhs: string) => lhs.toLowerCase() === rhs.toLowerCase()
    const lhs: string = 'AbCdEf'
    const rhs: string = 'aBcDeF'
    expect(lhs).to.not.equal(rhs)
    expect(lhs).to.nearly(ignoringCase).equal(rhs)
  })

  const ignoringOrder: deepEquals.ICompare = (lhs: number[], rhs: number[]) => {
    const rhsCopy: number[] = rhs.slice().sort()
    return lhs.length === rhsCopy.length &&
      lhs.sort().reduce((truth: boolean, value: number, i: number) =>
        truth && value === rhsCopy[i], true) }

  it('Should find arrays equal (ignoring order)', () => {
    const lhs = [1, 2, 3, 4, 5, 6, 7, 8]
    const rhs = [1, 3, 2, 4, 5, 7, 6, 8]
    expect(lhs).to.not.equal(rhs)
    expect(lhs).to.nearly(ignoringOrder).equal(rhs)
  })

  it('Should (using defaults) find nested numbers equal', () => {
    expect({ value: 4.0 }).to.nearly.deep.equal({ value: 4.0 })
  })

  it('Should (using defaults) find multiple nested numbers equal', () => {
    const fixture: any = (x: number = 0) => ({
      a: 1.0 - x,
      b: {
        c: 3.0 + x,
        d: {
          e: 5.0 - x
        }
      },
      f: 'string value',
      g: [1.0 + x, 2.0 - x, 3.0 + x, 4.0 - x]
    })
    const lhs = fixture(0)
    const rhs = fixture(1e-9)
    expect(lhs).to.not.equal(rhs)
    expect(lhs).to.nearly.deep.equal(rhs)
  })

  it('Should pass using initialiser ', () => {
    const ignoringCase: deepEquals.ICompare =
      (lhs: string, rhs: string) => lhs.toLowerCase() === rhs.toLowerCase()
    nearly.initialise(deepEquals.comparison().with.types({ string: ignoringCase }))
    const lhs: string = 'AbCdEf'
    const rhs: string = 'aBcDeF'
    expect(lhs).to.not.equal(rhs)
    expect(lhs).to.nearly.equal(rhs)
  })

})
