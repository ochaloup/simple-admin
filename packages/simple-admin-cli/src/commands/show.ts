import {
  parsePubkey,
  parsePubkeyOrKeypair,
} from '@marinade.finance/solana-cli-utils'
import { Keypair, PublicKey } from '@solana/web3.js'
import { Command } from 'commander'
import { useContext } from '../../context'
import { simpleAccount, withPrintAdmin } from 'simple-admin-sdk'
import { executeTx } from '../utils'
import { TransactionEnvelope } from '@saberhq/solana-contrib'

export function installShow(program: Command) {
  program
    .command('show')
    .description('Show account data content.')
    .argument('address', 'Address of simple account', parsePubkey)
    .action(
      async (
        address: Promise<PublicKey>,
      ) => {
        await manageShow({
          address: await address,
        })
      }
    )
}

async function manageShow({
  address,
}: {
  address: PublicKey
}) {
  const { sdk } = useContext()


  const data = await simpleAccount({
    sdk,
    address
  })

  console.log(data)
}
