import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js'
import { PRINT_MESSAGE_ACCOUNT_SEED, SimpleAdminSdk } from './sdk'
import { simpleAccount } from './api'

export async function withPrintMessage(
  instructions: TransactionInstruction[],
  {
    sdk,
    address,
    admin,
    rentPayer,
    message,
    printIndex = 0,
  }: {
    sdk: SimpleAdminSdk
    address: PublicKey
    admin?: PublicKey
    rentPayer?: PublicKey
    message: string
    printIndex?: number
  }
): Promise<PublicKey> {
  admin = (admin ?? sdk.program.provider.publicKey)!
  rentPayer = (rentPayer ?? sdk.program.provider.publicKey)!

  const simpleAccountData = await simpleAccount({ sdk, address })
  printIndex = simpleAccountData
    ? simpleAccountData.createdAccountNextIndex
    : printIndex

  // Solana uses little endian number encoding
  const nextIndexBuf = Buffer.alloc(4)
  nextIndexBuf.writeInt32LE(printIndex, 0)
  const printAccount = PublicKey.findProgramAddressSync(
    [PRINT_MESSAGE_ACCOUNT_SEED, address.toBuffer(), nextIndexBuf],
    sdk.program.programId
  )[0]

  const ix = await sdk.program.methods
    .printMessage(message)
    .accountsStrict({
      simpleAdminAccount: address,
      admin,
      rentPayer,
      printAccount,
      systemProgram: SystemProgram.programId,
    })
    .instruction()

  instructions.push(ix)

  return printAccount
}
