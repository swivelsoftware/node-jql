export function createFunction (function_: string) {
  function_ = function_.trim()
  if (!function_.startsWith('function')) throw new Error(`invalid function '${function_}'`)

  const argsIndex = [function_.indexOf('(') + 1, function_.indexOf(')')]
  const bodyIndex = [function_.indexOf('{') + 1, function_.lastIndexOf('}')]
  if (argsIndex[1] > bodyIndex[0]) throw new Error(`invalid function '${function_}'`)
  if (bodyIndex[1] - bodyIndex[0] === 1) throw new Error(`empty function '${function_}'`)

  let args: string[] = []
  if (argsIndex[1] - argsIndex[0] > 1) {
    args = function_.substring(argsIndex[0], argsIndex[1]).split(',').map(pc => pc.trim())
  }
  args.push(function_.substring(bodyIndex[0], bodyIndex[1]))
  
  return new Function(...args)
}