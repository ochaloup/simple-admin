import { parsePubkey } from '@marinade.finance/solana-cli-utils'
import { Keypair, PublicKey } from '@solana/web3.js'
import { Command } from 'commander'
import {
  SimpleAccount,
  findSimpleAccounts,
  simpleAccount,
} from 'simple-admin-sdk'
import { ProgramAccount } from '@saberhq/solana-contrib'
import { useContext } from '../context'
import { BN } from 'bn.js'

export function installShow(program: Command) {
  program
    .command('show')
    .description('Show account data content.')
    .option('--address <pubkey>', 'Address of simple account', parsePubkey)
    .action(async (address?: Promise<PublicKey>) => {
      await manageShow({
        address: await address,
      })
    })
}

async function manageShow({ address }: { address?: PublicKey }) {
  const { sdk } = useContext()

  let data: (SimpleAccount & { publicKey: PublicKey })[] = []
  console.log(address)
  if (address instanceof PublicKey) {
    const simpleAccountData = await simpleAccount({
      sdk,
      address,
    })
    if (simpleAccountData) {
      data = [{ publicKey: address, ...simpleAccountData }]
    }
  } else {
    const programData: ProgramAccount<SimpleAccount>[] =
      await findSimpleAccounts({ sdk })
    data = programData.map(({ publicKey, account }) => {
      return { publicKey, ...account }
    })
  }
  console.log(reformat({programId: sdk.program.programId, data}))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function reformat(value: any): any {
  let result: any // eslint-disable-line @typescript-eslint/no-explicit-any
  if (value === null) {
    result = null
  } else if (value instanceof BN) {
    result = value.toString()
  } else if (value instanceof PublicKey) {
    if (value.equals(PublicKey.default)) {
      result = null
    } else {
      result = value.toBase58()
    }
  } else if (value instanceof Keypair) {
    result = value.publicKey.toBase58()
  } else if (Array.isArray(value)) {
    result = value.map(v => reformat(v))
  } else if (typeof value === 'object') {
    result = {}
    Object.entries(value).forEach(([key, value]) => {
      result[key] = reformat(value)
    })
  } else {
    result = value
  }
  return result
}
