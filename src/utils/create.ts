import { JQLError } from './error'

// create function from script
export function createFunction(function_: string): Function {
  function_ = function_.trim()
  if (!function_.startsWith('function')) throw new JQLError(`Syntax error at position 0: keyword 'function' is missing`)

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

// create readonly object
export function createReadonly<T>(object: T): T {
  return new Proxy(object as any, {
    get<T>(target, p): T|undefined {
      if (target[p] !== null && typeof target[p] === 'object') return createReadonly<T>(target[p])
      return target[p]
    },
    set(target, p): boolean {
      throw new JQLError(`Cannot assign to read only property '${p.toString()}' of ${target}`)
    },
  }) as T
}
