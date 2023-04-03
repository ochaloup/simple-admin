import {
  parsePubkey,
  parseKeypair,
  parsePubkeyOrKeypair,
} from '@marinade.finance/solana-cli-utils'
import { Keypair, PublicKey } from '@solana/web3.js'
import { Command } from 'commander'
import { useContext } from '../../context'
import { withCreateSimpleAccount } from '@marinade.finance/simple-admin-sdk'
import { executeTx } from '../utils'
import { TransactionEnvelope } from '@saberhq/solana-contrib'

export function installCreateRoot(program: Command) {
  program
    .command('create-simple-account')
    .description('Create a new account.')
    .option(
      '--address <pubkey_or_keypair>',
      'Keypair as address of the new root of simple admin, when not set a random address is generated ',
      parsePubkeyOrKeypair
    )
    .option('--admin <pubkey>', 'Admin of the account', parsePubkey)
    .option(
      '--rent-payer <keypair>',
      'Rent payer for the account creation (default: wallet keypair)',
      parseKeypair
    )
    .action(
      async ({
        address,
        admin,
        rentPayer,
      }: {
        address?: Promise<PublicKey | Keypair>
        admin?: Promise<PublicKey>
        rentPayer?: Promise<Keypair>
      }) => {
        await manageCreateSimpleAccount({
          admin: await admin,
          address: await address,
          rentPayer: await rentPayer,
        })
      }
    )
}

async function manageCreateSimpleAccount({
  address = Keypair.generate(),
  admin,
  rentPayer,
}: {
  address?: PublicKey | Keypair
  admin?: PublicKey
  rentPayer?: Keypair
}) {
  const { sdk, provider, logger } = useContext()

  const addressPubkey =
    address instanceof PublicKey ? address : address.publicKey

  const tx = new TransactionEnvelope(provider, [], [])
  if (address instanceof Keypair) {
    tx.addSigners(address)
  }
  if (rentPayer instanceof Keypair) {
    tx.addSigners(rentPayer)
  }
  await withCreateSimpleAccount(tx.instructions, {
    sdk,
    address: addressPubkey,
    admin,
    rentPayer: rentPayer?.publicKey,
  })

  await executeTx(
    tx,
    `'Failed to create simple admin account ${addressPubkey.toBase58()}`
  )
  logger.info(
    `Simple admin account ${addressPubkey.toBase58()} succesfully created`
  )
}
