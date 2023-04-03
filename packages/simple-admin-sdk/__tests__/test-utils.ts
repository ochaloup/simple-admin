import * as anchor from '@coral-xyz/anchor'
import { Provider } from '@coral-xyz/anchor'
import { readFile } from 'fs/promises'
import {
  Keypair,
  LAMPORTS_PER_SOL,
  SendTransactionError,
  SystemProgram,
  VoteAccount,
  VoteProgram,
} from '@solana/web3.js'
import expandTilde from 'expand-tilde'
import {
  SolanaProvider,
  TransactionEnvelope,
  TransactionReceipt,
  Provider as SolanaContribProvider,
} from '@saberhq/solana-contrib'
import { SimpleAdminSdk } from '../src'
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet'

export async function loadKeypair(path: string): Promise<Keypair> {
  return Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(await readFile(expandTilde(path), 'utf-8')))
  )
}

export async function createUserAndFund(
  provider: SolanaContribProvider,
  user: Keypair = Keypair.generate()
): Promise<Keypair> {
  // Fund user with some SOL
  const tx = new TransactionEnvelope(provider, [], [])
  await tx
    .append(
      SystemProgram.transfer({
        fromPubkey: provider.wallet.publicKey,
        toPubkey: user.publicKey,
        lamports: 5 * LAMPORTS_PER_SOL,
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

/**
 * Create a random vote account that's not bound to any particular validator
 * but it can be used for direced stake vote record as it is a valid vote account on chain.
 */
export async function createTestVoteAccount(
  provider: SolanaContribProvider
): Promise<{ voteAccount: Keypair; nodeIdentity: Keypair }> {
  const tx = new TransactionEnvelope(provider, [], [])
  const { voteAccount, nodeIdentity } = await testVoteAccountIx(
    tx.instructions,
    provider
  )
  tx.addSigners(voteAccount, nodeIdentity)
  await executeTx(tx)
  provider.connection.getAccountInfo(voteAccount.publicKey).then(ai => {
    expect(ai).not.toBeNull()
    expect(VoteAccount.fromAccountData(ai!.data).nodePubkey.toBase58()).toEqual(
      nodeIdentity.publicKey.toBase58()
    )
  })
  return { voteAccount, nodeIdentity }
}

export async function testVoteAccountIx(
  instructions: anchor.web3.TransactionInstruction[],
  provider: SolanaContribProvider
): Promise<{
  voteAccount: Keypair
  nodeIdentity: Keypair
}> {
  const voteAccount = Keypair.generate()
  const nodeIdentity = Keypair.generate()
  const txCreateAccount = VoteProgram.createAccount({
    fromPubkey: provider.wallet.publicKey,
    lamports: LAMPORTS_PER_SOL * 10,
    votePubkey: voteAccount.publicKey,
    voteInit: {
      authorizedVoter: provider.wallet.publicKey,
      authorizedWithdrawer: provider.wallet.publicKey,
      commission: 0,
      nodePubkey: nodeIdentity.publicKey,
    },
  })
  instructions.push(...txCreateAccount.instructions)
  return { voteAccount, nodeIdentity }
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
