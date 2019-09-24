import format from 'string-format'
import { ConditionalExpression, Expression } from '..'
import { IExpression } from '../index.if'
import { parse, register } from '../parse'
import { Unknown } from '../unknown'
import { IBetweenExpression } from './index.if'

/**
 * {left} BETWEEN {start} AND {end}
 */
export class BetweenExpression extends ConditionalExpression implements IBetweenExpression {
  // @override
  public readonly classname: string = BetweenExpression.name

  // @override
  public left: Expression

  // @override
  public $not: boolean

  // @override
  public start: Expression

  // @override
  public end: Expression

  constructor(json: IBetweenExpression)
  constructor(left: Expression, $not: true, start: Expression, end: Expression)
  constructor(left: Expression, start: Expression, end: Expression)
  constructor(...args: any[]) {
    super()

    // parse
    let left: IExpression, $not: boolean = false, start: IExpression, end: IExpression
    if (args.length === 1) {
      const json = args[0] as IBetweenExpression
      left = json.left
      if (json.$not) $not = json.$not
      start = json.start || new Unknown(['any'])
      end = json.end || new Unknown(['any'])
    }
    else if (typeof args[1] === 'boolean') {
      left = args[0] as Expression
      $not = true
      start = args[2] as Expression
      end = args[3] as Expression
    }
    else {
      left = args[0] as Expression
      start = args[1] as Expression
      end = args[2] as Expression
    }

    // set
    this.left = parse(left)
    this.$not = $not
    this.start = parse(start)
    this.end = parse(end)
  }

  // @override
  public toJson(): IBetweenExpression {
    return {
      classname: this.classname,
      left: this.left.toJson(),
      $not: this.$not,
      start: this.start.toJson(),
      end: this.end.toJson(),
    }
  }

  // @override
  public toString(): string {
    return format(
      this.$not ? '{0} NOT BETWEEN {1} AND {2}' : '{0} BETWEEN {1} AND {2}',
      this.left.toString(),
      this.start.toString(),
      this.end.toString(),
    )
  }
}

register(BetweenExpression)
