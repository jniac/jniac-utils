# some-utils

typescript / react utils

Collections d'utilitaires dans toutes les directions qu'un tree-shaker saura faire maigrir.

## pure-observable
Tentative d'écrire les observables selon deux versions : 
- Les observables "purs" dont la valeur interne ne peut pas être modifiée par 
  simple référence (pas de méthode `setValue` associée). En revanche à la création
  il est possible de récupérer une référence de type `ValueSetter<T>` qui permet 
  de modifier la dite valeur (via une méthode `consumeValueSetter()`). 

  Ansi nous avons d'un coté un observable purement observable. De l'autre une 
  méthode pour changer l'observable. Il est attendu que le scope où est créé
  l'observable soit celui qui permettra les modifications futures. La distribution
  de l'observable à travers les différents scopes du programme se réduit à l'usage
  premier d'un observable : la possibilité d'observer les modifications.
- À coté de cela est donc proposé une version "modifiable" (mutable, Observable,
  ObservableNumber etc.). Cette version permet donc de modifier la valeur de
  l'observable par simple référence : une méthode `setValue` est cette fois 
  disponible sur les instances.

### Problèmes :  

Cela pose d'insurmontables problèmes d'héritages en javascript : 

Il existe deux observables de base : 
- `Observable<T>`
- `Observable<T>`

Les variantes (dont l'intérêt est grand, ex: ObservableNumber.prototype.onPassAbove)
doivent maintenant implémenter chacune de leur coté la version "mut". En effet :
- `ObservableNumber` hérite de `Observable<number>`
- `ObservableNumber` hérite de `ObservableNumber` et non pas de `Observable<number>`
Quelque soit la variante XXX, `ObservableXXX` doit donc ré-implémenter `setValue`
de son coté. Une interface `Mut` est alors proposé pour s'assurer de la bonne 
convergence des différentes variantes.

Cela devient un peu lourdingue. Et cela ne couvre pas la problématique suivante : 
Comment à partir d'une version "modifiable" (Mut) permettre un accès "readonly" ?
Il avait été envisagé d'offrir une option : 
- `myObservable.toReadonly()`
Cela aurait offert l'accès à un "enfant" lié à la variable d'origine (via `onChange`)

Enfin la méthode `consumeValueSetter()` est pensée d'abord pour un usage interne.
Il ne paraît pas souhaitable de devoir se servir des observables de la façon suivante : 
```js
import { Observable, ValueSetter } from 'observables'
const myObs = new Observable<MyType>(myValue)
const myObsSetter = Observable.consumeValueSetter() as ValueSetter<MyType>
```
Aussi une option :
```js
const { observable, setValue } = Observable.create(myValue)
```
paraissait raisonnable. Mais cela est totalement impossible dans le cas d'une 
classe `ObservableNumber` car en typescript les méthodes statiques sont AUSSI 
héritées!! ([cf stackoverflow](https://stackoverflow.com/a/64357307/4696005)) 
Et la signature ne peut donc être changée. 

### Conclusion

Pour la question de l'ownership, il semble préférable de le traiter ainsi :
```js
const me = new Symbol("me")
const myValue = new Observable(1).own(me)

myValue.setValue(2, { owner: me }) // ok

myValue.setValue(3) // error
```
