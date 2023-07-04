import { Command } from 'commander'
import { installCreateSimpleAccount } from './create-simple-account'
import { installPrintMessage } from './print-message'

export function installManage(program: Command) {
  installCreateSimpleAccount(program)
  installPrintMessage(program)
}
