import { JQLFunction } from '../__base'

export class ConcatFunction extends JQLFunction<string> {
  constructor() {
    super('string', (...args: any[]): string => {
      return args.join('')
    })
  }
}
