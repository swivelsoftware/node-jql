import { JQLFunction } from '..'

export class ConcatFunction extends JQLFunction<string> {
  constructor() {
    super('string', (...args: any[]): string => {
      return args.join('')
    })
  }
}
