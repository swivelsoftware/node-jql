import squel from 'squel'

export function quote(type: squel.Flavour, value: string) {
  switch (type) {
    case 'mysql':
      return `\`${value}\``
    case 'mssql':
      return `[${value}]`
    case 'postgres':
      return `"${value}"`
  }
}
