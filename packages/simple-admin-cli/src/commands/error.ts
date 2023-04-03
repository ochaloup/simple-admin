import { format } from 'util'

export class CliCommandError extends Error {
  readonly cause?: Error
  readonly logs?: string[]
  readonly txDebugStr?: string

  constructor({
    commandName,
    valueName,
    value,
    errMessage,
    cause,
    logs,
    txDebugStr,
  }: {
    commandName: string
    valueName?: string
    value?: any // eslint-disable-line @typescript-eslint/no-explicit-any
    errMessage: string
    cause?: Error
    logs?: string[]
    txDebugStr?: string
  }) {
    let errorMessage
    if (valueName) {
      errorMessage = format(
        '%s[%s=%s]: %s',
        commandName,
        valueName,
        value,
        errMessage
      )
    } else {
      errorMessage = format('%s:%s', commandName, errMessage)
    }
    super(errorMessage)
    this.cause = cause
    this.logs = logs
    this.txDebugStr = txDebugStr

    // restore prototype chain
    const actualProto = new.target.prototype
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto)
    } else {
      // eslint-disable-next-line
      (this as any).proto = actualProto
    }
  }

  messageWithCause(): string {
    const causeMessage = this.cause ? '; caused: ' + this.cause.message : ''
    return this.message + causeMessage
  }

  get [Symbol.toStringTag]() {
    return 'CliCommandError'
  }
  static get [Symbol.species]() {
    return CliCommandError
  }
}
