import {
  PublicKey,
  SignerWallet,
  SolanaProvider,
} from '@saberhq/solana-contrib'
import {
  Commitment,
  Connection,
  Keypair,
  clusterApiUrl,
  Cluster,
} from '@solana/web3.js'
import { Logger } from 'pino'
import { CliCommandError } from './commands/error'
import { SimpleAdminSdk } from 'simple-admin-sdk'

export interface Context {
  sdk: SimpleAdminSdk
  provider: SolanaProvider
  logger: Logger
  simulate: boolean
  command: string
  printOnly: boolean
}

const context: {
  sdk: SimpleAdminSdk | null
  provider: SolanaProvider | null
  logger: Logger | null
  simulate: boolean
  command: string
  printOnly: boolean
} = {
  sdk: null,
  provider: null,
  logger: null,
  simulate: false,
  command: '',
  printOnly: false,
}

export const setContext = ({
  cluster,
  walletKeypair,
  programId,
  simulate,
  printOnly,
  commitment = 'confirmed',
  skipPreflight,
  logger,
  command,
}: {
  cluster: string
  walletKeypair: Keypair
  programId: PublicKey
  simulate: boolean
  printOnly: boolean
  skipPreflight: boolean
  commitment?: Commitment
  logger: Logger
  command: string
}) => {
  try {
    const clusterUrl =
      cluster === 'd'
        ? 'devnet'
        : cluster === 't'
        ? 'testnet'
        : cluster === 'm' || cluster === 'mainnet'
        ? 'mainnet-beta'
        : cluster === 'l' || cluster === 'localnet' || cluster === 'localhost'
        ? 'http://localhost:8899'
        : cluster
    cluster = clusterApiUrl(clusterUrl as Cluster)
  } catch (e) {
    // ignore
  }

  try {
    const connection = new Connection(cluster, commitment)
    context.sdk = new SimpleAdminSdk({
      connection,
      wallet: walletKeypair,
      programId,
    })
    context.provider = SolanaProvider.init({
      connection: connection,
      wallet: new SignerWallet(walletKeypair),
      opts: { skipPreflight },
    })
  } catch (e) {
    logger.debug(e)
    throw new CliCommandError({
      commandName: 'context',
      errMessage: `Failed to connect Solana cluster at ${cluster}`,
    })
  }
  context.simulate = simulate
  context.logger = logger
  context.command = command
  context.printOnly = printOnly
}

export const useContext = (): Context => {
  return context as Context
}
