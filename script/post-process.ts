export default function process(content: string[]): string[] {
  const oldIndex = content.findIndex(line => line.startsWith('export abstract class Expression')) - 5
  const newIndex = content.findIndex(line => line.startsWith('export class ColumnExpression extends Expression')) - 5
  const subContent = content.splice(oldIndex, 23)
  for (let i = 0, length = subContent.length; i < length; i += 1) {
    content.splice(newIndex + i, 0, subContent[i])
  }
  return content
}
