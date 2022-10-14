# some-utils

typescript / react utils

Collections d'utilitaires dans toutes les directions (utilitaires, expérimentations) 
qu'un tree-shaker saura dégraisser.

[Animation est pratique](some-utils/tree/main/Animation)

[Vertigo Camera est pas mal](some-utils/tree/main/npm/three/vertigo-2)

## Installation
Par exemple :
```bash
git submodule add https://github.com/jniac/some-utils.git src/some-utils

# setup the tsconfig
src/some-utils/scripts/misc/install-some-utils.mjs

# clean react-app from test
src/some-utils/scripts/misc/cra-clean-app.mjs
```

## tsconfig

### compilerOptions
Actuellement, pour utiliser "some-utils" en tant que submodule dans un projet 
typescript, il est nécessaire d'activer les réglages suivants : 
```js
{
  "compilerOptions": {
    "target": "ES2015",           // because of class private members
    "downlevelIteration": true,   // because iteration is cool (but low perf?)
    "resolveJsonModule": true,    // because of colors.json & others
  }
}
```

### exclude
Certains utilitaires s'appuie sur des modules NPM qui peuvent être absent. 
Il est alors nécessaire d'exclure les ressources concernées.
```js
{
  "include": [
    "src"
  ],
  "exclude": [
    // Exclusion générique
    "src/some-utils/npm",

    // Exclusion spécifique
    "src/some-utils/npm/three",
    "src/some-utils/npm/@react-three"
  ]
}
```
