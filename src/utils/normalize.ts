import moment = require('moment')
import { Type } from '../database/schema'

// normalize value
// e.g. Date: Date -> number
export function normalize(type: Type, value?: any): any {
  switch (type) {
    case 'RegExp':
      return value ? value.toString() : undefined
    case 'Date':
      return value ? moment(value).valueOf() : undefined
    default:
      return value
  }
}

// denormalize value
// e.g. Date: number -> Date
export function denormalize(type: Type, value?: any): any {
  switch (type) {
    case 'RegExp':
      return value ? new RegExp(value) : undefined
    case 'Date':
      return value ? moment(value).toDate() : undefined
    default:
      return value
  }
}
