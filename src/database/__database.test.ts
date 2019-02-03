import { Database } from '.'
import { Table } from './metadata/table'
import { Index } from './sandbox/resultset'
import { $binary, $column, $value, Query, TableOrSubquery } from './sql'

let database: Database

test('Initialize Database', () => {
  database = new Database()
})

test('Create Table1', () => {
  database.createTable(
    new Table('Table1')
      .addColumn('column1', 'string')
      .addColumn('column2', 'number'),
  )
  database.insert('Table1',
    { column1: 'Hello, World', column2: 8283 },
    { column1: 'Hello, Kennys', column2: 4078 },
  )
  expect(database.metadata.table('Table1').count).toBe(2)
})

test('Query from Table1', () => {
  const resultset = database.query<any>(new Query({
    $from: {
      name: 'Table1',
    },
    $where: new $binary({
      left: new $column({ name: 'column1' }),
      operator: '=',
      right: new $value({ value: 'Hello, World' }),
    }),
  }))

  // test: 1 rows
  expect(resultset.count()).toBe(1)

  resultset.next()

  // test: resultset[0].column1 = 'Hello, World'
  expect(resultset.get(resultset.columnIndexOf('column1') as number)).toBe('Hello, World')

  // test: resultset[0].column2 = 8283
  expect(resultset.get(resultset.columnIndexOf('column2') as number)).toBe(8283)
})

test('Create Table2', () => {
  database.createTable(
    new Table('Table2')
      .addColumn('column3', 'string')
      .addColumn('column2', 'Date'),
  )
  database.insert('Table2',
    { column3: 'Birthday', column2: '2019-04-21' },
    { column3: 'Holiday', column2: '2019-01-01' },
  )
  expect(database.metadata.table('Table2').count).toBe(2)
})

test('Query from Table1 & Table2', () => {
  const resultset = database.query<any>(new Query({
    $from: [
      new TableOrSubquery({ name: 'Table1' }),
      new TableOrSubquery({ name: 'Table2' }),
    ],
  }))

  // test: 6 rows
  expect(resultset.count()).toBe(4)

  resultset.next()

  // test: number of column2 = 2
  const indices = resultset.columnIndexOf('column2') as Index[]
  expect(indices.length).toBe(2)

  // test: resultset[0].column1 = 'Hello, World'
  expect(resultset.get(resultset.columnIndexOf('column1') as number)).toBe('Hello, World')

  // test: resultset[0].Table1.column2 = 8283
  expect(resultset.get(resultset.columnIndexOf('Table1.column2') as number)).toBe(8283)

  // test: resultset[0].column3 = 'Birthday'
  expect(resultset.get(resultset.columnIndexOf('column3') as number)).toBe('Birthday')

  // test: resultset[0].Table2.column2 = 'World'
  const { index } = indices.find(({ column }) => column.toString() === 'Table2.column2') as Index
  expect(resultset.get(index).constructor.name).toBe('Date')
})
