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

const SimpleAdminIDL = generated.IDL
type SimpleAdminProgram = AnchorProgram<generated.SimpleAdmin>

export type SimpleAdmin = generated.SimpleAdmin
export type SimpleAccount = IdlAccounts<generated.SimpleAdmin>['simpleAccount']
export type PrintAccount = IdlAccounts<generated.SimpleAdmin>['printAccount']

export const DEFAULT_SIMPLE_ADMIN_PROGRAM_ID = JSON.parse(
  SimpleAdminIDL.constants.find(x => x.name === 'PROGRAM_ID')!.value
)
export const PRINT_MESSAGE_ACCOUNT_SEED = JSON.parse(
  SimpleAdminIDL.constants.find(x => x.name === 'PRINT_MESSAGE_ACCOUNT_SEED')!
    .value
)

export const CREATE_SIMPLE_ACCOUNT_EVENT = 'CreateSimpleAccountEvent'
export type CreateSimpleAccountEvent =
  IdlEvents<generated.SimpleAdmin>[typeof CREATE_SIMPLE_ACCOUNT_EVENT]
export const PRINT_MESSAGE_EVENT = 'PrintMessageEvent'
export type PrintMessageEvent =
  IdlEvents<generated.SimpleAdmin>[typeof PRINT_MESSAGE_EVENT]

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
    return new Program<SimpleAdmin>(SimpleAdminIDL, programId, provider)
  }
}
