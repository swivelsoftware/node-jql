# node-jql

[![npm version](https://badge.fury.io/js/node-jql.svg)](https://badge.fury.io/js/node-jql)

This library defines only the JSON structure of SQL statements for the in-memory SQL database [node-jql-core](https://github.com/kennysng/node-jql-core). 

If you are looking for the database core, please visit [node-jql-core](https://github.com/kennysng/node-jql-core). 

If you are looking for the server-side application, please visit [node-jql-server](https://github.com/kennysng/node-jql-server). 

If you are looking for the client-side API, please visit [node-jql-client](https://github.com/kennysng/node-jql-client). 

# Documentation

## Type

```js
type Type = 'any'|'string'|'number'|'boolean'|'object'|'Date'|'Array'
```

## IQuery

[IResultColumn](#IResultColumn)  
[ITableOrSubquery](#ITableOrSubquery)  
[IConditionalExpression](#IConditionalExpression)  
[IGroupBy](#IGroupBy)  
[IOrderingTerm](#IOrderingTerm)

``` js
new Query(IQuery)

{
  // SELECT ...
  "$select": Array<IResultColumn>|IResultColumn|'*'|string|undefined,

  // DISTINCT
  "$distinct": boolean|undefined,

  // FROM ... JOIN ...
  "$from": Array<ITableOrSubquery>|ITableOrSubquery|string|undefined,

  // WHERE ...
  "$where": Array<IConditionalExpression>|IConditionalExpression|undefined,

  // GROUP BY ...
  "$group": IGroupBy|string|undefined,

  // ORDER BY ...
  "$order": Array<IOrderingTerm>|IOrderingTerm|string|undefined,

  // LIMIT ... OFFSET ...
  "$limit": {
    "value": number,
    "$offset": number|undefined
  }|number|undefined
}
```

## IResultColumn

[IExpression](#IExpression)

``` js
new ResultColumn(IResultColumn)

// [expression] AS [$as]
{
  "expression": IExpression,
  "$as": string|undefined
}
```

## ITableOrSubquery/IJoinedTableOrSubquery

[IQuery](#IQuery)  
[IRemoteTable](#IRemoteTable)  
[IJoinClause](#IJoinClause)

```js
new TableOrSubquery([string, string]|ITableOrSubquery)
new JoinedOrSubquery(IJoinedTableOrSubquery)

// [database].[table] AS [$as]
{
  "database": string|undefined,
  "table": string|IQuery|IRemoteTable,
  "$as": string|undefined,
  "joinClauses": Array<IJoinClause>|IJoinClause|undefined
}
```

## IRemoteTable

extends [AxiosRequestConfig](https://github.com/axios/axios#request-config)  
[Type](#Type)

```js
{
  "columns": Array<{ name: string, type?: Type }>
}
```

## IJoinClause

[ITableOrSubquery](#ITableOrSubquery)  
[IConditionalExpression](#IConditionalExpression)

```js
new JoinClause(IJoinClause)

// [operator] JOIN [tableOrSubquery] AS [$on]
{
  "operator": 'INNER'|'CROSS'|'LEFT'|'RIGHT'|'FULL'|undefined,
  "tableOrSubquery": ITableOrSubquery|string
  "$on": Array<IConditionalExpression>|IConditionalExpression|undefined
}
```

## IGroupBy

[IExpression](#IExpression)  
[IConditionalExpression](#IConditionalExpression)

```js
new GroupBy(IGroupBy)

// GROUP BY [expressions] HAVING [$having]
{
  "expressions": Array<IExpression>|IExpression,
  "$having": Array<IConditionalExpression>|IConditionalExpression|undefined
}
```

## IOrderingTerm

[IExpression](#IExpression)

```js
new OrderingTerm(IOrderingTerm)

// ORDER BY [expression] [order], [expression] [order], ...
{
  "expression": IExpression,
  "order": 'ASC'|'DESC'|undefined
}
```

## IExpression
---

** `classname` is a required field in `IExpression` that specifies the class of the Expression

### ICaseExpression

[IExpression](#IExpression)

```js
new CaseExpression(ICaseExpression)

// CASE WHEN [$when] THEN [$then] WHEN [$when] THEN [$then] ... ELSE [$else]
{
  "cases": Array<{ "$when": IConditionalExpression, "$then": IExpression }>|{ "$when": IConditionalExpression, "$then": IExpression },
  "$else": IExpression|undefined
}
```

### IColumnExpression

```js
new ColumnExpression(string|[string, string]|IColumnExpression)

// [table].[name]
{
  "table": string|undefined,
  "name": '*'|string
}
```

### IFunctionExpression

supports most of the SQL built-in functions and works similarly  
[IParameterExpression](#IParameterExpression)

```js
new FunctionExpression(IFunctionExpression)

// [name]([parameters])
{
  "name": string,
  "parameters": Array<IParameterExpression|any>|IParameterExpression|any|undefined
}
```

### IMathExpression

[IExpression](#IExpression)

```js
new MathExpression(IMathExpression)

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
new Unknown(IUnknown|undefined)

// ?
{
  "type": Array<Type>|Type|undefined
}
```

### IValue

[Type](#Type)

```js
new Value(IValue|any)

// [value]
{
  "value": any,
  "type": Type|undefined
}
```

## IConditionalExpression
---

extends [IExpression](#IExpression)

### IBetweenExpression

[IExpression](#IExpression)

```js
new BetweenExpression(IBetweenExpression)

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

// [$not] EXISTS [query]
{
  "$not": boolean|undefined,
  "query": IQuery
}
```

### IGroupedExpressions

[IConditionalExpression](#IConditionalExpression)

```js
new AndExpressions(IGroupedExpressions)
new OrExpressions(IGroupedExpressions)

// ([expression] AND/OR [expression] ...)
{
  "expressions": Array<IConditionalExpression>
}
```

### IInExpression

[IExpression](#IExpression)  
[IUnknown](#IUnknown)  
[IQuery](#IQuery)  
[IValue](#IValue)

```js
new InExpression(IInExpression)

// [left] [$not] IN [right]
{
  "left": IExpression|any,
  "$not": boolean|undefined,
  "right": IUnknown|IQuery|IValue|any[]|undefined
}
```

### IIsNullExpression

[IExpression](#IExpression)

```js
new IsNullExpression(IIsNullExpression)

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

// [left] [$not] [operator] [right]
{
  "left": IExpression|any,
  "$not": boolean|undefined,
  "operator": 'LIKE'|'REGEXP'|undefined,
  "right": string|undefined
}
```