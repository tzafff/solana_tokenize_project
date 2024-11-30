import React, { useState } from 'react'
import 'dotenv/config'
import {useConnection, useWallet} from "@solana/wallet-adapter-react";
import {Keypair, PublicKey} from "@solana/web3.js";
import address from "@/services/tokenMint.json";
import {buyToken} from "@/services/blockchain";

const BuyTokens = () => {
  const [amount, setAmount] = useState('')
  const [salesCost, setSalesCost] = useState(0.05)
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet();

  const TOKEN_OWNER = process.env.NEXT_PUBLIC_TOKEN_OWNER_KEY_PAIR
  const TOKEN_MINT_ADDRESS = new PublicKey(address.address) || '';

  // @ts-ignore
  const ownerArray = Uint8Array.from(TOKEN_OWNER.split(',').map(Number))
  const OWNER: Keypair = Keypair.fromSecretKey(ownerArray);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if(!connection || !publicKey) return console.log('Please install or connect your wallet!')
    if(!TOKEN_MINT_ADDRESS) return console.log('Please provide a TOKEN MINT ADDRESS!')
    if(!TOKEN_OWNER) return console.log('Please provide a TOKEN OWNER KEYPAIR')



    const tx = await buyToken(
      connection,
      TOKEN_MINT_ADDRESS,
      OWNER,
      publicKey,
      Number(amount),
      salesCost
    )

    const signature = await sendTransaction(tx, connection, {
      signers: [OWNER],
    })

    setAmount('')

    await connection.confirmTransaction(signature, 'finalized')

    console.log(signature);

  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="number"
        value={amount}
        min="0"
        placeholder={`E.g. 2 DMA token, (${salesCost} SOL per token)`}
        required
        onChange={(e) => setAmount(e.target.value)}
        className="mt-1 block w-full py-2 px-3 border border-gray-300
          rounded-md shadow-sm focus:outline-none focus:ring-orange-500
          focus:border-orange-500 sm:text-sm mb-4 "
      />
      <button
        type="submit"
        disabled={!amount || amount === '0' || !publicKey ||
          publicKey.toString() === OWNER.publicKey.toString()}
        className="w-full flex justify-center py-2 px-4 border
        border-transparent rounded-md shadow-sm text-sm font-medium
        text-white bg-orange-500 hover:bg-orange-700 focus:outline-none
        focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-orange-300"
      >
        Buy Tokens
      </button>
    </form>
  )
}

export default BuyTokens
