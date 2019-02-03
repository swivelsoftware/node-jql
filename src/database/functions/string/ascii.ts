import { JQLFunction } from '../__base'

export class AsciiFunction extends JQLFunction<number> {
  constructor() {
    super('number', (value: any): number => {
      return String(value).charCodeAt(0)
    })
  }
}
