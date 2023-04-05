/* eslint-disable no-process-exit */
import { Command } from 'commander'
import { parseKeypair, parsePubkey } from '@marinade.finance/solana-cli-utils'
import { Keypair } from '@solana/web3.js'
import { setContext } from './context'
import { installCommands } from './commands'
import { pino, Logger } from 'pino'
import { DEFAULT_SIMPLE_ADMIN_PROGRAM_ID } from 'simple-admin-sdk'

const pinoAdditionalOptions = process.env.NODE_ENV?.startsWith('prod')
  ? {
      singleLine: true,
      errorLikeObjectKeys: [],
    }
  : {}
const logger: Logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      translateTime: 'UTC:yyyy-mm-dd HH:MM:ss.l o',
      ...pinoAdditionalOptions,
    },
  },
  level: 'info',
})

const program = new Command()

program
  .version('0.0.1')
  .allowExcessArguments(false)
  .option('-c, --cluster <cluster>', 'Solana cluster', 'http://localhost:8899')
  .option('--commitment <commitment>', 'Commitment', 'confirmed')
  .option(
    '-k, --keypair <keypair>',
    'Wallet keypair (default ~/.config/solana/id.json)',
    parseKeypair
  )
  .option(
    '--program-id <pubkey>',
    `Program id of simple admin contract (default: ${DEFAULT_SIMPLE_ADMIN_PROGRAM_ID})`,
    parsePubkey,
    parsePubkey(DEFAULT_SIMPLE_ADMIN_PROGRAM_ID)
  )
  .option('-s, --simulate', 'Simulate', false)
  .option(
    '-p, --print-only',
    'Print only mode, no execution, instructions are printed in base64 to output. ' +
      'This can be used for placing the admin commands to SPL Governance UI by hand.',
    false
  )
  .option(
    '--skip-preflight',
    'setting transaction execution flag "skip-preflight"',
    false
  )
  .option('-d, --debug', 'Debug', false)
  .hook('preAction', async (command: Command, action: Command) => {
    const wallet = command.opts().keypair
    const walletKeypair = wallet
      ? ((await wallet) as Keypair)
      : await parseKeypair('~/.config/solana/id.json')
    if (command.opts().debug) {
      logger.level = 'debug'
    }
    setContext({
      cluster: command.opts().cluster as string,
      walletKeypair,
      programId: await command.opts().programId,
      simulate: Boolean(command.opts().simulate),
      printOnly: Boolean(command.opts().printOnly),
      skipPreflight: Boolean(command.opts().skipPreflight),
      commitment: command.opts().commitment,
      logger,
      command: action.name(),
    })
  })

installCommands(program)

program.parseAsync(process.argv).then(
  () => process.exit(),
  (err: unknown) => {
    logger.error(err)
    process.exit(1)
  }
)
