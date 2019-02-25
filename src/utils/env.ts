export function getEnv(key: string): string|undefined {
  return process.env[`JQL-${key.toLocaleUpperCase()}`]
}

export function setEnv(key: string, value: string) {
  process.env[`JQL-${key.toLocaleUpperCase()}`] = value
}
