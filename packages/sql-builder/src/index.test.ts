import { BinaryExpression, Column, CreateSchema, CreateTable, FromFunctionTable, FromTable, FunctionExpression, PrimaryKeyConstraint, Query, ResultColumn, Value } from '.'
import { ColumnDefExpression } from './expression/column-def'

test('CreateSchema', () => {
  const sql = new CreateSchema.Builder('TEMP_DB')
    .ifNotExists()
    .build()
    .toString()
  console.log(sql)
})

test('CreateTable', () => {
  const sql = new CreateTable.Builder('TEMP_TABLE')
    .ifNotExists()
    .column(
      new Column.Builder('id', 'BIGINT')
        .options('AUTO_INCREMENT')
        .toJson(),
    )
    .column(
      new Column.Builder('col1', 'VARCHAR(128)')
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
          .arg(new Value('[{"id":1,"col1":"Hi"},{"id":2,"col1":"Hello, World"},{"id":3,"col1":"Halo"}]'))
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
                new Column.Builder('col1', 'INT')
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
