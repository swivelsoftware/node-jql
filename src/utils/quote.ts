import squel from '@swivel-admin/squel'

export function quoteDatabase(type: squel.Flavour, value: string): string {
  switch (type) {
    case 'mssql':
      if (value.indexOf('.') === -1) value += '.dbo'
      const pcs = value.split('.')
      return `${quoteTable(type, pcs[0])}.${quoteTable(type, pcs[1])}`
    default:
      return quoteTable(type, value)
  }
}

export function quoteTable(type: squel.Flavour, value: string) {
  switch (type) {
    case 'mysql':
      return `\`${value}\``
    case 'mssql':
      return `[${value}]`
    case 'postgres':
      return `"${value}"`
  }
}
