# PRNG: Pseudo Random Number Generator

## Very WIP here
And, maybe, a lot to learn before cleaning anything ([prng](https://en.wikipedia.org/wiki/Pseudorandom_number_generator), 
[lcg](https://en.wikipedia.org/wiki/Linear_congruential_generator)).

## encode / decode

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
