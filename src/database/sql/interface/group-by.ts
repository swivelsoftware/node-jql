import { Expression } from "./expression/index";
import { create } from "./expression/__create";

interface GroupByJson {
  expressions: Expression[] | Expression
  $having?: Expression[] | Expression
}

export class GroupBy implements GroupByJson {
  expressions: Expression
  $having?: Expression

  constructor (groupBy?: GroupByJson) {
    switch (typeof groupBy) {
      case 'object':
        this.expressions = Array.isArray(groupBy.expressions) ? create({ classname: '$and', expressions: groupBy.expressions }) : create(groupBy.expressions)
        if (groupBy.$having) this.$having = Array.isArray(groupBy.$having) ? create({ classname: '$and', expressions: groupBy.$having }) : create(groupBy.$having)
        break
      case 'undefined':
        break
      default:
        throw new Error(`invalid 'groupBy' object`)
    }
  }
}