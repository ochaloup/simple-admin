import {
  TransactionEnvelope,
  TransactionReceipt,
} from '@saberhq/solana-contrib'
import { serializeInstructionToBase64 } from '@marinade.finance/spl-governance'
import {
  SendTransactionError,
  SimulatedTransactionResponse,
} from '@solana/web3.js'
import { useContext } from '../context'
import { CliCommandError } from './error'

export async function executeTx(
  tx: TransactionEnvelope,
  errMessage: string
): Promise<Array<TransactionReceipt | SimulatedTransactionResponse>> {
  const { logger, command, simulate, printOnly } = useContext()
  const receipts: Array<TransactionReceipt | SimulatedTransactionResponse> = []

  if (printOnly) {
    console.log('Instructions:')
    for (const ix of tx.instructions) {
      console.log('  ' + serializeInstructionToBase64(ix))
    }
  }

  try {
    for (const part of tx.partition()) {
      if (simulate) {
        logger.warn('[[Simulation mode]]')
        const result = await part.simulate()
        logger.debug(result)
        if (result.value.err) {
          throw new SendTransactionError(
            result.value.err as string,
            result.value.logs || undefined
          )
        }
        receipts.push(result.value)
      } else if (!printOnly) {
        const result = await part.confirm({ printLogs: true })
        receipts.push(result)
        logger.debug(`tx: ${result.signature}`)
        logger.debug(result.response.meta?.logMessages)
      }
    }
  } catch (e) {
    throw new CliCommandError({
      commandName: command,
      errMessage,
      cause: e as Error,
      logs: e instanceof SendTransactionError ? e.logs : undefined,
      txDebugStr: tx.debugStr,
    })
  }
  return receipts
}
