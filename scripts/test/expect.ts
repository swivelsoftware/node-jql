export class Expect {
  constructor(private readonly value: any) {
  }

  public toBe(target: any) {
    if (typeof this.value !== typeof target) throw new Error(`expected ${typeof target} but received ${typeof this.value}`)
    if (this.value !== target) throw new Error(`expected ${JSON.stringify(target)} but received ${JSON.stringify(this.value)}`)
  }
}
