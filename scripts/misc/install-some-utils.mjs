#!/usr/bin/env node

import fs from 'fs/promises'

const installSomeUtils = async () => {
  const tsconfigJSON = JSON.parse(await fs.readFile('tsconfig.json', 'utf-8'))
  tsconfigJSON.compilerOptions.target = 'ES2015'
  tsconfigJSON.compilerOptions.downlevelIteration = true
  tsconfigJSON.compilerOptions.baseUrl = 'src'
  tsconfigJSON.exclude = ['src/some-utils/npm']
  await fs.writeFile('tsconfig.json', JSON.stringify(tsconfigJSON, null, '  '))
}



const isMainModule = import.meta.url.endsWith(process.argv[1])

if (isMainModule) {
  installSomeUtils()
}

