// JQL general error that supports error hierarchy
export class JQLError extends Error {
  constructor(message: string, error?: Error) {
    super(message)
    if (error) this.stack = `${this.stack}\n--------------------\nThrown by ${error.stack}`
  }
}
