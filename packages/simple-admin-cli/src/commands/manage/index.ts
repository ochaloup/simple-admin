import { Command } from 'commander'
import { installCreateSimpleAccount } from './create-simple-account'

export function installManage(program: Command) {
  installCreateSimpleAccount(program)
}
