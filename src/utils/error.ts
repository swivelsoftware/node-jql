export class JQLError extends Error {
  constructor(message?: string, error?: Error) {
    super(message)
    if (error) {
      if (this.stack) {
        this.stack = `${this.stack}\n\n thrown by ${error.stack}`
      }
      else {
        this.stack = error.stack
      }
    }
  }
}
