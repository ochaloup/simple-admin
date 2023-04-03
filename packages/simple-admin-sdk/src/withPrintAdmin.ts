import {
  PublicKey,
  TransactionInstruction,
} from '@solana/web3.js'
import { SimpleAdminSdk } from './sdk'

export async function withPrintAdmin(
  instructions: TransactionInstruction[],
  {
    sdk,
    address,
    admin,
    message,
  }: {
    sdk: SimpleAdminSdk
    address: PublicKey
    admin: PublicKey
    message: string
  }
) {
  admin = (admin || sdk.program.provider.publicKey)!

  const ix = await sdk.program.methods
    .printAdmin({message})
    .accountsStrict({
      simpleAdminAccount: address,
      admin,
    })
    .instruction()

  instructions.push(ix)
}
