import { stringify } from './dbType/stringify'
import { ColumnExpression } from './expression/column'
import { IConstraint, IPrimaryKeyConstraint, IStringify } from './index.if'
import { register } from './parse'

/**
 * Raw string constraint
 */
export class Constraint implements IConstraint, IStringify {
  public readonly classname: string = Constraint.name
  public value: string

  constructor(json: string|IConstraint) {
    try {
      if (typeof json === 'string') {
        this.value = json
      }
      else {
        this.value = json.value
      }
    }
    catch (e) {
      // do nothing
    }
  }

  // @override
  public toString(): string {
    return stringify(this.classname, this)
  }

  // @override
  public toJson(): IConstraint {
    return {
      classname: this.classname,
      value: this.value,
    }
  }
}

/**
 * PRIMAYR KEY constraint
 */
export class PrimaryKeyConstraint extends Constraint implements IPrimaryKeyConstraint {
  public readonly classname: string = PrimaryKeyConstraint.name
  public readonly columns: ColumnExpression[] = []

  constructor(json: string|IPrimaryKeyConstraint) {
    super(json)
    if (typeof json === 'string') {
      this.columns = [new ColumnExpression(json)]
    }
    else {
      this.columns = json.columns.map(json => new ColumnExpression(json))
    }
  }

  // @override
  get value(): string {
    return this.toString()
  }

  // @override
  public toJson(): IPrimaryKeyConstraint {
    return {
      classname: this.classname,
      columns: this.columns.map(col => col.toJson()),
      value: '',
    }
  }
}

register(Constraint)
register(PrimaryKeyConstraint)
