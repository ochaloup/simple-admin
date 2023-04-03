import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js'
import { SimpleAdminSdk } from './sdk'

/**
 * Generating an instruction to create a new root account
 * of simple admin contract.
 *
 * Instruction requires signature of root and rentPayer.
 */
export async function withCreateRoot(
  instructions: TransactionInstruction[],
  {
    sdk,
    root,
    rentPayer,
  }: {
    sdk: SimpleAdminSdk
    root: PublicKey
    rentPayer?: PublicKey
  }
) {
  rentPayer = (rentPayer || sdk.program.provider.publicKey)!

  const ix = await sdk.program.methods
    .createRoot()
    .accountsStrict({
      root,
      rentPayer,
      systemProgram: SystemProgram.programId,
    })
    .instruction()

  instructions.push(ix)
}
