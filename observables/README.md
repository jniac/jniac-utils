# intentions :

## Ownership

´´´js
const me = new Symbol("me")
const myValue = new Observable(1).own(me)

myValue.set(2, { owner: me })

myValue.set(3) // error
´´´

