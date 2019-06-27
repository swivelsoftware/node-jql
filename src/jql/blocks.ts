import squel = require('squel')
import { checkNull } from '../utils/check'

export class DatabaseBlock extends squel.cls.Block {
  private _database: string

  public database(name: string): void {
    this._database = this._sanitizeName(name, 'database')
  }

  // @override
  public _toParamString(): squel.ParamString {
    if (!checkNull(this._database)) throw new SyntaxError('Missing database')
    return {
      text: this._formatTableName(this._database),
      values: [],
    }
  }
}

export class IfNotExistsBlock extends squel.cls.Block {
  private _ifNotExists = false

  public ifNotExists(): void {
    this._ifNotExists = true
  }

  // @override
  public _toParamString(): squel.ParamString {
    return {
      text: this._ifNotExists ? 'IF NOT EXISTS' : '',
      values: [],
    }
  }
}
