import { Command } from 'commander'
import { installCreateSimpleAccount } from './create-simple-account'
import { installPrintAdmin } from './print-admin'

export function installManage(program: Command) {
  installCreateSimpleAccount(program)
  installPrintAdmin(program)
}
