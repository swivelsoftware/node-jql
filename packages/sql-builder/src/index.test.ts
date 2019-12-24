import { BinaryExpression, Column, ColumnExpression, Constraint, CreateSchema, CreateTable, FromTable, Query, ResultColumn } from '.'

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
    .constraint(new Constraint('PRIMARY KEY(`id`)'))
    .build()
    .toString()
  console.log(sql)
})

test('Query', () => {
  const sql = new Query.Builder()
    .select(new ResultColumn('col1'))
    .from(new FromTable('TEMP_TABLE'))
    .build()
    .toString()
  console.log(sql)
})
