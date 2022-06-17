#!/usr/bin/env node
// Because BROWSER="Google Chrome Dev" (or any other syntax) doesn't work.
// usage (.env):
// BROWSER=src/some-utils/scripts/misc/browser-start.js

// @ts-ignore
const { spawn } = require('child_process')
// @ts-ignore
const os = require('os')

const [,,url = ''] = process.argv

/**
 * 
 * @param  {Parameters<typeof spawn>} spawnArgs 
 * @returns {Promise<{ ok: boolean, child: ChildProcess }>}
 */
const trySpawn = (...spawnArgs) => new Promise(resolve => {
  const child = spawn(...spawnArgs)
  child.on('spawn', () => resolve({ ok: true, child }))
  child.on('error', () => resolve({ ok: false, child }))
})

const echoSpawn = (...spawnArgs) => new Promise((resolve, reject) => {
  const child = spawn(...spawnArgs)
  const result = []
  child.stdout.on('data', data => {
    result.push(data)
  })
  child.on('close', () => {
      resolve(result.join(''))
  })
  child.on('error', error => reject(error))
})

const main = async () => {
  if (os.type() === 'Darwin') {
    // Ok you're right, it's a weird option, it allows me to run a Google Chrome instance dedicated to development.
    const userDir = await echoSpawn('echo', [`~`])
    if ((await trySpawn('/Applications/Google Chrome Yahaaa!.app/Contents/MacOS/Google Chrome', [`--user-data-dir=${userDir}/chrome-yahaa`, url])).ok) {
      return
    }
    if ((await trySpawn('/Applications/Google Chrome Dev.app/Contents/MacOS/Google Chrome Dev', [url])).ok) {
      return
    }
    if ((await trySpawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [url])).ok) {
      return
    }
  }
}

main()
