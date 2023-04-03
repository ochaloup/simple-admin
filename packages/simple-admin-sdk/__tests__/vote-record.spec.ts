import {
  CreateVoteRecordEvent,
  CREATE_VOTE_RECORD_EVENT,
  RemoveVoteRecordEvent,
  REMOVE_VOTE_RECORD_EVENT,
  UpdateVoteRecordEvent,
  UPDATE_VOTE_RECORD_EVENT,
  withCreateRoot,
  root,
  withCreateVote,
  voteRecordAddress,
  voteRecord,
  withUpdateVote,
  withRemoveVote,
  findVoteRecords,
} from '../src'
import {
  createUserAndFund,
  createTestVoteAccount,
  executeTx,
  testVoteAccountIx,
  initTest,
} from './test-utils'
import { Keypair, SendTransactionError } from '@solana/web3.js'
import { TransactionEnvelope } from '@saberhq/solana-contrib'
import { AnchorError, ProgramError } from '@coral-xyz/anchor'

describe('verify vote record', () => {
  const { provider, sdk, solanaProvider } = initTest()

  let rootKeypair: Keypair
  beforeEach(async () => {
    rootKeypair = Keypair.generate()
    const tx = new TransactionEnvelope(solanaProvider, [], [rootKeypair])
    await withCreateRoot(tx.instructions, {
      sdk,
      root: rootKeypair.publicKey,
    })
    await executeTx(tx)
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function verifyError(e: any, errMsg: string, errCode: number) {
    if (e instanceof ProgramError) {
      expect(e.msg).toStrictEqual(errMsg)
      expect(e.code).toStrictEqual(errCode)
    } else if (e instanceof AnchorError) {
      expect(e.error.errorMessage).toStrictEqual(errMsg)
      expect(e.error.errorCode.number).toStrictEqual(errCode)
    } else if (e instanceof SendTransactionError) {
      expect(e.logs).toBeDefined()
      expect(e.logs!.find(l => l.indexOf(errMsg) > -1)).toBeDefined()
    } else {
      console.error(e)
      throw e
    }
  }

  it('can create a vote record', async () => {
    const { voteAccount } = await createTestVoteAccount(solanaProvider)
    const voteCountBefore = (
      await root({ sdk, address: rootKeypair.publicKey })
    ).voteCount.toNumber()

    const event = new Promise<CreateVoteRecordEvent>(resolve => {
      const listener = sdk.program.addEventListener(
        CREATE_VOTE_RECORD_EVENT,
        async event => {
          await sdk.program.removeEventListener(listener)
          resolve(event)
        }
      )
    })

    const tx = new TransactionEnvelope(solanaProvider, [], [])
    const address = await withCreateVote(tx.instructions, {
      sdk,
      root: rootKeypair.publicKey,
      validatorVote: voteAccount.publicKey,
      owner: solanaProvider.wallet.publicKey,
    })
    await executeTx(tx)

    // Fetch the account details of the created voteRecord
    const rootData = await root({ sdk, address: rootKeypair.publicKey })
    const voteRecordData = await voteRecord({ sdk, address })

    // Ensure it has the right data.
    expect(voteRecordData.root.toBase58()).toStrictEqual(
      rootKeypair.publicKey.toBase58()
    )
    expect(voteRecordData.validatorVote.toBase58()).toStrictEqual(
      voteAccount.publicKey.toBase58()
    )
    expect(voteRecordData.owner.toBase58()).toStrictEqual(
      solanaProvider.wallet.publicKey.toBase58()
    )
    expect(voteRecordData.bump).toBeGreaterThan(0)
    expect(rootData.voteCount.toNumber()).toStrictEqual(voteCountBefore + 1)

    // Ensure the event listener was called
    await event.then(e => {
      expect(e.bump).toEqual(
        voteRecordAddress({
          root: rootKeypair.publicKey,
          owner: solanaProvider.wallet.publicKey,
        }).bump
      )
      expect(e.newVoteCount.toNumber()).toEqual(voteCountBefore + 1)
      expect(e.root.toBase58()).toEqual(rootKeypair.publicKey.toBase58())
      expect(e.owner.toBase58()).toEqual(
        solanaProvider.wallet.publicKey.toBase58()
      )
      expect(e.validatorVote.toBase58()).toEqual(
        voteAccount.publicKey.toBase58()
      )
    })
  })

  it('can create a vote record from a different owner', async () => {
    const { voteAccount } = await createTestVoteAccount(solanaProvider)
    const alice = await createUserAndFund(solanaProvider)
    const voteCountBefore = (
      await root({ sdk, address: rootKeypair.publicKey })
    ).voteCount.toNumber()

    const aliceBalanceBefore = await provider.connection.getBalance(
      alice.publicKey
    )

    const tx = new TransactionEnvelope(solanaProvider, [], [alice])
    const address = await withCreateVote(tx.instructions, {
      sdk,
      root: rootKeypair.publicKey,
      validatorVote: voteAccount.publicKey,
      owner: alice.publicKey,
      rentPayer: alice.publicKey,
    })
    await executeTx(tx)

    // Fetch the account details of the created voteRecord
    const rootData = await root({ sdk, address: rootKeypair.publicKey })
    const voteRecordData = await voteRecord({ sdk, address })

    // Ensure it has the right data.
    expect(voteRecordData.root.toBase58()).toStrictEqual(
      rootKeypair.publicKey.toBase58()
    )
    expect(voteRecordData.validatorVote.toBase58()).toStrictEqual(
      voteAccount.publicKey.toBase58()
    )
    expect(voteRecordData.owner.toBase58()).toStrictEqual(
      alice.publicKey.toBase58()
    )
    expect(voteRecordData.bump).toBeGreaterThan(0)
    expect(rootData.voteCount.toNumber()).toStrictEqual(voteCountBefore + 1)
    await expect(
      provider.connection.getBalance(alice.publicKey)
    ).resolves.toBeLessThan(aliceBalanceBefore)
  })

  it('can update a vote record', async () => {
    const { voteAccount } = await createTestVoteAccount(solanaProvider)

    const tx = new TransactionEnvelope(solanaProvider, [], [])
    const address = await withCreateVote(tx.instructions, {
      sdk,
      root: rootKeypair.publicKey,
      validatorVote: voteAccount.publicKey,
    })
    await executeTx(tx)

    // check if vote record exists
    const voteRecordBefore = await voteRecord({ sdk, address })

    const { voteAccount: voteAccount2 } = await createTestVoteAccount(
      solanaProvider
    )

    const event = new Promise<UpdateVoteRecordEvent>(resolve => {
      const listener = sdk.program.addEventListener(
        UPDATE_VOTE_RECORD_EVENT,
        async event => {
          await sdk.program.removeEventListener(listener)
          resolve(event)
        }
      )
    })

    const txUpdate = new TransactionEnvelope(solanaProvider, [], [])
    await withUpdateVote(txUpdate.instructions, {
      sdk,
      root: rootKeypair.publicKey,
      validatorVote: voteAccount2.publicKey,
    })
    await executeTx(txUpdate)

    const voteRecordData = await voteRecord({ sdk, address })

    // Ensure it has the right data.
    expect(voteRecordData.validatorVote.toBase58()).toStrictEqual(
      voteAccount2.publicKey.toBase58()
    )
    expect(voteRecordData.validatorVote.toBase58()).not.toStrictEqual(
      voteRecordBefore.validatorVote.toBase58()
    )

    // Ensure the event listener was called
    await event.then(e => {
      expect(e.root.toBase58()).toEqual(rootKeypair.publicKey.toBase58())
      expect(e.owner.toBase58()).toEqual(
        solanaProvider.wallet.publicKey.toBase58()
      )
      expect(e.oldValidatorVote.toBase58()).toEqual(
        voteAccount.publicKey.toBase58()
      )
      expect(e.newValidatorVote.toBase58()).toEqual(
        voteAccount2.publicKey.toBase58()
      )
    })
  })

  it('should fail to update vote of another owner', async () => {
    const alice = await createUserAndFund(solanaProvider)

    const { voteAccount } = await createTestVoteAccount(solanaProvider)

    const tx = new TransactionEnvelope(solanaProvider, [], [])
    const address = await withCreateVote(tx.instructions, {
      sdk,
      root: rootKeypair.publicKey,
      validatorVote: voteAccount.publicKey,
      owner: solanaProvider.wallet.publicKey,
    })
    await executeTx(tx)

    // check if vote record exists
    await voteRecord({ sdk, address })

    const { voteAccount: voteAccountNew } = await createTestVoteAccount(
      solanaProvider
    )
    try {
      await sdk.program.methods
        .updateVote()
        .accountsStrict({
          owner: alice.publicKey,
          voteRecord: address,
          validatorVote: voteAccountNew.publicKey,
        })
        .signers([alice])
        .rpc()
      fail('Should have failed, constraint violated')
    } catch (e) {
      verifyError(e, 'A seeds constraint was violated', 2006)
    }
  })

  it('should fail inserting non vote account', async () => {
    const tx = new TransactionEnvelope(solanaProvider, [], [])
    await withCreateVote(tx.instructions, {
      sdk,
      root: rootKeypair.publicKey,
      validatorVote: Keypair.generate().publicKey,
      owner: solanaProvider.wallet.publicKey,
    })
    try {
      await executeTx(tx)
      fail('Should have failed, constraint violated')
    } catch (e) {
      verifyError(e, 'Account not owned by Solana Vote program', 6000)
    }
  })

  it('should fail to remove vote of another owner', async () => {
    const alice = await createUserAndFund(solanaProvider)

    const { voteAccount } = await createTestVoteAccount(solanaProvider)
    const tx = new TransactionEnvelope(solanaProvider, [], [])
    const address = await withCreateVote(tx.instructions, {
      sdk,
      root: rootKeypair.publicKey,
      validatorVote: voteAccount.publicKey,
      owner: solanaProvider.wallet.publicKey,
    })
    await executeTx(tx)

    // check if vote record exists
    await voteRecord({ sdk, address })
    const rootData = await root({ sdk, address: rootKeypair.publicKey })
    expect(rootData.voteCount.toNumber()).toStrictEqual(1)

    try {
      await sdk.program.methods
        .removeVote()
        .accountsStrict({
          owner: alice.publicKey,
          voteRecord: address,
          root: rootKeypair.publicKey,
          rentCollector: solanaProvider.wallet.publicKey,
        })
        .signers([alice])
        .rpc()
      fail('Should have failed, a constraint violated')
    } catch (e) {
      verifyError(e, 'A seeds constraint was violated', 2006)
      const rootData = await root({ sdk, address: rootKeypair.publicKey })
      expect(rootData.voteCount.toNumber()).toStrictEqual(1)
    }
  })

  it('can remove a vote record', async () => {
    const rentCollector = await createUserAndFund(
      solanaProvider,
      Keypair.generate()
    )
    const beforeBalance = await provider.connection.getBalance(
      rentCollector.publicKey
    )

    const { voteAccount } = await createTestVoteAccount(solanaProvider)

    const tx = new TransactionEnvelope(solanaProvider, [], [rentCollector])
    await withCreateVote(tx.instructions, {
      sdk,
      root: rootKeypair.publicKey,
      validatorVote: voteAccount.publicKey,
      owner: solanaProvider.wallet.publicKey,
      rentPayer: solanaProvider.wallet.publicKey,
    })
    await withCreateVote(tx.instructions, {
      sdk,
      root: rootKeypair.publicKey,
      validatorVote: voteAccount.publicKey,
      owner: rentCollector.publicKey,
      rentPayer: solanaProvider.wallet.publicKey,
    })
    await executeTx(tx)

    let rootData = await root({ sdk, address: rootKeypair.publicKey })
    expect(rootData.voteCount.toNumber()).toStrictEqual(2)

    const event = new Promise<RemoveVoteRecordEvent>(resolve => {
      const listener = sdk.program.addEventListener(
        REMOVE_VOTE_RECORD_EVENT,
        async event => {
          await sdk.program.removeEventListener(listener)
          resolve(event)
        }
      )
    })

    const txRemove = new TransactionEnvelope(solanaProvider, [], [])
    await withRemoveVote(txRemove.instructions, {
      sdk,
      root: rootKeypair.publicKey,
      owner: solanaProvider.wallet.publicKey,
      rentCollector: rentCollector.publicKey,
    })
    await executeTx(txRemove)

    // Retrieved rent exemption SOL.
    const rentExempt =
      await provider.connection.getMinimumBalanceForRentExemption(8 + 97)
    await expect(
      provider.connection.getBalance(rentCollector.publicKey)
    ).resolves.toStrictEqual(beforeBalance + rentExempt)

    const closedAccount = await provider.connection.getAccountInfo(
      voteRecordAddress({
        root: rootKeypair.publicKey,
        owner: solanaProvider.wallet.publicKey,
      }).address
    )
    expect(closedAccount).toBeNull()

    rootData = await root({ sdk, address: rootKeypair.publicKey })
    expect(rootData.voteCount.toNumber()).toStrictEqual(1)

    // Ensure the event listener was called
    await event.then(e => {
      expect(e.newVoteCount.toNumber()).toEqual(1)
      expect(e.root.toBase58()).toEqual(rootKeypair.publicKey.toBase58())
      expect(e.owner.toBase58()).toEqual(
        solanaProvider.wallet.publicKey.toBase58()
      )
      expect(e.validatorVote.toBase58()).toEqual(
        voteAccount.publicKey.toBase58()
      )
    })
  })

  it('can find multiple vote records', async () => {
    const numberOfVoteRecords = 31
    const tx = new TransactionEnvelope(solanaProvider, [])
    let firstOwner: Keypair | undefined
    for (let i = 0; i < numberOfVoteRecords; i++) {
      const { voteAccount, nodeIdentity } = await testVoteAccountIx(
        tx.instructions,
        solanaProvider
      )
      const owner = Keypair.generate()
      if (i === 0) {
        firstOwner = owner
      }
      await withCreateVote(tx.instructions, {
        sdk,
        root: rootKeypair.publicKey,
        validatorVote: voteAccount.publicKey,
        owner: owner.publicKey,
        rentPayer: solanaProvider.wallet.publicKey,
      })
      tx.addSigners(owner, voteAccount, nodeIdentity)
    }
    await executeTx(tx)

    const voteRecords = await findVoteRecords({
      sdk,
      root: rootKeypair.publicKey,
    })
    expect(voteRecords.length).toEqual(numberOfVoteRecords)

    expect(firstOwner).toBeDefined()
    const txRemove = new TransactionEnvelope(solanaProvider, [], [firstOwner!])
    await withRemoveVote(txRemove.instructions, {
      sdk,
      root: rootKeypair.publicKey,
      owner: firstOwner!.publicKey,
      rentCollector: solanaProvider.wallet.publicKey,
    })
    await executeTx(txRemove)

    const voteRecordsOnRemove = await findVoteRecords({
      sdk,
      root: rootKeypair.publicKey,
    })
    expect(voteRecordsOnRemove.length).toEqual(numberOfVoteRecords - 1)
  })
})
