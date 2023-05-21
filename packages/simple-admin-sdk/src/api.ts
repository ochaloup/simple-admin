import { ProgramAccount } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import { SimpleAccount, SimpleAdminSdk } from './sdk'

export async function simpleAccount({
  sdk,
  address,
}: {
  sdk: SimpleAdminSdk
  address: PublicKey
}): Promise<SimpleAccount | null> {
  return sdk.program.account.simpleAccount.fetchNullable(address)
}

export async function findSimpleAccounts({
  sdk,
  admin,
}: {
  sdk: SimpleAdminSdk
  admin?: PublicKey
}): Promise<ProgramAccount<SimpleAccount>[]> {
  const filters = []
  if (admin) {
    filters.push({
      memcmp: {
        bytes: admin.toBase58(),
        offset: 8,
      },
    })
  }
  return await sdk.program.account.simpleAccount.all(filters)
}
