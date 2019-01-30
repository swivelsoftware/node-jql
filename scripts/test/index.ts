/* tslint:disable:no-console */

import { Expect } from './expect'

const chalk = require('chalk')
const minimist = require('minimist')
const path = require('path')

const argv = minimist(process.argv.slice(2))
if (!argv._.length) throw new Error('you must specify at least 1 file to be tested')

interface ITest { name: string, fn: () => void }
const tests: ITest[] = []

global['test'] = (name: string, fn: () => void) => {
  tests.push({ name, fn })
}

global['expect'] = (value: any) => new Expect(value)

for (const filepath of argv._) {
  require(path.resolve(__dirname, '..', '..', filepath))
}

let promise = Promise.resolve()
for (const { name, fn } of tests) {
  const start = process.hrtime()
  promise = promise
    .then(() => {
      console.log(chalk.inverse('[TEST]'), name, chalk.gray(`start`))
      return new Promise<any>((resolve) => resolve(fn()))
    })
    .then(() => {
      const timeTaken = process.hrtime(start)
      console.log(chalk.inverse('[TEST]'), name, chalk.green(`completed in ${timeTaken[0] * 1e6 + Math.round(timeTaken[1] * 1e-6)}ms`))
      console.log()
    })
    .catch((e) => {
      console.error(chalk.inverse('[TEST]'), name, chalk.red(e.stack))
      console.error()
      process.exit()
    })
}
