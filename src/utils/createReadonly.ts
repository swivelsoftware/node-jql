export function createReadonly<T>(object: T): T {
  return new Proxy(object as any, {
    set(): boolean {
      return false
    },
  }) as T
}
