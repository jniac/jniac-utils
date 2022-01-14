# some-utils

typescript / react utils

Collections d'utilitaires dans toutes les directions (utilitaires, expérimentations) 
qu'un tree-shaker saura dégraisser.

## tsconfig

Actuellement, pour utiliser "some-utils" en tant que submodule dans un projet 
typescript, il est nécessaire d'activer les réglages suivants : 
```js
{
  "compilerOptions": {
    "target": "ES2015", // because of class private members
    "downlevelIteration": true, // because iteration is cool (but low perf?)
  }
}
```
