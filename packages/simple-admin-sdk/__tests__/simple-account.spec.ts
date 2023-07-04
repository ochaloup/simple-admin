import { TransactionEnvelope } from '@saberhq/solana-contrib'
import {
  CREATE_SIMPLE_ACCOUNT_EVENT,
  CreateSimpleAccountEvent,
  PRINT_MESSAGE_EVENT,
  PrintMessageEvent,
  findPrintAccounts,
  findSimpleAccounts,
  simpleAccount,
  withCreateSimpleAccount,
  withPrintMessage,
} from '../src'
import { executeTx, initTest } from './test-utils'
import { Keypair } from '@solana/web3.js'
import assert from 'assert'

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
    expect(data).not.toBeNull()
    assert(data !== null)

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

    // Check the simple admin account is searchable with filter of admin
    const simpleAdminAccounts = await findSimpleAccounts({
      sdk,
      admin: admin.publicKey,
    })
    expect(simpleAdminAccounts.length).toStrictEqual(1)
  })

  it('can print when admin', async () => {
    const simpleAccountKeypair = Keypair.generate()

    const event = new Promise<PrintMessageEvent>(resolve => {
      const listener = sdk.program.addEventListener(
        PRINT_MESSAGE_EVENT,
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
    const printAccountAddress = await withPrintMessage(tx.instructions, {
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
    expect(data).not.toBeNull()
    assert(data !== null)

    // Ensure it has the right data.
    expect(data.admin.toBase58()).toStrictEqual(admin.publicKey.toBase58())
    expect(data.printCallCount.toNumber()).toStrictEqual(1)
    expect(data.createdAccountNextIndex).toStrictEqual(1)
    // Ensure the event listener was called
    await expect(event).resolves.toMatchObject({
      admin: admin.publicKey,
      message,
      printAccount: printAccountAddress,
      // printCallCount: new BN(1),
      createdAccountNextIndex: 1,
    })

    // Check the print account is searchable with filter on simple account address
    const printAccountsData = await findPrintAccounts({
      sdk,
      simpleAccountAddress: simpleAccountKeypair.publicKey,
    })
    expect(printAccountsData.length).toStrictEqual(1)
    expect(printAccountsData[0].account.message).toStrictEqual(message)
  })
})
