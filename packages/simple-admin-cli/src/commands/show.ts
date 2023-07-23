import { parsePubkey } from '@marinade.finance/solana-cli-utils'
import { Keypair, PublicKey } from '@solana/web3.js'
import { Command } from 'commander'
import {
  PrintAccount,
  SimpleAccount,
  findPrintAccounts,
  findSimpleAccounts,
  printAccount,
  simpleAccount,
} from 'simple-admin-sdk'
import { ProgramAccount } from '@saberhq/solana-contrib'
import { useContext } from '../context'
import { BN } from 'bn.js'

export function installShow(program: Command) {
  program
    .command('show')
    .description('Show account data content')
    .option(
      '-a, --address <pubkey>',
      'Address of simple account to be printed. ' +
        'When not provided printing all existing simple accounts of the program.',
      parsePubkey
    )
    .option(
      '-n, --print-address [pubkey]',
      'Show the content of the account with message.' +
        'When no pubkey is specified then searching for all print accounts for particular simple account address defined by --address.'
    )
    .action(
      async ({
        address,
        printAddress,
      }: {
        address?: Promise<PublicKey>
        printAddress?: string | boolean
      }) => {
        await manageShow({
          address: await address,
          printAddress: isString(printAddress)
            ? new PublicKey(printAddress)
            : printAddress,
        })
      }
    )
}

async function manageShow({
  address,
  printAddress,
}: {
  address?: PublicKey
  printAddress?: PublicKey | boolean
}) {
  const { sdk } = useContext()
  let data: (SimpleAccount | (PrintAccount & { publicKey: PublicKey }))[] = []

  if (printAddress instanceof PublicKey && address instanceof PublicKey) {
    throw new Error(
      'Cannot specify both --address and --print-address with PublicKeys. Not clear what should be printed.'
    )
  }

  if (printAddress instanceof PublicKey) {
    const printAccountData = await printAccount({ sdk, address: printAddress })
    if (printAccountData) {
      data = [{ publicKey: printAddress, ...printAccountData }]
    }
  } else if (printAddress === true) {
    if (!address) {
      throw new Error(
        'Cannot specify --print-address without Pubkey and without simple-account --address'
      )
    }
    const printAccountsData = await findPrintAccounts({
      sdk,
      simpleAccountAddress: address,
    })
    data = printAccountsData.map(({ publicKey, account }) => {
      return { publicKey, ...account }
    })
  } else if (address instanceof PublicKey) {
    const simpleAccountData = await simpleAccount({
      sdk,
      address,
    })
    if (simpleAccountData) {
      data = [{ publicKey: address, ...simpleAccountData }]
    }
  } else {
    const simpleAccountsData: ProgramAccount<SimpleAccount>[] =
      await findSimpleAccounts({ sdk })
    data = simpleAccountsData.map(({ publicKey, account }) => {
      return { publicKey, ...account }
    })
  }
  console.log(reformat({ programId: sdk.program.programId, data }))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isString(value: any): value is string {
  return value && (typeof value === 'string' || value instanceof String)
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
