import { BetweenExpression, BinaryExpression, Column, ColumnDefExpression, CreateSchema, CreateTable, Delete, DropSchema, DropTable, FromFunctionTable, FromTable } from '.'
import { FunctionExpression, GroupExpression, Insert, InsertSelect, PrimaryKeyConstraint, Query, ResultColumn, Value } from '.'

test('Create Schema', () => {
  const sql = new CreateSchema.Builder('TEMP_DB')
    .ifNotExists()
    .build()
    .toString()
  console.log(sql)
})

test('Create Table', () => {
  const sql = new CreateTable.Builder('TEMP_TABLE')
    .ifNotExists()
    .column(
      new Column.Builder('id', 'BIGINT')
        .options('AUTO_INCREMENT')
        .toJson(),
    )
    .column(
      new Column.Builder('col1', 'VARCHAR', 128)
        .toJson(),
    )
    .column(
      new Column.Builder('col1', 'INT')
        .toJson(),
    )
    .constraint(new PrimaryKeyConstraint('id'))
    .build()
    .toString()
  console.log(sql)
})

test('Insert', () => {
  const sql = new Insert.Builder('TEMP_TABLE')
    .columns('col1', 'col2')
    .value({ col1: 'Hello', col2: 5 })
    .value({ col1: 'Halo', col2: 4 })
    .value({ col1: 'Hi', col2: 2 })
    .build()
    .toString()
  console.log(sql)
})

test('Insert from Select', () => {
  const sql = new InsertSelect.Builder('TEMP_TABLE')
    .columns('col1', 'col2')
    .query(
      new Query.Builder()
        .select(new ResultColumn('col1'))
        .select(new ResultColumn('col2'))
        .from(new FromTable('TEMP_TABLE'))
        .where(
          new BetweenExpression.Builder()
            .left('col2')
            .start(new Value(10))
            .end(new Value(20))
            .build(),
        )
        .build(),
    )
    .build()
    .toString()
  console.log(sql)
})

test('Query', () => {
  const sql = new Query.Builder()
    .select(new ResultColumn('col1'))
    .from(new FromTable('TEMP_TABLE', 't'))
    .where(
      new BinaryExpression.Builder('LIKE')
        .left('col1')
        .not()
        .right(new Value('Hello, World'))
        .build(),
    )
    .orderBy('id', 'DESC')
    .build()
    .toString()
  console.log(sql)
})

test('Query from JSON_TABLE', () => {
  const sql = new Query.Builder()
    .from(
      new FromFunctionTable(
        new FunctionExpression.Builder('JSON_TABLE')
          .arg(new Value(JSON.stringify([
            {id: 1, col1: 'Hi'},
            {id: 2, col1: 'Hello, World'},
            {id: 3, col1: 'Halo'},
          ])))
          .arg(new Value('$[*]'))
          .arg(
            new FunctionExpression.Builder('COLUMNS')
              .arg(new ColumnDefExpression(
                new Column.Builder('id', 'BIGINT')
                  .options('AUTO_INCREMENT')
                  .toJson(),
                ),
              )
              .arg(new ColumnDefExpression(
                new Column.Builder('col1', 'VARCHAR(128)')
                  .toJson(),
                ),
              )
              .arg(new ColumnDefExpression(
                new Column.Builder('col2', 'INT')
                  .toJson(),
                ),
              )
              .build(),
          )
          .build(),
        't',
      ),
    )
    .build()
    .toString()
  console.log(sql)
})

test('Delete', () => {
  const sql = new Delete.Builder('TEMP_TABLE')
    .where(
      new GroupExpression.Builder('AND')
        .expr(
          new BinaryExpression.Builder('=')
            .left('col1')
            .right('Hello')
            .build(),
        )
        .expr(
          new BinaryExpression.Builder('=')
            .left('col2')
            .right(new Value(5))
            .build(),
        )
        .build(),
    )
    .build()
    .toString()
  console.log(sql)
})

test('Drop Table', () => {
  const sql = new DropTable.Builder('TEMP_TABLE')
    .ifExists()
    .build()
    .toString()
  console.log(sql)
})

test('Drop Schema', () => {
  const sql = new DropSchema.Builder('TEMP_DB')
    .ifExists()
    .build()
    .toString()
  console.log(sql)
})
