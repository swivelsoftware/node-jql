import { Type } from "../database/metadata/column";
import moment = require("moment");

export function normalize(type: Type, value?: any): any {
  switch (type) {
    case 'Date':
      return moment(value).valueOf()
    default:
      return value
  }
}

export function denormalize(type: Type, value?: any): any {
  switch (type) {
    case 'Date':
      return moment(value).toDate()
    default:
      return value
  }
}