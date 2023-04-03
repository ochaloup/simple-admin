import { encode } from '@coral-xyz/anchor/dist/cjs/utils/bytes/utf8'
import { PublicKey } from '@solana/web3.js'
import { DEFAULT_SIMPLE_ADMIN_PROGRAM_ID, SIMPLE_ADMIN_SEED } from './sdk'

export function voteRecordAddress({
  directedStakeProgramId = new PublicKey(DEFAULT_SIMPLE_ADMIN_PROGRAM_ID),
  root,
  owner,
}: {
  directedStakeProgramId?: PublicKey
  root: PublicKey
  owner: PublicKey
}): { address: PublicKey; bump: number } {
  const [address, bump] = PublicKey.findProgramAddressSync(
    [encode(SIMPLE_ADMIN_SEED), root.toBytes(), owner.toBytes()],
    directedStakeProgramId
  )
  return { address, bump }
}
