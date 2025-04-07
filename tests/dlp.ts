import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Dlp } from "../target/types/dlp";
import { getOrCreateAssociatedTokenAccount, TOKEN_PROGRAM_ID } from "@solana/spl-token";

describe("dlp", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.dlp as Program<Dlp>;
  const tokenMetadataProgram = new anchor.web3.PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

  let mint:anchor.web3.Keypair;
  let metadataPda:anchor.web3.PublicKey;
  let tokenAccount:anchor.web3.PublicKey;

  before(async()=>{
    mint = anchor.web3.Keypair.generate();
    [metadataPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        tokenMetadataProgram.toBuffer(),
        mint.publicKey.toBuffer()
      ],tokenMetadataProgram
    );
    await program.provider.connection.confirmTransaction(
      await program.provider.connection.requestAirdrop(mint.publicKey,2e9)
    )
    // tokenAccount = (await getOrCreateAssociatedTokenAccount(program.provider.connection,signer,mint.publicKey,signer.publicKey,false,undefined,undefined)).address;
  });

  it("create NFT ", async () => {

    console.log("mint",mint.publicKey.toString());
    console.log("metadata pda",metadataPda.toString());
    const tx = await program.methods
                            .createNft("DogTok","DDT","https://raw.githubusercontent.com/Kavit-Patel/tmd_t/refs/heads/master/metadata.json?token=GHSAT0AAAAAADA4R7M5SFLODNLN5IJJZVN6Z7TP7DA",1)
                            .accounts({
                              signer:program.provider.wallet.publicKey,
                              metadataAccount:metadataPda,
                              tokenMint:mint.publicKey,
                              // tokenAccount,
                              rent:anchor.web3.SYSVAR_RENT_PUBKEY,
                              tokenMetadataProgram,
                              tokenProgram:TOKEN_PROGRAM_ID,
                              systemProgram:anchor.web3.SystemProgram.programId,
                            }as any)
                            .signers([program.provider.wallet.payer,mint])
                            .rpc()
    console.log("Your transaction signature", tx);
    console.log("Your transaction signature", mint.publicKey.toString());

  });
});
