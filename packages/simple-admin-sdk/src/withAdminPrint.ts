import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js'
import { DEFAULT_SIMPLE_ADMIN_ROOT, SimpleAdminSdk } from './sdk'
import { voteRecordAddress } from './accounts'

/**
 * Generating an instruction to create a new simple admin vote record account
 * which is a PDA address of root and owner.
 *
 * Instruction requires signature of owner and rentPayer.
 */
export async function withCreateVote(
  instructions: TransactionInstruction[],
  {
    sdk,
    owner,
    validatorVote,
    root = new PublicKey(DEFAULT_SIMPLE_ADMIN_ROOT),
    rentPayer,
  }: {
    sdk: SimpleAdminSdk
    root: PublicKey
    owner?: PublicKey
    validatorVote: PublicKey
    rentPayer?: PublicKey
  }
): Promise<PublicKey> {
  owner = (owner || sdk.program.provider.publicKey)!
  rentPayer = (rentPayer || sdk.program.provider.publicKey)!

  const voteRecord = voteRecordAddress({
    directedStakeProgramId: sdk.program.programId,
    root,
    owner,
  }).address

  const ix = await sdk.program.methods
    .createVote()
    .accountsStrict({
      root,
      owner,
      voteRecord,
      validatorVote,
      rentPayer,
      systemProgram: SystemProgram.programId,
    })
    .instruction()

  instructions.push(ix)
  return voteRecord
}
