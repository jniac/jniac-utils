#!/usr/bin/env node

import fs from 'fs/promises'

const indexTsx = `
import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import './index.css'

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
)

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
`

const appTsx = `
import './App.css'

export const App = () => {
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
      </header>
    </div>
  )
}
`

const craCleanApp = async () => {
  
  const packageJson = JSON.parse(await fs.readFile('package.json'))

  const deletePackageJsonEntries = (key, entries) => {
    for (const entry of entries) {
      if (entry in packageJson[key]) {
        delete packageJson[key][entry]
      }
      else {
        console.warn(`There is no entry "${entry}" to delete.`)
      }
    }
  }

  deletePackageJsonEntries('dependencies', [
    '@testing-library/jest-dom',
    '@testing-library/react',
    '@testing-library/user-event',
    '@types/jest',
    'web-vitals',
  ])

  deletePackageJsonEntries('scripts', ['test'])

  await fs.writeFile('package.json', JSON.stringify(packageJson, null, '  '))

  const deleteFile = async path => {
    try {
      await fs.unlink(path)
    }
    catch (e) {
      console.log(`unlink: File "${path}" not found.`)
    }
  }

  await deleteFile('src/App.test.tsx')
  await deleteFile('src/logo.svg')
  await deleteFile('src/react-app-env.d.ts')
  await deleteFile('src/reportWebVitals.ts')
  await deleteFile('src/setupTests.ts')

  await fs.writeFile('src/index.tsx', indexTsx)
  await fs.writeFile('src/App.tsx', appTsx)
  
  console.log('App cleaned!')
}



const isMainModule = import.meta.url.endsWith(process.argv[1])

if (isMainModule) {
  craCleanApp()
}

