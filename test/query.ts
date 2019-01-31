import { $binary, $column, $function, $value, Query } from '../src'

test('SELECT `t1`.`column1` FROM Table1 `t1`', () => {
  const query = new Query({
    $select: {
      expression: new $column({
        table: 't1',
        name: 'column1',
      }),
    },
    $from: {
      name: 'Table1',
      $as: 't1',
    },
  })
  expect(query.toString()).toBe('SELECT `t1`.`column1` FROM Table1 `t1`')
})

test('SELECT `column2` FROM Table1 WHERE (`column1` = "Hello, World")', () => {
  const query = new Query({
    $select: {
      expression: new $column({
        name: 'column2',
      }),
    },
    $from: {
      name: 'Table1',
    },
    $where: new $binary({
      left: new $column({ name: 'column1' }),
      operator: '=',
      right: new $value({ value: 'Hello, World' }),
    }),
  })
  expect(query.toString()).toBe('SELECT `column2` FROM Table1 WHERE (`column1` = "Hello, World")')
})

test('SELECT SUM(1, 2)', () => {
  const query = new Query({
    $select: {
      expression: new $function({
        name: 'SUM',
        parameters: [1, 2],
      }),
    },
  })
  expect(query.toString()).toBe('SELECT SUM(1, 2)')
})
