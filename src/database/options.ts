export interface IDatabaseOptions {
  skip?: {
    // if table exists before any operations
    checkTable?: boolean

    // if column exists before any operations
    checkColumn?: boolean

    // if type matches before any operations
    checkType?: boolean

    // if defined variable can be overrided
    checkOverridable?: boolean,
  }
}
