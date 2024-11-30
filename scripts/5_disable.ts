import {checkOwner, getTokenAddress, OWNER} from "@/scripts/reuse";
import {clusterApiUrl, Connection, Keypair, PublicKey} from "@solana/web3.js";
import {AuthorityType, setAuthority} from "@solana/spl-token";


checkOwner();

const connection = new Connection((clusterApiUrl('devnet')))

const disableMintAuthority = async(tokenMint: PublicKey, OWNER: Keypair) => {
  const signature = await setAuthority(
    connection,
    OWNER,
    tokenMint,
    OWNER.publicKey,
    AuthorityType.MintTokens,
    null
  )

  console.log(`✅ Finished! Set mint authority: ${signature}`)
}

const main = async () => {
  const tokenMint = getTokenAddress()
  await disableMintAuthority(tokenMint, OWNER)
  console.log(`✅ Mint Authority disabled!`)
}

main()
