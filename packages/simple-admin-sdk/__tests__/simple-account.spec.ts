import { TransactionEnvelope } from '@saberhq/solana-contrib'
import {
  CREATE_SIMPLE_ACCOUNT_EVENT,
  CreateSimpleAccountEvent,
  simpleAccount,
  withCreateSimpleAccount,
} from '../src'
import { createUserAndFund, executeTx, initTest } from './test-utils'
import { Keypair } from '@solana/web3.js'

describe('Create simple admin account', () => {
  const { provider, sdk, solanaProvider } = initTest()
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
    })
    await executeTx(tx)

    // Try to fetch to ensure it exists
    const rootData = await simpleAccount({
      sdk,
      address: simpleAccountKeypair.publicKey,
    })

    // Ensure it has the right data.
    await expect(
      solanaProvider.connection.getBalance(solanaProvider.wallet.publicKey)
    ).resolves.toBeLessThan(walletBalanceBefore)

    // Ensure the event listener was called
    await expect(event).resolves.toStrictEqual({
      root: simpleAccountKeypair.publicKey,
    })
  })
})
