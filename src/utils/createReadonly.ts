import _ = require('lodash')

export function createReadonly<T>(object: T): T {
  object = _.cloneDeep(object)
  return new Proxy(object as any, {
    set(): boolean {
      return false
    },
  }) as T
}
