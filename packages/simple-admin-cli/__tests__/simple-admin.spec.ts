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
  simpleAccount,
  withCreateSimpleAccount,
} from 'simple-admin-sdk'
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet'
import assert from 'assert'

beforeAll(() => {
  shellMatchers()
})

describe('Create simple admin account using CLI', () => {
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

  let addressPath: string
  let addressKeypair: Keypair
  let addressCleanup: () => Promise<void>
  let adminPath: string
  let adminKeypair: Keypair
  let adminCleanup: () => Promise<void>

  beforeEach(async () => {
    // eslint-disable-next-line @typescript-eslint/no-extra-semi
    ;({
      path: addressPath,
      keypair: addressKeypair,
      cleanup: addressCleanup,
    } = await createTempFileKeypair())
    // eslint-disable-next-line @typescript-eslint/no-extra-semi
    ;({
      path: adminPath,
      keypair: adminKeypair,
      cleanup: adminCleanup,
    } = await createTempFileKeypair())
  })

  afterEach(async () => {
    await adminCleanup()
    await addressCleanup()
  })

  it('creates account with rent payer and admin', async () => {
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
            '-u',
            provider.connection.rpcEndpoint,
            '--program-id',
            sdk.program.programId.toBase58(),
            'create-simple-account',
            '--address',
            addressPath,
            '--admin',
            adminKeypair.publicKey.toBase58(),
            '--rent-payer',
            rentPayerPath,
          ],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ]) as any
      ).toHaveMatchingSpawnOutput({
        code: 0,
        stderr: '',
        stdout: /successfully created/,
      })
    } finally {
      await cleanupRentPayer()
    }

    const rootData = await simpleAccount({
      sdk,
      address: addressKeypair.publicKey,
    })
    expect(rootData).not.toBeNull()
    assert(rootData !== null)

    expect(rootData.admin.toBase58()).toStrictEqual(
      adminKeypair.publicKey.toBase58()
    )
    expect(rootData.printCallCount.toNumber()).toStrictEqual(0)
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
          '--cluster',
          provider.connection.rpcEndpoint,
          '--program-id',
          sdk.program.programId.toBase58(),
          'create-simple-account',
          '--address',
          addressPath,
          '--print-only',
        ],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ]) as any
    ).toHaveMatchingSpawnOutput({
      code: 0,
      stderr: '',
      stdout: /successfully created/,
    })
    await expect(
      provider.connection.getAccountInfo(addressKeypair.publicKey)
    ).resolves.toBeNull()
  })

  it('do print a message', async () => {
    const tx = new TransactionEnvelope(provider, [], [addressKeypair])
    await withCreateSimpleAccount(tx.instructions, {
      sdk,
      address: addressKeypair.publicKey,
      admin: adminKeypair.publicKey,
    })
    await tx.confirm()

    await (
      expect([
        'pnpm',
        [
          'cli',
          '-u',
          provider.connection.rpcEndpoint,
          '--program-id',
          sdk.program.programId.toBase58(),
          'print-message',
          addressKeypair.publicKey.toBase58(),
          '--admin',
          adminPath,
          '--message',
          'hello world',
        ],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ]) as any
    ).toHaveMatchingSpawnOutput({
      code: 0,
      stderr: '',
      stdout: /successfully printed/,
    })
    const data = await simpleAccount({
      sdk,
      address: addressKeypair.publicKey,
    })
    expect(data).not.toBeNull()
    assert(data !== null)
    expect(data.printCallCount.toNumber()).toStrictEqual(1)
  })
})
