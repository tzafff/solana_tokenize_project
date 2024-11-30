import Balance from '@/components/Balance'
import BuyTokens from '@/components/BuyTokens'
import Header from '@/components/Header'
import MintHistory from '@/components/MintHistory'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import address from '@/services/tokenMint.json'
import {fetchSalesHistory, getTokenBalance} from "@/services/blockchain";
import {useConnection, useWallet} from "@solana/wallet-adapter-react";
import {PublicKey} from "@solana/web3.js";
import {SalesHistoryItem} from "@/utils/types.dt";
import Skeleton from "react-loading-skeleton";

export default function Home() {

  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const TOKEN_MINT_ADDRESS = new PublicKey(address.address) || '';

  const [isLoading, setIsLoading] = useState(true)
  const [balance, setBalance] = useState(0)
  const [mintHistory, setMintHistory] = useState<SalesHistoryItem[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const history: any = await fetchSalesHistory(connection, TOKEN_MINT_ADDRESS)
    setMintHistory(history)

    if(publicKey) {
      const balance = await getTokenBalance(connection, TOKEN_MINT_ADDRESS, publicKey)
      setBalance(balance)
    }
    setIsLoading(false)
  }

  return (
    <>
      <Head>
        <title>Tokenize</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="h-screen bg-gray-100">
        <Header />

        <div className="h-[100px]" />

        <main className="max-w-lg mx-auto p-4 space-y-4">
          <BuyTokens />
          {isLoading ? <Skeleton height={70} className={"mb-2"} /> : <Balance balance={balance} /> }
          {isLoading ? <Skeleton height={5} /> : <MintHistory mintHistory={mintHistory} /> }
        </main>
      </div>
    </>
  )
}
