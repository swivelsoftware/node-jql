export interface IDatabaseOptions {
  check?: {
    // if table exists before any operations
    table?: boolean

    // if column exists before any operations
    column?: boolean

    // if type matches before any operations
    type?: boolean

    // if defined variable can be overrided
    overridable?: boolean,
  }
}
