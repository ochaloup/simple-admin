import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js'
import { SimpleAdminSdk } from './sdk'

export async function withCreateSimpleAccount(
  instructions: TransactionInstruction[],
  {
    sdk,
    address,
    admin,
    rentPayer,
  }: {
    sdk: SimpleAdminSdk
    address: PublicKey
    admin?: PublicKey
    rentPayer?: PublicKey
  }
) {
  admin = (admin || sdk.program.provider.publicKey)!
  rentPayer = (rentPayer || sdk.program.provider.publicKey)!

  const ix = await sdk.program.methods
    .createSimpleAccount({admin})
    .accountsStrict({
      simpleAccount: address,
      rentPayer,
      systemProgram: SystemProgram.programId,
    })
    .instruction()

  instructions.push(ix)
}
