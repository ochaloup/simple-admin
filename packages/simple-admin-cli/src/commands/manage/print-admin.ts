import {
  parsePubkeyOrKeypair,
} from '@marinade.finance/solana-cli-utils'
import { Keypair, PublicKey } from '@solana/web3.js'
import { Command } from 'commander'
import { useContext } from '../../context'
import { simpleAccount, withPrintAdmin } from 'simple-admin-sdk'
import { executeTx } from '../utils'
import {
  TransactionEnvelope,
  TransactionReceipt,
} from '@saberhq/solana-contrib'

export function installPrintAdmin(program: Command) {
  program
    .command('print-admin')
    .description('Print a message when you are an admin.')
    .argument('address', 'Address of simple account ', parsePubkeyOrKeypair)
    .requiredOption(
      '--admin <keypair_or_pubkey>',
      'Admin of the account that provides the permission to print',
      parsePubkeyOrKeypair
    )
    .requiredOption('--message <string>', 'Message to print')
    .action(
      async (
        address: Promise<PublicKey | Keypair>,
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
  address: PublicKey | Keypair
  admin: PublicKey | Keypair
  message: string
}) {
  const { sdk, provider, logger } = useContext()

  address = address instanceof PublicKey ? address : address.publicKey
  const adminAddress = admin instanceof PublicKey ? admin : admin.publicKey

  const simpleAccountData = await simpleAccount({ sdk, address })
  if (!simpleAccountData.admin.equals(adminAddress)) {
    throw new Error(
      `Admin ${adminAddress.toBase58()} is not an admin of simple account ${address.toBase58()} ` +
        `(admin is ${simpleAccountData.admin.toBase58()})`
    )
  }

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

  const sig = await executeTx(
    tx,
    `'Failed to print message '${message}' at account ${address.toBase58()} with admin ${adminAddress.toBase58()}`
  )
  logger.info(
    `Message '${message}' succesfully printed for account ${address.toBase58()}` +
      (sig instanceof TransactionReceipt
        ? ` with signature ${sig.signature}`
        : '')
  )
}
