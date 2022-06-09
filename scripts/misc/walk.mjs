import fs from 'fs'
import path from 'path'

/**
 * @typedef {object} Options
 * @property {number} max Max count of iterations over files.
 * @property {number} maxDepth Depth max for the recursive lookup. 
 * @property {RegExp | ((name: string, filepath: string, depth: number) => boolean)} skip Skip something?
 * @property {boolean} skipDirectories Skip directories?
 * @property {boolean} skipFiles Skip files?
 * @property {boolean} skipDot Skip dot directories or files?
 */

/**
 * Usage:
 * ```
 *  for await (const file of walk('public/some-utils')) {
 *    doSomethingWith(file)
 *  }
 * ```
 * @param {string} dir 
 * @param {Options} options 
 * @yields {{ name: string, file: string, entry: fs.Dirent }}
 */
export async function* walk(dir, {
  max = Infinity,
  maxDepth = Infinity,
  skip,
  skipDirectories = false,
  skipFiles = false,
  skipDot = true,
} = {}) {
  
  const queue = [{ dir, depth: 0 }]
  let count = 0

  const _skip = (
    skip === undefined ? () => false :
    skip instanceof RegExp ? name => skip.test(name) :
    skip
  )

  while (queue.length > 0) {
    const { dir, depth } = queue.shift()
    for await (const entry of await fs.promises.opendir(dir)) {

      if (count > max) {
        return
      }

      const filepath = path.join(dir, entry.name)

      if (_skip(entry.name, filepath, depth)) {
        continue
      }

      if (skipDot && entry.name.startsWith('.')) {
        continue
      }

      if (entry.isDirectory()) {
        if (depth < maxDepth) {
          queue.push({ dir: filepath, depth: depth + 1 })
        }
        if (skipDirectories === false) {
          yield { name: entry.name, file: filepath, entry }
        }
      }

      else {
        if (skipFiles === false) {
          yield { name: entry.name, file: filepath, entry }
        }
      }

      count++
    }
  }
}
