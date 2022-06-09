import * as cp from 'child_process'

/**
 * @typedef {object} Options
 * @property {RegExp} splitArg How to split the arguments?
 * @property {boolean} pipe Should we pipe the project to the main process?
 * @property {string} cwd The current directory where the process should run.
 */

/**
 * Spawn use one line of arguments, split into command and args.
 * @param {string} line 
 * @param {Options} options 
 * @returns {Promise<string>}
 */
export const spawn = (line, {
  splitArg = /\s+/,
  pipe = true,
  cwd = process.cwd(),
} = {}) => new Promise(resolve => {
  const [command, ...args] = line.split(splitArg)
  const child = cp.spawn(command, args, { cwd, env : { ...process.env, FORCE_COLOR: true } })
  if (pipe) {
    child.stdin.pipe(process.stdin)
    child.stdout.pipe(process.stdout)
    child.stderr.pipe(process.stderr)
  }
  const out = []
  child.stdout.on('data', chunk => out.push(chunk))
  child.on('close', () => {
    resolve(out.join(''))
  })
})