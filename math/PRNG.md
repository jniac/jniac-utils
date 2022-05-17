# PRNG: Pseudo Random Number Generator

# encode / decode

PRNG.encode & PRNG.decode are specials reversible functions:
```js
const x = PRNG.encode('hello, how are you?')
const y = PRNG.decode('e aehuloorlw ,hyo? ')
console.assert(x === y)
```
Useful to mask some values without loosing the hidden value (hash).