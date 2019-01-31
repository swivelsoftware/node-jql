export function createReadonly<T>(object: T): T {
  return new Proxy(object as any, {
    get<T>(target, p): T|undefined {
      if (target[p] === undefined) return undefined
      return createReadonly<T>(target[p])
    },
    set(): boolean {
      return false
    },
  }) as T
}
