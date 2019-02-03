import { JQLFunction } from '../__base'

export class SumFunction extends JQLFunction<number> {
  constructor() {
    super('number', (...args: any[]): number => {
      return args.reduce((result, arg) => result + arg, 0)
    })
  }

  public runGroupBy(...args: number[]): number {
    return this.run(...args)
  }
}
