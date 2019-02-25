import { JQLError } from './error'

// create function from script
export function createFunction(function_: string): Function {
  function_ = function_.trim()

  // check syntax valid
  if (!function_.startsWith('function')) throw new JQLError(`Syntax error at position 0: keyword 'function' is missing`)

  // get code and check code valid
  const argsIndex = [function_.indexOf('(') + 1, function_.indexOf(')')]
  const bodyIndex = [function_.indexOf('{') + 1, function_.lastIndexOf('}')]
  if (argsIndex[1] > bodyIndex[0]) throw new JQLError(`Syntax error at position ${bodyIndex[0]}: curved bracket '{}' is not allowed in argument section 'function()'`)
  if (bodyIndex[1] - bodyIndex[0] === 1) throw new JQLError(`Syntax error at position ${bodyIndex[0]}: empty function detected`)

  let args: string[] = []

  // arg1, arg2, ... argN
  if (argsIndex[1] - argsIndex[0] > 1) {
    args = function_.substring(argsIndex[0], argsIndex[1]).split(',').map((pc) => pc.trim())
  }

  // functionBody
  args.push(function_.substring(bodyIndex[0], bodyIndex[1]))

  return new Function(...args)
}
