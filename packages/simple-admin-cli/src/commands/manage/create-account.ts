import {
  parseKeypair,
  parsePubkeyOrKeypair,
} from '@marinade.finance/solana-cli-utils'
import { Keypair, PublicKey } from '@solana/web3.js'
import { Command } from 'commander'
import { useContext } from '../../context'
import { withCreateRoot } from '../../../../simple-admin-sdk/src'
import { executeTx } from '../utils'
import { TransactionEnvelope } from '@saberhq/solana-contrib'

export function installCreateRoot(program: Command) {
  program
    .command('create-root')
    .description('Create a new simple admin root account.')
    .option(
      '--address <pubkey_or_keypair>',
      'Keypair as address of the new root of simple admin, when not set a random address is generated ',
      parsePubkeyOrKeypair
    )
    .option(
      '--rent-payer <keypair>',
      'Rent payer for the account creation (default: wallet keypair)',
      parseKeypair
    )
    .action(
      async ({
        address,
        rentPayer,
      }: {
        address?: Promise<PublicKey | Keypair>
        rentPayer?: Promise<Keypair>
      }) => {
        await manageCreateRoot({
          address: await address,
          rentPayer: await rentPayer,
        })
      }
    )
}

async function manageCreateRoot({
  address = Keypair.generate(),
  rentPayer,
}: {
  address?: PublicKey | Keypair
  rentPayer?: Keypair
}) {
  const { sdk, provider, logger } = useContext()

  const rootAddress = address instanceof PublicKey ? address : address.publicKey

  const tx = new TransactionEnvelope(provider, [], [])
  if (address instanceof Keypair) {
    tx.addSigners(address)
  }
  if (rentPayer instanceof Keypair) {
    tx.addSigners(rentPayer)
  }
  await withCreateRoot(tx.instructions, {
    sdk,
    root: rootAddress,
    rentPayer: rentPayer?.publicKey,
  })

  await executeTx(
    tx,
    `'Failed to create root of simple admin ${rootAddress.toBase58()}`
  )
  logger.info(`Root ${rootAddress.toBase58()} succesfully created`)
}
