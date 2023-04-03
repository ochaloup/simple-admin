import { Command } from 'commander'
import { installManage } from './manage'

export function installCommands(program: Command) {
  installManage(program)
}
