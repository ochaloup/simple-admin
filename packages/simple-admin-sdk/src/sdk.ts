import * as generated from '../generated/simple_admin'
import {
  Program as AnchorProgram,
  IdlAccounts,
  IdlEvents,
  Wallet as AnchorWallet,
  AnchorProvider,
  Program,
} from '@coral-xyz/anchor'
import { ConfirmOptions, Connection, Keypair, PublicKey } from '@solana/web3.js'
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet'

/**
 * simple admin contract SDK.
 *
 * Start by creating a new instance of the SimpleAdminSdk class.
 * It's required parameter for all operations.
 *
 * To get account addresses see ./accounts.ts
 * To read account data see ./api.ts
 * To execute particular contract operations see ./with*.ts
 */

const DirecteStakeIDL = generated.IDL
type SimpleAdminProgram = AnchorProgram<generated.SimpleAdmin>

export type SimpleAdmin = generated.SimpleAdmin
export type SimpleAdminRoot = IdlAccounts<generated.SimpleAdmin>['root']
export type SimpleAdminVoteRecord =
  IdlAccounts<generated.SimpleAdmin>['voteRecord']

export const DEFAULT_SIMPLE_ADMIN_PROGRAM_ID =
  'dstK1PDHNoKN9MdmftRzsEbXP5T1FTBiQBm1Ee3meVd'
export const DEFAULT_SIMPLE_ADMIN_ROOT =
  'DrooToPS3MLqgZwBiK2fkAPUTUgKNV3CGb2NqFRAL4Zf'
export const SIMPLE_ADMIN_SEED = 'stake-direction'

export const CREATE_ROOT_EVENT = 'CreateRootEvent'
export type CreateRootEvent =
  IdlEvents<generated.SimpleAdmin>[typeof CREATE_ROOT_EVENT]
export const CREATE_VOTE_RECORD_EVENT = 'CreateVoteRecordEvent'
export type CreateVoteRecordEvent =
  IdlEvents<generated.SimpleAdmin>[typeof CREATE_VOTE_RECORD_EVENT]
export const REMOVE_VOTE_RECORD_EVENT = 'RemoveVoteRecordEvent'
export type RemoveVoteRecordEvent =
  IdlEvents<generated.SimpleAdmin>[typeof REMOVE_VOTE_RECORD_EVENT]
export const UPDATE_VOTE_RECORD_EVENT = 'UpdateVoteRecordEvent'
export type UpdateVoteRecordEvent =
  IdlEvents<generated.SimpleAdmin>[typeof UPDATE_VOTE_RECORD_EVENT]

export type Wallet = AnchorWallet

export class SimpleAdminSdk {
  readonly program: SimpleAdminProgram
  constructor({
    programId = new PublicKey(DEFAULT_SIMPLE_ADMIN_PROGRAM_ID),
    connection,
    wallet,
    opts = {},
  }: {
    programId: PublicKey
    connection: Connection
    wallet: Wallet | Keypair
    opts?: ConfirmOptions
  }) {
    this.program = this.getProgram({ programId, connection, wallet, opts })
  }

  private getProgram({
    connection,
    wallet,
    opts,
    programId,
  }: {
    connection: Connection
    wallet: Wallet | Keypair
    opts: ConfirmOptions
    programId: PublicKey
  }): SimpleAdminProgram {
    if (wallet instanceof Keypair) {
      wallet = new NodeWallet(wallet)
    }
    const provider = new AnchorProvider(connection, wallet, opts)
    return new Program<SimpleAdmin>(DirecteStakeIDL, programId, provider)
  }
}
