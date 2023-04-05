import {
  parsePubkey,
  parsePubkeyOrKeypair,
} from '@marinade.finance/solana-cli-utils'
import { Keypair, PublicKey } from '@solana/web3.js'
import { Command } from 'commander'
import { useContext } from '../../context'
import { withPrintAdmin } from 'simple-admin-sdk'
import { executeTx } from '../utils'
import { TransactionEnvelope } from '@saberhq/solana-contrib'

export function installPrintAdmin(program: Command) {
  program
    .command('print-admin')
    .description('Print a message when you are an admin.')
    .argument('address', 'Address of simple account', parsePubkey)
    .requiredOption(
      '--admin <keypair_or_pubkey>',
      'Admin of the account that provides the permission to print',
      parsePubkeyOrKeypair
    )
    .requiredOption('--message <string>', 'Message to print')
    .action(
      async (
        address: Promise<PublicKey>,
        {
          admin,
          message,
        }: {
          admin: Promise<PublicKey | Keypair>
          message: string
        }
      ) => {
        await managePrintAdmin({
          address: await address,
          admin: await admin,
          message,
        })
      }
    )
}

async function managePrintAdmin({
  address,
  admin,
  message,
}: {
  address: PublicKey
  admin: PublicKey | Keypair
  message: string
}) {
  const { sdk, provider, logger } = useContext()
  console.log('admin', admin)
  const adminAddress = admin instanceof PublicKey ? admin : admin.publicKey

  const tx = new TransactionEnvelope(provider, [], [])
  if (admin instanceof Keypair) {
    tx.addSigners(admin)
  }
  await withPrintAdmin(tx.instructions, {
    sdk,
    address,
    admin: adminAddress,
    message,
  })

  await executeTx(
    tx,
    `'Failed to print ${message} at chain at account ${address.toBase58()} with admin ${adminAddress.toBase58()}`
  )
  logger.info(
    `Message ${message} succesfully printed for account ${address.toBase58()}`
  )
}
