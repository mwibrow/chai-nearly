chai = require('chai')
nearly = require('../dist/nearly')

chai.use(nearly)

const expect = chai.expect

describe('Test chai-nearly', () => {

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

  it('Should find numbers equal (tolerance specified as object)', () => {
    expect(4.0).to.nearly({ tolerance: 1e-2 }).equal(4.0 - 1e-3)
  })

  it('Should find strings nearly equal (using options)', () => {
    const byPrefix = {
      types: {
        string: (lhs, rhs) => lhs.startsWith(rhs)
      }
    }
    expect('abcdef').to.nearly(byPrefix).equal('abcde')
  })

  it('Should find strings nearly equal (by prefix) ', () => {
    const byPrefix =
      (lhs, rhs) => lhs.startsWith(rhs)
    expect('abcdef').to.nearly(byPrefix).equal('abcde')
  })

  it('Should find strings nearly equal (ignoring case) ', () => {
    const ignoringCase =
      (lhs, rhs) => lhs.toLowerCase() === rhs.toLowerCase()
    const lhs = 'AbCdEf'
    const rhs = 'aBcDeF'
    expect(lhs).to.not.equal(rhs)
    expect(lhs).to.nearly(ignoringCase).equal(rhs)
  })

  const ignoringOrder = (lhs, rhs) => {
    const rhsCopy = rhs.slice().sort()
    return lhs.length === rhsCopy.length &&
      lhs.sort().reduce((truth, value, i) =>
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
    const fixture = (x = 0) => ({
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
    expect(lhs).to.not.nearly.equal(rhs)
    expect(lhs).to.nearly.deep.equal(rhs)
  })
})
