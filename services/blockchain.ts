import {Connection, PublicKey} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  decodeInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import bs58 from "bs58";
import { SalesHistoryItem } from "@/utils/types.dt";

export const getTokenBalance = async (
  connection: Connection,
  mintPubKey: PublicKey, // token address of token on solana devnet
  recipientPubKey: PublicKey, // address of user we check the ata
) : Promise<number> => {
  const ata = await getAssociatedTokenAddress(
    mintPubKey,
    recipientPubKey,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  )

  const accountInfo = await connection.getAccountInfo(ata);
  if(!accountInfo) return 0

  const tokenAccountBalance = await connection.getTokenAccountBalance(ata);
  return tokenAccountBalance.value.uiAmount || 0
}

const fetchSalesHistory = async (connection: Connection, address: PublicKey) => {
  const signatures = await connection.getSignaturesForAddress(address, {limit: 5})

  const cluster = connection.rpcEndpoint.includes('devnet')
    ? 'devnet'
    : connection.rpcEndpoint.includes('testnet')
    ? 'testnet'
    : 'mainet'

  const transactions = await Promise.all(signatures.map(
    async (sig) =>
      await connection.getTransaction(sig.signature, {
        commitment: 'finalized',
        maxSupportedTransactionVersion: 0,
      })
  ))

  const salesDetails = transactions.map((tx: any)=> {
    const message: any = tx?.transaction.message
    const signatures = tx?.transaction.signatures || []
    const instructions = message.instructions
    const accounts = message.accountKeys

    const relevantInstruction = instructions.find(
      (instr: any)=>
        accounts[instr.programIdIndex].toString() === 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' &&
        ['mintTo', 'transfer'].includes(decodeInstructionType(instr.data))
    )

    if(relevantInstruction && signatures.length > 0) {
      const receiverIndex = relevantInstruction.accounts[1] // Assuming the receiver is the second account in the accounts array
      const receiver = accounts[receiverIndex].toString()
      const amount = decodeAmount(relevantInstruction.data)
      const transactionLink = `https://explorer.solana.com/tx/${signatures[0]}?cluster=${cluster}`
      const addressLink = `https://explorer.solana.com/address/${receiver}?cluster=${cluster}`

      return {
        receiver,
        amount: amount / 100,
        signature: signatures[0],
        transactionLink,
        addressLink
      }
    }

    return null
  })
    .filter((details: any) => details !== null) as SalesHistoryItem[]

  return salesDetails
}

function decodeInstructionType(data: string) : string {
  const decodedData = bs58.decode(data)
  const instructionTypeCode = decodedData[0]

  switch (instructionTypeCode) {
    case 3:
      return 'transfer'
    case 7:
      return 'mintTo'
    default:
      return 'unknown'
  }
}

function decodeAmount(data: string) : number {
  const decodedData = bs58.decode(data)
  const amount = new DataView(
    decodedData.buffer,
    decodedData.byteOffset,
    decodedData.byteLength
  ).getUint32(1, true)
  return amount;
}

export { fetchSalesHistory }
