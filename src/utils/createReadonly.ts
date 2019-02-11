export function createReadonly<T>(object: T): T {
  return new Proxy(object as any, {
    get<T>(target, p): T|undefined {
      if (target[p] === undefined) return undefined
      if (typeof target[p] === 'object') return createReadonly<T>(target[p])
      return target[p]
    },
    set(target, p): boolean {
      throw new Error(`this is a readonly object. you cannot change its properties`)
    },
  }) as T
}
