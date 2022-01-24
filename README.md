# node-jql

[![npm version](https://badge.fury.io/js/node-jql.svg)](https://badge.fury.io/js/node-jql)

# Documentation

## Type

```js
type Type = 'string'|'number'|'boolean'|'object'|'Date'|'Array'|'any'
```

## IQuery

[IResultColumn](#IResultColumn)  
[IFromTable](#IFromTable)  
[IConditionalExpression](#IConditionalExpression)  
[IGroupBy](#IGroupBy)  
[IOrderBy](#IOrderBy)  
[ILimitOffset](#ILimitOffset)

``` js
// full query
new Query(IQuery)

// normal query - SELECT ... FROM ... WHERE
new Query(IResultColumn[], IFromTable|string, ...IConditionalExpression[])

// simple query - SELECT * FROM [database].[table]
new Query(string|null, string)

// simple query - SELECT * FROM [table]
new Query(string)

{
  // DISTINCT
  "$distinct": boolean|undefined,

  // SELECT ...
  "$select": IResultColumn[]|IResultColumn|string|undefined,

  // FROM ... JOIN ...
  "$from": IFromTable[]|IFromTable|string|undefined,

  // WHERE ...
  "$where": IConditionalExpression[]|IConditionalExpression|undefined,

  // GROUP BY ...
  "$group": IGroupBy|string|undefined,

  // ORDER BY ...
  "$order": IOrderBy[]|IOrderBy|string|undefined,

  // LIMIT ... OFFSET ...
  "$limit": ILimitOffset|number|undefined
}
```

## IResultColumn

[IExpression](#IExpression)

``` js
new ResultColumn(IResultColumn)
new ResultColumn(IExpression|string, string?)

// [expression] AS [$as]
{
  "expression": IExpression,
  "$as": string|undefined
}
```

## IFromTable

[IQuery](#IQuery)  
[IJoinClause](#IJoinClause)

```js
new FromTable(IFromTable)
new FromTable(string|IQuery|[string, string], ...IJoinClause[])
new FromTable(string|IQuery|[string, string], string, ...IJoinClause[])

// [database].[table] AS [$as]
{
  "database": string|undefined,
  "table": string|IQuery|IRemoteTable,
  "$as": string|undefined,
  "joinClauses": IJoinClause[]|IJoinClause|undefined
}
```

## IJoinClause

[IFromTable](#IFromTable)  
[IConditionalExpression](#IConditionalExpression)

```js
new JoinClause(IJoinClause)
new JoinClause('INNER'|'CROSS'|'LEFT'|'RIGHT'|'FULL', IFromTable|string, ...IConditionalExpression[])

// [operator] JOIN [tableOrSubquery] AS [$on]
{
  "operator": 'INNER'|'CROSS'|'LEFT'|'RIGHT'|'FULL'|undefined,
  "tableOrSubquery": IFromTable|string
  "$on": IConditionalExpression[]|IConditionalExpression|undefined
}
```

## IGroupBy

[IExpression](#IExpression)  
[IConditionalExpression](#IConditionalExpression)

```js
new GroupBy(IGroupBy)
new GroupBy(IExpression|string)
new GroupBy(Array<IExpression|string>, ...IConditionalExpression[])

// GROUP BY [expressions] HAVING [$having]
{
  "expressions": IExpression[]|IExpression,
  "$having": IConditionalExpression[]|IConditionalExpression|undefined
}
```

## IOrderBy

[IExpression](#IExpression)

```js
new OrderBy(IOrderBy)
new OrderBy(IExpression|string, 'ASC'|'DESC'?)

// ORDER BY [expression] [order], [expression] [order], ...
{
  "expression": IExpression,
  "order": 'ASC'|'DESC'|undefined
}
```

## ILimitOffset

[IExpression](#IExpression)

```js
new LimitOffset(ILimitOffset)
new LimitOffset(IValue|number, IValue|number?)

// LIMIT [$limit] OFFSET [$offset]
{
  "$limit": IValue|number,
  "$offset": IValue|number|undefined,
}
```

## IExpression
---

** `classname` is a required field in `IExpression` that specifies the class of the Expression

### ICaseExpression

[IExpression](#IExpression)

```js
new CaseExpression(ICaseExpression)
new CaseExpression(ICase[], IExpression?)

// CASE [cases] ELSE [$else]
{
  "cases": ICase[]|ICase,
  "$else": IExpression|undefined
}

// ICase
// WHEN [$when] THEN [$then]
{
  "$when": IConditionalExpression,
  "$then": any
}
```

### IColumnExpression

```js
// column with table specified
new ColumnExpression(IColumnExpression)
new ColumnExpression(string|null, string)

// column only
new ColumnExpression(string)

// [table].[name]
{
  "table": string|undefined,
  "name": string
}
```

### IColumnsExpression

[IColumnExpression](#IColumnExpression)

```js
// column with table specified
new ColumnsExpression(IColumnsExpression)
new ColumnsExpression(IColumnExpression[])

// ([table].[name], ...)
{
  "columns": IColumnExpression[]
}
```

### IFunctionExpression

supports most of the SQL built-in functions and works similarly  
[IParameterExpression](#IParameterExpression)

```js
new FunctionExpression(IFunctionExpression)
new FunctionExpression(name, ...any[])

// [name]([parameters])
{
  "name": string,
  "parameters": any[]|any|undefined
}
```

### IMathExpression

[IExpression](#IExpression)

```js
new MathExpression(IMathExpression)
new MathExpression(IExpression|any, '+'|'-'|'*'|'/'|'%'|'MOD'|'DIV', IExpression|any?)

// [left] [operator] [right]
{
  "left": IExpression|any,
  "operator": '+'|'-'|'*'|'/'|'%'|'MOD'|'DIV',
  "right": IExpression|any|undefined
}
```

### IParameterExpression

```js
new ParameterExpression(IParameterExpression)
new ParameterExpression(string|null, IExpression|any, string?)

// [prefix] [expression] [suffix]
// e.g. prefix is used for cases like `COUNT(DISTINCT id)`
{
  "prefix": string|undefined,
  "expression": IExpression|any,
  "suffix": string|undefined
}
```

### IUnknown

[Type](#Type)

```js
new Unknown(IUnknown?)
new Unknown(...Type[])

// ?
{
  "type": Type[]|Type|undefined
}
```

### IValue

[Type](#Type)

```js
new Value(IValue)
new Value(any)

// [value]
{
  "type": Type[]|Type|undefined,
  "value": any
}
```

### IRaw

```js
new Raw(IRaw|string) // aka new Keyword(IRaw|string)

// [sql]
{
  "sql": string
}
```

## IConditionalExpression
---

extends [IExpression](#IExpression)

### IBetweenExpression

[IExpression](#IExpression)

```js
new BetweenExpression(IBetweenExpression)
new BetweenExpression(IExpression|any, boolean, IExpression|any?, IExpression|any?)

// [left] [$not] BETWEEN [start] AND [end]
{
  "left": IExpression|any,
  "$not": boolean|undefined,
  "start": IExpression|any|undefined,
  "end": IExpression|any|undefined
}
```

### IBinaryExpression

[IExpression](#IExpression)

```js
new BinaryExpression(IBinaryExpression)
new BinaryExpression(IExpression|any, operator, IExpression|any?)

// [left] [operator] [right]
{
  "left": IExpression|any,
  "operator": '='|'<>'|'<'|'<='|'>'|'>=',
  "right": IExpression|any|undefined
}
```

### IExistsExpression

[IQuery](#IQuery)

```js
new ExistsExpression(IExistsExpression)
new ExistsExpression(IQuery, boolean?)

// [$not] EXISTS [query]
{
  "$not": boolean|undefined,
  "query": IQuery
}
```

### IGroupedExpressions

[IExpression](#IExpression)

```js
new AndExpressions(IGroupedExpressions)
new AndExpressions(IExpression[])

new OrExpressions(IGroupedExpressions)
new OrExpressions(IExpression[])

// ([expression] AND/OR [expression] ...)
{
  "expressions": IExpression[]
}
```

### Phrase

[IGroupedExpressions](#IGroupedExpressions)

```js
new Phrase(IGroupedExpressions)
new Phrase(IExpression[])

// [expression] [expression] ...
```

### IInExpression

[IExpression](#IExpression)  
[IUnknown](#IUnknown)  
[IQuery](#IQuery)  
[IValue](#IValue)

```js
new InExpression(IInExpression)
new InExpression(IExpression|any, boolean, IUnknown|IQuery|IValue|any[]?)

// [left] [$not] IN [right]
{
  "left": IExpression|any,
  "$not": boolean|undefined,
  "operator": 'IN',
  "right": IUnknown|IQuery|IValue|any[]|undefined
}
```

### IIsNullExpression

[IExpression](#IExpression)

```js
new IsNullExpression(IIsNullExpression)
new IsNullExpression(IExpression|any, boolean)

// [left] IS [$not] NULL
{
  "left": IExpression|any,
  "$not": boolean|undefined
}
```

### ILikeExpression

[IExpression](#IExpression)

```js
new LikeExpression(ILikeExpression)
new LikeExpression(IExpression|any, boolean, IUnknown|string?)

// [left] [$not] LIKE [right]
{
  "left": IExpression|any,
  "$not": boolean|undefined,
  "right": IUnknown|string|undefined
}
```

### IRegexpExpression

[IExpression](#IExpression)

```js
new RegexpExpression(IRegexpExpression)
new RegexpExpression(IExpression|any, boolean, IUnknown|Regexp|string?)

// [left] [$not] REGEXP [right]
{
  "left": IExpression|any,
  "$not": boolean|undefined,
  "right": IUnknown|Regexp|string|undefined
}
```
