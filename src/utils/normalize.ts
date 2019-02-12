import moment = require('moment')
import { Type } from '../database/metadata/column'

export function normalize(type: Type, value?: any): any {
  switch (type) {
    case 'Date':
      return value ? moment(value).valueOf() : 0
    default:
      return value
  }
}

export function denormalize(type: Type, value?: any): any {
  switch (type) {
    case 'Date':
      return value ? moment(value).toDate() : undefined
    default:
      return value
  }
}
