import { ProgramAccount } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import {
  SimpleAdminRoot,
  SimpleAdminSdk,
  SimpleAdminVoteRecord,
} from './sdk'

export async function voteRecord({
  sdk,
  address,
}: {
  sdk: SimpleAdminSdk
  address: PublicKey
}): Promise<SimpleAdminVoteRecord> {
  return sdk.program.account.voteRecord.fetch(address)
}

export async function root({
  sdk,
  address,
}: {
  sdk: SimpleAdminSdk
  address: PublicKey
}): Promise<SimpleAdminRoot> {
  return sdk.program.account.root.fetch(address)
}

export async function findVoteRecords({
  sdk,
  root,
  owner,
  validatorVote,
}: {
  sdk: SimpleAdminSdk
  root?: PublicKey
  owner?: PublicKey
  validatorVote?: PublicKey
}): Promise<ProgramAccount<SimpleAdminVoteRecord>[]> {
  const filters = []
  if (root) {
    filters.push({
      memcmp: {
        bytes: root.toBase58(),
        offset: 8,
      },
    })
  }
  if (owner) {
    filters.push({
      memcmp: {
        bytes: owner.toBase58(),
        offset: 40,
      },
    })
  }
  if (validatorVote) {
    filters.push({
      memcmp: {
        bytes: validatorVote.toBase58(),
        offset: 72,
      },
    })
  }
  return await sdk.program.account.voteRecord.all(filters)
}
