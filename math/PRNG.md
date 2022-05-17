# PRNG: Pseudo Random Number Generator

# encode / decode

PRNG.encode & PRNG.decode are specials reversible functions:
```js
const x = 'hello, how are you?'
const y = PRNG.encode(x, { seed: 98765 })

console.assert(y === 'e aehuloorlw ,hyo? ')

const z = PRNG.decode(y, { seed: 98765 })
console.assert(z === x)
```
Useful to mask some values without loosing the hidden value (unlike hashes).

NOTE: encode / decode use an internal, computed-first, fixed array of random floats.
Thoses numbers are used in one direction or the other to transform the input into 
the output.
