import { JQLFunction } from './base'

export class SumFunction extends JQLFunction<number> {
  constructor() {
    super('number', (...args: any[]): number => {
      return args.reduce((result, arg) => {
        if (typeof arg === 'string') arg = +arg
        if (isNaN(arg)) return result
        return result + arg
      }, 0)
    })
  }

  // @override
  public runGroupBy(...args: number[]): number {
    return this.run(...args)
  }
}
