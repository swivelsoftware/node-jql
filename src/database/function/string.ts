import { JQLFunction } from './base'

export class AsciiFunction extends JQLFunction<number> {
  constructor() {
    super('number', (value: any): number => {
      return String(value).charCodeAt(0)
    })
  }
}

export class ConcatFunction extends JQLFunction<string> {
  constructor() {
    super('string', (...args: any[]): string => {
      return args.join('')
    })
  }
}
