import { TransactionEnvelope } from '@saberhq/solana-contrib'
import {
  CREATE_SIMPLE_ACCOUNT_EVENT,
  CreateSimpleAccountEvent,
  PRINT_ADMIN_EVENT,
  PrintAdminEvent,
  simpleAccount,
  withCreateSimpleAccount,
  withPrintAdmin,
} from '../src'
import { executeTx, initTest } from './test-utils'
import { Keypair } from '@solana/web3.js'

describe('Create simple admin account', () => {
  const { sdk, solanaProvider } = initTest()
  const admin = Keypair.generate()

  it('can create a simple account', async () => {
    const simpleAccountKeypair = Keypair.generate()
    const walletBalanceBefore = await solanaProvider.connection.getBalance(
      solanaProvider.wallet.publicKey
    )

    const event = new Promise<CreateSimpleAccountEvent>(resolve => {
      const listener = sdk.program.addEventListener(
        CREATE_SIMPLE_ACCOUNT_EVENT,
        async event => {
          await sdk.program.removeEventListener(listener)
          resolve(event)
        }
      )
    })

    const tx = new TransactionEnvelope(
      solanaProvider,
      [],
      [simpleAccountKeypair]
    )
    await withCreateSimpleAccount(tx.instructions, {
      sdk,
      address: simpleAccountKeypair.publicKey,
      admin: admin.publicKey,
    })
    await executeTx(tx)

    // Try to fetch to ensure it exists
    const data = await simpleAccount({
      sdk,
      address: simpleAccountKeypair.publicKey,
    })

    // Ensure it has the right data.
    expect(data.admin.toBase58()).toStrictEqual(admin.publicKey.toBase58())
    expect(data.printCallCount.toNumber()).toStrictEqual(0)
    await expect(
      solanaProvider.connection.getBalance(solanaProvider.wallet.publicKey)
    ).resolves.toBeLessThan(walletBalanceBefore)

    // Ensure the event listener was called
    await expect(event).resolves.toStrictEqual({
      admin: admin.publicKey,
    })
  })

  it('can print when admin', async () => {
    const simpleAccountKeypair = Keypair.generate()

    const event = new Promise<PrintAdminEvent>(resolve => {
      const listener = sdk.program.addEventListener(
        PRINT_ADMIN_EVENT,
        async event => {
          await sdk.program.removeEventListener(listener)
          resolve(event)
        }
      )
    })

    const message = 'gm gm'

    const tx = new TransactionEnvelope(
      solanaProvider,
      [],
      [simpleAccountKeypair, admin]
    )
    await withCreateSimpleAccount(tx.instructions, {
      sdk,
      address: simpleAccountKeypair.publicKey,
      admin: admin.publicKey,
    })
    await withPrintAdmin(tx.instructions, {
      sdk,
      address: simpleAccountKeypair.publicKey,
      admin: admin.publicKey,
      message,
    })
    await executeTx(tx)

    // Try to fetch to ensure it exists
    const data = await simpleAccount({
      sdk,
      address: simpleAccountKeypair.publicKey,
    })

    // Ensure it has the right data.
    expect(data.admin.toBase58()).toStrictEqual(admin.publicKey.toBase58())
    expect(data.printCallCount.toNumber()).toStrictEqual(1)
    // Ensure the event listener was called
    await expect(event).resolves.toStrictEqual({
      admin: admin.publicKey,
      message,
    })
  })
})
