import { assert, expect } from 'chai'
import * as chai from 'chai'
import * as mocha from 'mocha'
import { deepEquals } from '../src/deep-equals'


describe('Test deepEquals', () => {
  let lhs: any, rhs: any
  describe('Test deepEquals on primatives', () => {

    const fixture = (): any => [
      true, false, 1, 0, '', 'foo', null, undefined, Number('foo')]

    it('Should show primatives equal', () => {
      const values: any[] = fixture()
      values.map(value => assert.isTrue(deepEquals(value, value)))
    })

    it('Should show primatives not equal', () => {
      const values: any[] = fixture()
      values.map(value => assert.isFalse(deepEquals(value, {})))
    })

  })

  describe('Test deepEquals on arrays', () => {

    it('Should show [] === []', () => {
      assert.isTrue(deepEquals([], []))
    })

    it('Should show [...] !== []', () => {
      assert.isFalse(deepEquals([1, 2, 3], []))
    })

    it('Should show nested arrays values are equal', () => {
      const fixture = (): any[] => [[1, 2, 3], '4', '5', ['6', ['7', '8', [9, 10]]]]
      lhs = fixture()
      rhs = fixture()
      expect(lhs).to.be.not.equal(rhs)
      assert.isTrue(deepEquals(lhs, rhs))
    })

    it('Should show nested arrays values are not equal', () => {
      const fixture = (n: any): any[] => [[1, 2, 3], '4', '5', ['6', ['7', '8', [9, n]]]]
      lhs = fixture(10)
      rhs = fixture('10')
      assert.isFalse(deepEquals(lhs, rhs))
    })

  })

  describe('Test deepEquals on objects', () => {

    it('Should show {} === {}', () => {
      assert.isTrue(deepEquals({}, {}))
    })

    const fixture = (h: any = 10): any => ({
      a: 1,
      b: 'two',
      c: ['three', 'four', { five: 6 }],
      d: {
        e: {
          f: [7, 8, 9],
          g: null,
          h : h
        }
      }
    })

    it('Should show identical objects are equal', () => {
      lhs = fixture()
      expect(lhs).to.be.equal(lhs)
      assert.isTrue(deepEquals(lhs, lhs))
    })

    it('Should show object properties are equal', () => {
      lhs = fixture()
      rhs = fixture()
      expect(lhs).to.be.not.equal(rhs)
      assert.isTrue(deepEquals(lhs, rhs))
    })

    it('Should show object property values are not equal', () => {
      lhs = fixture()
      rhs = fixture('10')
      expect(lhs).to.be.not.equal(rhs)
      assert.isFalse(deepEquals(lhs, rhs))
    })

    it('Should show object properties are not equal', () => {
      lhs = fixture()
      rhs = Object.assign(fixture(), { i: 11 })
      expect(lhs).to.be.not.equal(rhs)
      assert.isFalse(deepEquals(lhs, rhs))
    })
  })

  describe('Test deepEquals with custom comparitor', () => {

    class Animal {
      legs: number = 4
      claws: boolean = true
      teeth: string = 'lots!'
      tail: boolean = true
    }

    it('Should show subset of object properties equal', () => {
      lhs = new Animal()
      rhs = new Animal()
      rhs.tail = false
      const sameLegs: deepEquals.ICompare = (lhs: Animal, rhs: Animal): boolean => {
        return lhs.legs === rhs.legs
      }
      expect(lhs).to.be.not.equal(rhs)
      assert.isFalse(deepEquals(lhs, rhs))
      assert.isTrue(deepEquals(lhs, rhs, {
        types: { Animal: sameLegs }
      }))
    })

    it('Should not hang on recursive object references', () => {
      lhs = new Animal()
      rhs = new Animal()
      lhs.me = lhs
      rhs.me = rhs
      expect(lhs).to.not.be.equal(rhs)
      assert.doesNotThrow(() => deepEquals(lhs, rhs))
      assert.isTrue(deepEquals(lhs, rhs))
    })
  })

})

describe('Test equals', () => {

  let lhs: any, rhs: any

  describe('Test equals on primatives', () => {

    const fixture = (): any => [
      true, false, 1, 0, '', 'foo', null, undefined, Number('foo')]

    it('Should show primatives equal', () => {
      const values: any[] = fixture()
      values.map(value => assert.isTrue(deepEquals.equals(value, value)))
    })

    it('Should show primatives not equal', () => {
      const values: any[] = fixture()
      values.map(value => assert.isFalse(deepEquals.equals(value, {})))
    })

  })

  describe('Test equals on arrays', () => {

    it('Should show [] === []', () => {
      assert.isTrue(deepEquals.equals([], []))
    })

    it('Should show [...] !== []', () => {
      assert.isFalse(deepEquals.equals([1, 2, 3], []))
    })

    it('Should show different arrays with the same values are equal', () => {
      const fixture = (): any[] => [[1, 2, 3], '4', '5', ['6', ['7', '8', [9, 10]]]]
      lhs = fixture()
      rhs = fixture()
      assert.isTrue(deepEquals.equals(lhs, rhs))
    })

  })

  describe('Test equals on objects', () => {

    it('Should show {} === {}', () => {
      assert.isTrue(deepEquals.equals({}, {}))
    })

    const fixture = (h: any = 10): any => ({
      a: 1,
      b: 'two',
      c: ['three', 'four', { five: 6 }],
      d: {
        e: {
          f: [7, 8, 9],
          g: null,
          h : h
        }
      }
    })

    it('Should show identical objects are equal', () => {
      lhs = fixture()
      expect(lhs).to.be.equal(lhs)
      // assert.isTrue(equals(lhs, lhs))
    })

    it('Should show different objects with same properties/values are equal', () => {
      lhs = fixture()
      rhs = fixture()
      assert.isTrue(deepEquals.equals(lhs, rhs))
    })

    it('Should show different objects with different properties/values are equal', () => {
      lhs = fixture()
      rhs = fixture('10')
      assert.isFalse(deepEquals.equals(lhs, rhs))
    })
  })

})

describe('Test compare classes', () => {

  it('Should create comparison', () => {
    const cmp: deepEquals.IComparison = deepEquals.comparison().add.options({ tolerance: 1.5 })
    assert.equal(cmp.config.options.tolerance, 1.5)
  })

  it('Should merge options', () => {
    const cmp: deepEquals.IComparison = deepEquals.comparison()
      .add.options({ tolerance: 1e-6 })
      .add.options({ tolerance: 1e-3 })
    assert.equal(cmp.config.options.tolerance, 1e-3)
  })
})
