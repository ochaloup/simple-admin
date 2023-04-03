import { Command } from 'commander'
import { installCreateRoot } from './create-account'

export function installManage(program: Command) {
  installCreateRoot(program)
}
