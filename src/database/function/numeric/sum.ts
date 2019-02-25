import { JQLFunction } from '../interface'

export class SumFunction extends JQLFunction<number> {
  constructor() {
    super('number', (...args: number[]) => args.reduce((total, value) => total + value, 0))
  }

  public group(...args: number[]): number {
    return this.run(...args)
  }
}
