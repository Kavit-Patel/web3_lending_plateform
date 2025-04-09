import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Dlp } from "../target/types/dlp";
import { Bank } from "../target/types/bank";
import { createAccount, createInitializeAccountInstruction, createMint, getMinimumBalanceForRentExemptAccount, getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { BN } from "bn.js";
export const getPda = async(seeds:(Uint8Array<ArrayBufferLike> | Buffer<ArrayBufferLike>)[],programId: anchor.web3.PublicKey)=>anchor.web3.PublicKey.findProgramAddressSync(seeds, programId);
describe("dlp", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.dlp as Program<Dlp>;
  const bank_program = anchor.workspace.bank as Program<Bank>;
  const tokenMetadataProgram = new anchor.web3.PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

  let depositor1:anchor.web3.Keypair;
  let depositor2:anchor.web3.Keypair;

  let mint:anchor.web3.Keypair;
  let mint1:anchor.web3.Keypair;
  let mint1TokenAccount:anchor.web3.PublicKey;
  let metadataPda:anchor.web3.PublicKey;
  let tokenAccount:anchor.web3.PublicKey;
  let platformMintPda:anchor.web3.PublicKey;

  let bankPda:anchor.web3.PublicKey;
  let depositor1Pda:anchor.web3.PublicKey;
  let depositor1DlpPda:anchor.web3.PublicKey;
  let vaultHolderPda:anchor.web3.PublicKey;
  let vaultHolderDlpPda:anchor.web3.PublicKey;
  let vaultAccPda:anchor.web3.PublicKey;

  before(async()=>{
    depositor1 = anchor.web3.Keypair.generate()
    depositor2 = anchor.web3.Keypair.generate()

    await bank_program.provider.connection.confirmTransaction(
      await bank_program.provider.connection.requestAirdrop(depositor1.publicKey,100e9)
    )
    await bank_program.provider.connection.confirmTransaction(
      await bank_program.provider.connection.requestAirdrop(depositor2.publicKey,100e9)
    )
    mint = anchor.web3.Keypair.generate();
    mint1 = anchor.web3.Keypair.generate();
    [metadataPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        tokenMetadataProgram.toBuffer(),
        mint.publicKey.toBuffer()
      ],tokenMetadataProgram
    );
    await program.provider.connection.confirmTransaction(
      await program.provider.connection.requestAirdrop(mint.publicKey,2e9)
    );
    await createMint(bank_program.provider.connection,depositor1,depositor1.publicKey,null,6,mint1);
    mint1TokenAccount = await createAccount(bank_program.provider.connection,depositor1,mint1.publicKey,depositor1.publicKey);
    await mintTo(bank_program.provider.connection,depositor1,mint1.publicKey,mint1TokenAccount,depositor1.publicKey,1000e6);
    
    [platformMintPda]=anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("PLATFORM_MINT")
      ],
      program.programId
    )
    console.log("mint ",platformMintPda.toString());
    [bankPda]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("BANK_ACC_STATE")],bank_program.programId);
    [depositor1Pda]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("DEPOSITOR"),depositor1.publicKey.toBuffer()],bank_program.programId);
    [depositor1DlpPda]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("DEPOSITOR"),depositor1.publicKey.toBuffer()],program.programId);
    [vaultAccPda]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("VAULT"),mint1.publicKey.toBuffer()],bank_program.programId);
    [vaultHolderPda]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("VAULT_HOLDER"),bank_program.provider.wallet.publicKey.toBuffer(),mint1.publicKey.toBuffer()],bank_program.programId);
    [vaultHolderDlpPda]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("VAULT_HOLDER"),bank_program.provider.wallet.publicKey.toBuffer(),mint1.publicKey.toBuffer()],program.programId);
    // await mintTo(bank_program.provider.connection,bank_program.provider.wallet.payer,mint1.publicKey,vaultHolderPda,bank_program.provider.wallet.publicKey,1e6);
    // vaultHolderPda=(await getOrCreateAssociatedTokenAccount(bank_program.provider.connection,bank_program.provider.wallet.payer,mint1.publicKey,bank_program.provider.wallet.publicKey,true,undefined,undefined,bank_program.programId)).address;

  });
  it("initialize platform with mint ",async()=>{
    let tx = await program.methods
                  .initializePlatform(new BN(100000e6))
                  .accounts({
                  signer:program.provider.wallet.publicKey,
                  platformMint:platformMintPda,
                  }as any)
                  .signers([program.provider.wallet.payer])
                  .rpc();
    console.log("tx ",tx);
  })
  it("init bank",async()=>{
    const tx = await bank_program.methods
                                  .initializeBank()
                                  .accounts({
                                    signer:bank_program.provider.wallet.publicKey
                                  })
                                  .rpc()
    console.log("bank inited ", tx);
  })
  it("depo throug bank ",async()=>{
    console.log("MINT1",mint1.publicKey.toString())
    console.log("vault holder bank",vaultHolderPda.toString())
    console.log("vault holder dlp",vaultHolderDlpPda.toString())
    console.log("depositor bank",depositor1Pda.toString())
    console.log("depositor dlp",depositor1DlpPda.toString())
    console.log("depositor1",depositor1.publicKey.toString())
  //   const tx0 = await bank_program.methods
  //                                .deposite(new BN(10e6))
  //                                .accounts({
  //                                 bankAcc:bankPda,
  //                                 bankOwner:bank_program.provider.wallet.publicKey,
  //                                 fromTokenAccount:mint1TokenAccount,
  //                                 mint:mint1.publicKey,
  //                                 signer:depositor1.publicKey,
  //                                 vault:vaultHolderPda,
  //                                 depositor:depositor1Pda
  //                                }as any)
  //                                .signers([depositor1])
  //                                .rpc()
  //   console.log("deposited ",tx0)
  //  let depo_acc = await bank_program.account.depositorState.fetch(depositor1Pda);
  //  console.log("depo 1 init",depo_acc.isInitialized);
  //  console.log("depo 1 wallet",depo_acc.wallet.toString());
//   const lamports = await getMinimumBalanceForRentExemptAccount(bank_program.provider.connection);

// // Create raw account at PDA
// const createIx = anchor.web3.SystemProgram.createAccount({
//   fromPubkey: bank_program.provider.wallet.publicKey,
//   newAccountPubkey: vaultHolderPda,
//   lamports,
//   space: 165, // TokenAccount size
//   programId: TOKEN_PROGRAM_ID,
// });

// // Manually init token account
// const initIx = createInitializeAccountInstruction(
//   vaultHolderPda,
//   mint1.publicKey,
//   bankPda, // The authority is the bank state
//   TOKEN_PROGRAM_ID
// );

// const txt = new anchor.web3.Transaction().add(createIx, initIx);
// await anchor.web3.sendAndConfirmTransaction(
//   bank_program.provider.connection,
//   txt,
//   [bank_program.provider.wallet.payer], // signer
//   { commitment: "confirmed" }
// );
    const tx = await program.methods
                            .depositorCpi(new BN(1))
                            .accounts({
                              bankAcc:bankPda,
                              bankOwner:bank_program.provider.wallet.publicKey,
                              depositor:depositor1Pda,
                              fromTokenAccount:mint1TokenAccount,
                              mint:mint1.publicKey,
                              signer:depositor1.publicKey,
                              vaultAcc:vaultAccPda,
                              vault:vaultHolderPda,
                            }as any)
                            .signers([depositor1])
                            .rpc()
    console.log("deposite cpi ",tx);
  })
  // it("create NFT ", async () => {

  //   console.log("mint",mint.publicKey.toString());
  //   console.log("metadata pda",metadataPda.toString());
  //   const tx = await program.methods
  //                           .createNft("DogTok","DDT","https://raw.githubusercontent.com/Kavit-Patel/tmd_t/refs/heads/master/metadata.json?token=GHSAT0AAAAAADA4R7M5SFLODNLN5IJJZVN6Z7TP7DA",1)
  //                           .accounts({
  //                             signer:program.provider.wallet.publicKey,
  //                             metadataAccount:metadataPda,
  //                             tokenMint:mint.publicKey,
  //                             // tokenAccount,
  //                             rent:anchor.web3.SYSVAR_RENT_PUBKEY,
  //                             tokenMetadataProgram,
  //                             tokenProgram:TOKEN_PROGRAM_ID,
  //                             systemProgram:anchor.web3.SystemProgram.programId,
  //                           }as any)
  //                           .signers([program.provider.wallet.payer,mint])
  //                           .rpc()
  //   console.log("Your transaction signature", tx);
  //   console.log("Your transaction signature", mint.publicKey.toString());

  // });
});
