// Because BROWSER="Google Chrome Dev" (or any other syntax) doesn't work.
// usage:
// (.env)
// BROWSER=src/some-utils/scripts/misc/browser-start.js

// @ts-ignore
const { spawn } = require('child_process')

const [,,url] = process.argv

spawn('/Applications/Google Chrome Dev.app/Contents/MacOS/Google Chrome Dev', [url])
