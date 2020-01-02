import { Expression } from '.'
import { Column } from '../column'
import { IColumn } from '../index.if'
import { register } from '../parse'
import { IColumnDefExpression } from './index.if'

/**
 * Column definition
 */
export class ColumnDefExpression extends Expression implements IColumnDefExpression {
  public readonly classname: string = ColumnDefExpression.name
  public readonly column: Column

  constructor(json: IColumn|IColumnDefExpression) {
    super()
    if ('classname' in json) {
      this.column = new Column((json as IColumnDefExpression).column)
    }
    else {
      this.column = new Column(json as IColumn)
    }
  }

  // @override
  public toJson(): IColumnDefExpression {
    return {
      classname: this.classname,
      column: this.column.toJson(),
    }
  }
}

register(ColumnDefExpression)
