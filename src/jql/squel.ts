import moment from 'moment'
import squel from 'squel'
import { checkNull } from '../utils/check'

/**
 * Register Date type
 */
squel.registerValueHandler(Date, (date: Date) => moment(date).format())

/**
 * Column definition block
 */
export class ColumnBlock extends squel.cls.Block {
  private _name: string
  private _type: string
  private _nullable?: boolean
  private _options: string[] = []

  public name(name: string): ColumnBlock {
    this._name = this._sanitizeField(name)
    return this
  }

  public type(type: string): ColumnBlock {
    this._type = type
    return this
  }

  public nullable(): ColumnBlock {
    this._nullable = true
    return this
  }

  public option(option: string): ColumnBlock {
    this._options.push(option)
    return this
  }

  // @override
  public _toParamString(): squel.ParamString {
    return {
      text: `${this._formatFieldName(this._name)} ${this._type} ${this._nullable ? 'DEFAULT NULL' : 'NOT NULL'}${this._options.length ? ` ${this._options.join(' ')}` : ''}`,
      values: [],
    }
  }
}

/**
 * Create node-jql squel flavour
 */
squel.flavours['node-jql'] = _squel => {
  /**
   * Database name block
   */
  class DatabaseBlock extends squel.cls.Block {
    private _database: string

    public database(name: string): DatabaseBlock {
      this._database = this._sanitizeName(name, 'database')
      return this
    }

    // @override
    public _toParamString(): squel.ParamString {
      if (checkNull(this._database)) throw new SyntaxError('Missing database')
      return {
        text: this._formatTableName(this._database),
        values: [],
      }
    }
  }

  /**
   * If-Not-Exists block
   */
  class IfNotExistsBlock extends squel.cls.Block {
    private _ifNotExists = false

    public ifNotExists(): IfNotExistsBlock {
      this._ifNotExists = true
      return this
    }

    // @override
    public _toParamString(): squel.ParamString {
      return {
        text: this._ifNotExists ? 'IF NOT EXISTS' : '',
        values: [],
      }
    }
  }

  /**
   * Options block
   */
  class OptionsBlock extends squel.cls.Block {
    private _options: string[] = []

    public option(option: string): OptionsBlock {
      this._options.push(option)
      return this
    }

    // @override
    public _toParamString(): squel.ParamString {
      return {
        text: this._options.join(' '),
        values: [],
      }
    }
  }

  /**
   * Columns block
   */
  class ColumnsBlock extends squel.cls.Block {
    private _columns: ColumnBlock[] = []
    private _constraints: Array<string|squel.Block> = []

    public column(block: ColumnBlock): ColumnsBlock

    public column(name: string, type: string, nullable?: boolean, ...options: string[]): ColumnsBlock

    public column(...args: any[]): ColumnsBlock {
      // parse args
      let block: ColumnBlock
      if (typeof args[0] === 'object') {
        block = args[0]
      }
      else {
        block = new ColumnBlock(this.options).name(args[0]).type(args[1])
        if (args[2]) block.nullable()
        for (const option of args.slice(3)) block.option(option)
      }

      this._columns.push(block)
      return this
    }

    public constraint(constraint: string|squel.Block): ColumnsBlock {
      this._constraints.push(constraint)
      return this
    }

    // @override
    public _toParamString(): squel.ParamString {
      if (!this._columns.length) throw new Error('Table must have at least 1 column')

      let text = '', values: any[] = []

      // columns
      text = this._columns.map(block => block._toParamString().text).join(', ')
      values = this._columns.reduce((values, block) => values.concat(block._toParamString().values), values)

      // constraints
      if (this._constraints.length) {
        for (const constraint of this._constraints) {
          if (typeof constraint === 'string') {
            text = `${text}, ${constraint}`
          }
          else {
            const { text: t, values: v } = constraint._toParamString()
            text = `${text}, ${t}`
            values = values.concat(values)
          }
        }
      }

      return { text: `(${text})`, values }
    }
  }

  /**
   * As-Query block
   */
  class AsQueryBlock extends squel.cls.Block {
    private _builder: squel.Select

    public as(builder: squel.Select): void {
      this._builder = builder
    }

    // @override
    public _toParamString(): squel.ParamString {
      if (this._builder) {
        const { text, values } = this._builder._toParamString()
        return {
          text: `AS (${text})`,
          values,
        }
      }
      return { text: '', values: [] }
    }
  }

  /**
   * If-Exists block
   */
  class IfExistsBlock extends squel.cls.Block {
    private _ifExists = false

    public ifExists(): void {
      this._ifExists = true
    }

    // @override
    public _toParamString(): squel.ParamString {
      return {
        text: this._ifExists ? 'IF EXISTS' : '',
        values: [],
      }
    }
  }

  /**
   * SQL block
   */
  class SQLBlock extends squel.cls.Block {
    private sqls: squel.BaseBuilder[] = []

    public statement(sql: squel.BaseBuilder) {
      this.sqls.push(sql)
    }

    // @override
    public _toParamString(): squel.ParamString {
      if (!this.sqls.length) throw new SyntaxError('No SQLs provided')
      const result = this.sqls.reduce((result, sql, i) => {
        const { text, values } = sql.toParam()
        result.text += text
        if (i < this.sqls.length - 1) result.text += '; '
        result.values.push(...values)
        return result
      }, { text: '', values: [] as any[] })
      result.text = '(' + result.text + ')'
      return result
    }
  }

  /**
   * squel.predict function
   */
  squel['predict'] = (options: Partial<squel.CompleteQueryBuilderOptions> = {}, blocks?: squel.Block[]) => new squel.cls.QueryBuilder(options, blocks || [
    new squel.cls.StringBlock(options, 'PREDICT'),
    new SQLBlock(options),
  ])

  /**
   * squel.createDatabase function
   */
  squel['createDatabase'] = (options: Partial<squel.CompleteQueryBuilderOptions> = {}, blocks?: squel.Block[]) => new squel.cls.QueryBuilder(options, blocks || [
    new squel.cls.StringBlock(options, 'CREATE DATABASE'),
    new IfNotExistsBlock(options),
    new DatabaseBlock(options),
    new OptionsBlock(options),
  ])

  /**
   * squel.createTable function
   */
  squel['createTable'] = (options: Partial<squel.CompleteQueryBuilderOptions> & { temporary?: boolean } = {}, blocks?: squel.Block[]) => new squel.cls.QueryBuilder(options, blocks || [
    new squel.cls.StringBlock(options, `CREATE${options.temporary ? ' TEMPORARY' : ''} TABLE`),
    new IfNotExistsBlock(options),
    new squel.cls.UpdateTableBlock(options),
    new ColumnsBlock(options),
    new OptionsBlock(options),
    new AsQueryBlock(options),
  ])

  /**
   * squel.dropDatabase function
   */
  squel['dropDatabase'] = (options: Partial<squel.CompleteQueryBuilderOptions> = {}, blocks?: squel.Block[]) => new squel.cls.QueryBuilder(options, blocks || [
    new squel.cls.StringBlock(options, 'DROP DATABASE'),
    new IfExistsBlock(options),
    new DatabaseBlock(options),
  ])

  /**
   * squel.dropTable function
   */
  squel['dropTable'] = (options: Partial<squel.CompleteQueryBuilderOptions> & { temporary?: boolean } = {}, blocks?: squel.Block[]) => new squel.cls.QueryBuilder(options, blocks || [
    new squel.cls.StringBlock(options, `DROP${options.temporary ? ' TEMPORARY' : ''} TABLE`),
    new IfExistsBlock(options),
    new squel.cls.UpdateTableBlock(options),
  ])
}