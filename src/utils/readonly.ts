import { JQLError } from './error'

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
