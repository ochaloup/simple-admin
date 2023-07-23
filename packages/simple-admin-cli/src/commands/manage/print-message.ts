import { parsePubkeyOrKeypair } from '@marinade.finance/solana-cli-utils'
import { Keypair, PublicKey } from '@solana/web3.js'
import { Command } from 'commander'
import { useContext } from '../../context'
import { simpleAccount, withPrintMessage } from 'simple-admin-sdk'
import { executeTx } from '../utils'
import {
  TransactionEnvelope,
  TransactionReceipt,
} from '@saberhq/solana-contrib'

export function installPrintMessage(program: Command) {
  program
    .command('print-message')
    .description('Print a message when you are an admin.')
    .argument('address', 'Address of simple account ', parsePubkeyOrKeypair)
    .option(
      '--admin <keypair_or_pubkey>',
      'Admin of the account that provides the permission to print (default: wallet)',
      parsePubkeyOrKeypair
    )
    .requiredOption('--message <string>', 'Message to print')
    .option(
      '--rent-payer <keypair>',
      'Rent payer for print account creation',
      parsePubkeyOrKeypair
    )
    .action(
      async (
        address: Promise<PublicKey | Keypair>,
        {
          admin,
          message,
          rentPayer,
        }: {
          admin?: Promise<PublicKey | Keypair>
          message: string
          rentPayer?: Promise<PublicKey | Keypair>
        }
      ) => {
        await managePrintMessage({
          address: await address,
          admin: await admin,
          message,
          rentPayer: await rentPayer,
        })
      }
    )
}

async function managePrintMessage({
  address,
  admin,
  message,
  rentPayer,
}: {
  address: PublicKey | Keypair
  admin?: PublicKey | Keypair
  message: string
  rentPayer?: PublicKey | Keypair
}) {
  const { sdk, provider, logger } = useContext()

  address = address instanceof PublicKey ? address : address.publicKey
  const adminAddress =
    admin instanceof Keypair
      ? admin.publicKey
      : // when not set using wallet pubkey
        (admin || sdk.program.provider.publicKey)!
  const rentPayerAddress =
    rentPayer instanceof Keypair
      ? rentPayer.publicKey
      : (rentPayer || sdk.program.provider.publicKey)!

  const simpleAccountData = await simpleAccount({ sdk, address })
  if (!simpleAccountData) {
    throw new Error(`No simple account found at ${address.toBase58()}`)
  }
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
  if (rentPayer instanceof Keypair) {
    tx.addSigners(rentPayer)
  }
  await withPrintMessage(tx.instructions, {
    sdk,
    address,
    admin: adminAddress,
    message,
    rentPayer: rentPayerAddress,
  })

  const sig = await executeTx(
    tx,
    `'Failed to print message '${message}' at account ${address.toBase58()} with admin ${adminAddress.toBase58()}`
  )
  logger.info(
    `Message '${message}' successfully printed for account ${address.toBase58()}` +
      (sig instanceof TransactionReceipt
        ? ` with signature ${sig.signature}`
        : '')
  )
}
