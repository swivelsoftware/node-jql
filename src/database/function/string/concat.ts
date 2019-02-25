import { JQLFunction } from '../interface'

export class ConcatFunction extends JQLFunction<string> {
  constructor() {
    super('string', (...args: string[]) => args.join(''))
  }
}
