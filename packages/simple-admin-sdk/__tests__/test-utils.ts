import * as anchor from '@coral-xyz/anchor'
import { Provider } from '@coral-xyz/anchor'
import {
  Keypair,
  LAMPORTS_PER_SOL,
  SendTransactionError,
  SystemProgram,
} from '@solana/web3.js'
import {
  SolanaProvider,
  TransactionEnvelope,
  TransactionReceipt,
  Provider as SolanaContribProvider,
} from '@saberhq/solana-contrib'
import { SimpleAdminSdk } from '../src'
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet'

export async function createUserAndFund(
  provider: SolanaContribProvider,
  user: Keypair = Keypair.generate(),
  sol_amount = 5
): Promise<Keypair> {
  // Fund user with some SOL
  const tx = new TransactionEnvelope(provider, [], [])
  await tx
    .append(
      SystemProgram.transfer({
        fromPubkey: provider.wallet.publicKey,
        toPubkey: user.publicKey,
        lamports: sol_amount * LAMPORTS_PER_SOL,
      })
    )
    .confirm()

  return user
}

export function initTest(): {
  provider: Provider
  sdk: SimpleAdminSdk
  solanaProvider: SolanaProvider
} {
  anchor.setProvider(anchor.AnchorProvider.env())
  const provider = anchor.getProvider() as anchor.AnchorProvider
  provider.opts.skipPreflight = true
  const sdk = new SimpleAdminSdk({
    connection: provider.connection,
    wallet: provider.wallet as NodeWallet,
    programId: anchor.workspace.SimpleAdmin.programId,
  })
  const solanaProvider = SolanaProvider.init({
    connection: provider.connection,
    wallet: provider.wallet,
    opts: provider.opts,
  })
  return { provider, sdk, solanaProvider }
}

export async function executeTx(
  tx: TransactionEnvelope,
  printLogs = false
): Promise<Array<TransactionReceipt>> {
  const receipts: Array<TransactionReceipt> = []
  try {
    for (const part of tx.partition()) {
      const result = await part.confirm({ printLogs: true })
      receipts.push(result)
      if (printLogs) {
        console.debug(`tx: ${result.signature}`)
        console.debug(result.response.meta?.logMessages)
      }
    }
  } catch (e) {
    if (printLogs) {
      console.debug(tx.debugStr)
      if (e instanceof SendTransactionError) {
        console.debug(e.logs)
      }
    }
    throw e
  }
  return receipts
}
