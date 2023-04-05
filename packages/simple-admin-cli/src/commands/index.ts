import { Command } from 'commander'
import { installManage } from './manage'
import { installShow } from './show'

export function installCommands(program: Command) {
  installManage(program)
  installShow(program)
}
