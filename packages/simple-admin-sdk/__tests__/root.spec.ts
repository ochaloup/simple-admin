import { TransactionEnvelope } from '@saberhq/solana-contrib'
import {
  CREATE_ROOT_EVENT,
  CreateRootEvent,
  withCreateRoot,
  root,
} from '../src'
import { createUserAndFund, executeTx, initTest } from './test-utils'
import { Keypair } from '@solana/web3.js'

describe('Create simple admin root', () => {
  const { provider, sdk, solanaProvider } = initTest()

  it('can create a root', async () => {
    const rootKeypair = Keypair.generate()
    let voteCountBefore = 0
    try {
      voteCountBefore = (
        await root({ sdk, address: rootKeypair.publicKey })
      ).voteCount.toNumber()
    } catch (e) {
      // ignore as root account doesn't exist yet
    }
    const walletBalanceBefore = await solanaProvider.connection.getBalance(
      solanaProvider.wallet.publicKey
    )

    const event = new Promise<CreateRootEvent>(resolve => {
      const listener = sdk.program.addEventListener(
        CREATE_ROOT_EVENT,
        async event => {
          await sdk.program.removeEventListener(listener)
          resolve(event)
        }
      )
    })

    const tx = new TransactionEnvelope(solanaProvider, [], [rootKeypair])
    await withCreateRoot(tx.instructions, {
      sdk,
      root: rootKeypair.publicKey,
    })
    await executeTx(tx)

    // Try to fetch to ensure it exists
    const rootData = await root({ sdk, address: rootKeypair.publicKey })

    // Ensure it has the right data.
    expect(rootData.voteCount.toNumber()).toStrictEqual(voteCountBefore)
    await expect(
      solanaProvider.connection.getBalance(solanaProvider.wallet.publicKey)
    ).resolves.toBeLessThan(walletBalanceBefore)

    // Ensure the event listener was called
    await expect(event).resolves.toStrictEqual({
      root: rootKeypair.publicKey,
    })
  })

  it('can create a another root with different rent payer', async () => {
    const otherRootKeypair = Keypair.generate()
    const alice = await createUserAndFund(solanaProvider)

    let voteCountBefore = 0
    try {
      voteCountBefore = (
        await root({ sdk, address: otherRootKeypair.publicKey })
      ).voteCount.toNumber()
    } catch (e) {
      // ignore as root account doesn't exist yet
    }

    const walletBalanceBefore = await provider.connection.getBalance(
      solanaProvider.wallet.publicKey
    )
    const aliceBalanceBefore = await provider.connection.getBalance(
      alice.publicKey
    )

    const tx = new TransactionEnvelope(
      solanaProvider,
      [],
      [otherRootKeypair, alice]
    )
    await withCreateRoot(tx.instructions, {
      sdk,
      root: otherRootKeypair.publicKey,
      rentPayer: alice.publicKey,
    })
    await executeTx(tx)

    // Try to fetch to ensure it exists
    const otherRoot = await root({
      sdk,
      address: otherRootKeypair.publicKey,
    })

    // Ensure it has the right data.
    expect(otherRoot.voteCount.toNumber()).toStrictEqual(voteCountBefore)
    await expect(
      provider.connection.getBalance(solanaProvider.wallet.publicKey)
    ).resolves.toBeLessThan(walletBalanceBefore)
    await expect(
      provider.connection.getBalance(alice.publicKey)
    ).resolves.toBeLessThan(aliceBalanceBefore)
  })
})
