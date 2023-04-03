import { AnchorProvider } from '@coral-xyz/anchor'
import { SolanaProvider, TransactionEnvelope } from '@saberhq/solana-contrib'
import {
  createTempFileKeypair,
  shellMatchers,
} from '@marinade.finance/solana-test-utils'
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
} from '@solana/web3.js'
import {
  DEFAULT_SIMPLE_ADMIN_PROGRAM_ID,
  SimpleAdminSdk,
  root,
} from '@marinade.finance/simple-admin-sdk'
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet'

beforeAll(() => {
  shellMatchers()
})

describe('Create root of simple admin using CLI', () => {
  const anchorProvider = AnchorProvider.env()
  anchorProvider.opts.skipPreflight = true
  const sdk = new SimpleAdminSdk({
    connection: anchorProvider.connection,
    wallet: anchorProvider.wallet as NodeWallet,
    programId: new PublicKey(DEFAULT_SIMPLE_ADMIN_PROGRAM_ID),
  })
  const provider = SolanaProvider.init({
    connection: anchorProvider.connection,
    wallet: anchorProvider.wallet,
    opts: anchorProvider.opts,
  })

  let rootPath: string
  let rootKeypair: Keypair
  let rootCleanup: () => Promise<void>

  beforeEach(async () => {
    // eslint-disable-next-line @typescript-eslint/no-extra-semi
    ;({
      path: rootPath,
      keypair: rootKeypair,
      cleanup: rootCleanup,
    } = await createTempFileKeypair())
  })

  afterEach(async () => {
    await rootCleanup()
  })

  it('creates root account with rent payer', async () => {
    const {
      keypair: rentPayerKeypair,
      path: rentPayerPath,
      cleanup: cleanupRentPayer,
    } = await createTempFileKeypair()
    const rentPayerFunds = 111 * LAMPORTS_PER_SOL
    const tx = new TransactionEnvelope(provider, [
      SystemProgram.transfer({
        fromPubkey: provider.wallet.publicKey,
        toPubkey: rentPayerKeypair.publicKey,
        lamports: rentPayerFunds,
      }),
    ])
    await tx.confirm()
    await expect(
      provider.connection.getBalance(rentPayerKeypair.publicKey)
    ).resolves.toStrictEqual(rentPayerFunds)
    const oldWalletBalance = await provider.connection.getBalance(
      provider.wallet.publicKey
    )

    try {
      await (
        expect([
          'pnpm',
          [
            'cli',
            '-c',
            provider.connection.rpcEndpoint,
            '--program-id',
            sdk.program.programId.toBase58(),
            'create-root',
            '--address',
            rootPath,
            '--rent-payer',
            rentPayerPath,
          ],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ]) as any
      ).toHaveMatchingSpawnOutput({
        code: 0,
        stderr: '',
        stdout: /succesfully created/,
      })
    } finally {
      await cleanupRentPayer()
    }

    const rootData = await root({ sdk, address: rootKeypair.publicKey })
    expect(rootData.voteCount.toNumber()).toStrictEqual(0)
    await expect(
      provider.connection.getBalance(rentPayerKeypair.publicKey)
    ).resolves.toBeLessThan(rentPayerFunds)
    await expect(
      provider.connection.getBalance(provider.wallet.publicKey)
    ).resolves.toBeGreaterThan(
      oldWalletBalance -
        (await provider.connection.getMinimumBalanceForRentExemption(0))
    )
  })

  it('creates root in print-only mode', async () => {
    // this is a "mock test" that just checks that print only command works
    await (
      expect([
        'pnpm',
        [
          'cli',
          '-c',
          provider.connection.rpcEndpoint,
          '--program-id',
          sdk.program.programId.toBase58(),
          'create-root',
          '--address',
          rootPath,
          '--print-only',
        ],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ]) as any
    ).toHaveMatchingSpawnOutput({
      code: 0,
      stderr: '',
      stdout: /succesfully created/,
    })
    await expect(
      provider.connection.getAccountInfo(rootKeypair.publicKey)
    ).resolves.toBeNull()
  })
})
