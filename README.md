# chai-nearly

*Chai-nearly* provides [Chai](http://chaijs.com/) compatible
deep and shallow assertions
for things that are the nearly the same.

The package issimilar to
[chai-roughly](https://github.com/Turbo87/chai-roughly),
[chai-almost](https://github.com/nmuldavin/chai-almost),
and
[chai-stats](https://github.com/chaijs/chai-stats),
but aims to provide customisable assertions for
situations where things other than numbers might be
considered nearly equal.

## Overview

Chai-nearly is pre-alpha. It may not work as documented and will
probably introduce breaking changes with on-going development.

## Installation

TODO

## Usage

Chai-nearly can be used in JavaScript in the usual manner:

```
chai = require('chai')
nearly = require('../dist/nearly')

chai.use(nearly)
```

However, Chai-nearly is Typescript-ready can be
imported as follows:


```
import * as chai from 'chai'
import { nearly } from 'chai-nearly'

chai.use(nearly)
```

Basic usage focuses around numerical comparisons with a certain
tolerance (which by defalut is `1e-6`):

```
it('Passes', () => {
  expect(4.0).to.nearly.equal(3.999999)
})

it('Fails', () => {
  expect(4.0).to.nearly.equal(3.999)
})

it('Now passes', () => {
  expect(4.0).to.nearly(1e-1).equal(3.999)
})
```

However custom 'comparitors' can be used
by passing a function to the `nearly` assertion:

```
import * as chai from 'chai'
import { nearly, IComparitor } from 'chai-nearly'
chai.use(nearly)

const byPrefix: IComparitor =
  (lhs: string, rhs: string) => lhs.startsWith(rhs)

it('Should find strings nearly equal', () => {
  expect('abcdef').to.nearly(byPrefix).equal('abcde')
})
```

### Deep equals

Chai-nearly comes with its own implementation of
deep comparison for objects. The aim is to provide
a certain level of flexibility and
customisation which may result in performance hits
in comparision to other implementations.
