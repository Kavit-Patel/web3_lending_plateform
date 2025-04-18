import * as anchor from "@coral-xyz/anchor";
const DLP_IDL = require("../../../target/idl/dlp.json")
import {Dlp} from "../../../target/types/dlp";
const BANK_IDL = require("../../../target/idl/bank.json")
import {Bank} from "../../../target/types/bank";
import { assert, expect } from "chai";
import { describe, test } from "@jest/globals"; 
import { BanksClient, startAnchor } from "solana-bankrun";
import {createMint,createAccount,mintTo,getAccount} from "spl-token-bankrun";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";
import { BankrunProvider } from "anchor-bankrun";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { getPda } from "../utils";
import { getTokenBalance, initializeBankAcc, initializeDlp } from "./helper";
import { BN } from "bn.js";
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount, TOKEN_PROGRAM_ID } from "@solana/spl-token";

describe("testing for bank ",()=>{
    let dlp_program:anchor.Program<Dlp>;
    let bank_program:anchor.Program<Bank>;
    let provider:BankrunProvider;
    let client;
    const signer = anchor.web3.Keypair.fromSecretKey(
        new Uint8Array([
            228, 41, 208, 178, 129, 176, 100, 211, 72, 42, 72, 184, 19, 96, 163, 204,
            71, 2, 98, 220, 229, 50, 140, 247, 194, 96, 49, 130, 225, 114, 65, 187,
            108, 56, 51, 27, 198, 230, 36, 197, 197, 233, 93, 216, 17, 125, 30, 95,
            174, 1, 168, 20, 181, 153, 129, 180, 31, 196, 9, 45, 233, 78, 101, 175,
        ])
    );

    const fake_signer = anchor.web3.Keypair.fromSecretKey(
        new Uint8Array([
            108, 196, 167, 250, 213, 76, 217, 9, 118, 218, 158, 245, 106, 29, 255,
            123, 44, 85, 229, 57, 1, 184, 88, 186, 199, 137, 153, 251, 138, 101,
            241, 109, 79, 180, 214, 181, 239, 249, 222, 3, 49, 242, 25, 252, 143,
            65, 12, 185, 206, 106, 213, 153, 64, 228, 101, 99, 128, 155, 34, 152,
            181, 82, 151, 18,
        ])
    );

    const depositor1 = anchor.web3.Keypair.fromSecretKey(
        new Uint8Array([
            17, 165, 27, 234, 245, 1, 158, 6, 7, 129, 16,
            159, 247, 180, 162, 136, 132, 164, 4, 73, 209, 210,
            165, 171, 242, 55, 86, 201, 152, 147, 174, 66, 202,
            217, 143, 3, 87, 217, 195, 42, 207, 254, 68, 183,
            170, 202, 67, 221, 244, 233, 79, 155, 218, 15, 172,
            107, 114, 242, 218, 127, 167, 95, 118, 51
        ])
    );

    const depositor2 = anchor.web3.Keypair.fromSecretKey(
        new Uint8Array([
            247, 205, 133, 147, 175, 181, 134, 92, 35, 209, 156,
            18, 161, 248, 68, 194, 101, 88, 4, 163, 250, 206,
            102, 55, 213, 51, 18, 237, 218, 77, 176, 61, 239,
            198, 115, 188, 251, 5, 170, 30, 105, 84, 111, 244,
            193, 94, 97, 198, 35, 30, 212, 237, 108, 241, 59,
            40, 98, 87, 111, 198, 205, 137, 252, 67
        ])
    );

    const depositor3 = anchor.web3.Keypair.fromSecretKey(
        new Uint8Array([
            239, 200, 134, 210, 240, 11, 96, 48, 143, 49, 140,
            152, 48, 239, 13, 221, 198, 15, 79, 106, 76, 234,
            175, 27, 147, 234, 76, 185, 134, 103, 168, 236, 219,
            181, 78, 178, 65, 163, 96, 184, 129, 184, 215, 231,
            91, 221, 246, 104, 137, 64, 252, 40, 25, 123, 217,
            115, 161, 197, 47, 122, 56, 192, 155, 77
        ])
    );

    async function setupTestEnvironment(){
        const context = await startAnchor("",[
            {name:"dlp",programId:new anchor.web3.PublicKey(DLP_IDL.address)}
        ],[
            {address:signer.publicKey,info:{lamports:100e9,data:Buffer.alloc(0),owner:SYSTEM_PROGRAM_ID,executable:false}},
            {address:fake_signer.publicKey,info:{lamports:100e9,data:Buffer.alloc(0),owner:SYSTEM_PROGRAM_ID,executable:false}},
            {address:depositor1.publicKey,info:{lamports:100e9,data:Buffer.alloc(0),owner:SYSTEM_PROGRAM_ID,executable:false}},
            {address:depositor2.publicKey,info:{lamports:100e9,data:Buffer.alloc(0),owner:SYSTEM_PROGRAM_ID,executable:false}},
            {address:depositor3.publicKey,info:{lamports:100e9,data:Buffer.alloc(0),owner:SYSTEM_PROGRAM_ID,executable:false}},
        ]
    );

    client = context.banksClient;
    provider = new BankrunProvider(context);
    provider.wallet = new NodeWallet(signer);
    anchor.setProvider(provider);
    dlp_program = new anchor.Program<Dlp>(DLP_IDL,provider);
    bank_program = new anchor.Program<Bank>(BANK_IDL,provider);


    let [bankPda]=await getPda([Buffer.from("BANK_ACC_STATE")],bank_program.programId);
    let [depositor1Pda]=await getPda([Buffer.from("DEPOSITOR"),depositor1.publicKey.toBuffer()],bank_program.programId);
    // let [platformPda]=await getPda([Buffer.from("PLATFORM")],dlp_program.programId);
    // let [vaultAccPdad]=await getPda([Buffer.from("VAULT")],dlp_program.programId);
    // console.log("vault ",vaultAccPda.toString())
    // console.log("vault dlp ",vaultAccPdad.toString())
    let [platformMintPda]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("PLATFORM_MINT")], dlp_program.programId);
    let [loanPda]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("LOAN"),new BN(1).toBuffer("le",16)], dlp_program.programId);
    // let [depositor1Pda]=await getPda([Buffer.from("DEPOSITOR"),depositor1.publicKey.toBuffer()],dlp_program.programId);
  
    const [platformPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("PLATFORM")],
        dlp_program.programId
      );
      const platformTokenAccount = anchor.utils.token.associatedAddress({
        mint: platformMintPda,
        owner: platformPda
      });

    return {client,platformTokenAccount,platformPda,platformMintPda,bankPda,depositor1Pda,loanPda}

    }
    async function createMintAndTokenAccount(client,signer){
        const token = await createMint(client,signer,signer.publicKey,null,6);
        const tokenAccount = await createAccount(client,signer,token,signer.publicKey);
        await mintTo(client,signer,token,tokenAccount,signer,10000e6);

        return {token,tokenAccount};
    }

    test("Initialize Plateform",async()=>{
        const {platformPda,platformMintPda} = await setupTestEnvironment();
        const tx = await initializeDlp(dlp_program,signer,platformMintPda);

        const platform_acc = await dlp_program.account.platformState.fetch(platformPda);
          const platformTokenAccountAddress = await getOrCreateAssociatedTokenAccount(dlp_program.provider.connection,signer,platformMintPda,platformPda,true);
          const tokenAccount = await getAccount(client, platformTokenAccountAddress.address);
          console.log("platform token mint amount  ", tokenAccount.amount);
          
        console.log("platform TX  ",tx);
        console.log("platform inited ",platform_acc.isInitialized);
        console.log("platform inited ",platform_acc.isInitialized);
        console.log("platform owner",platform_acc.owner.toString());
        console.log("platform current mint amount",platform_acc.currentMintAmount.toString());
        console.log("platform mint",platform_acc.platformMint.mint.toString());
        console.log("platform total supply",platform_acc.platformMint.totalSupply.toString());
    })
    // test("deposit cpi ",async()=>{

    //     const {bankPda,depositor1Pda}=await setupTestEnvironment()
    //     await initializeBankAcc(bank_program,signer)
    //     const {token,tokenAccount}=await createMintAndTokenAccount(client,depositor1)

    //     let [vaultAccPda]=await getPda([Buffer.from("VAULT"),token.toBuffer()],bank_program.programId);
    //     let [vaultHolderPda]=await getPda([Buffer.from("VAULT_HOLDER"),signer.publicKey.toBuffer(),token.toBuffer()],bank_program.programId);
    //     const tx = await dlp_program.methods
    //                                 .depositorCpi(new BN(1))
    //                                 .accounts({
    //                                     signer:depositor1.publicKey,
    //                                     bankOwner:signer.publicKey,
    //                                     bankAcc:bankPda,
    //                                     mint:token,
    //                                     fromTokenAccount:tokenAccount,
    //                                     depositor:depositor1Pda,
    //                                     vault:vaultHolderPda,
    //                                     vaultAcc:vaultAccPda,
    //                                 })
    //                                 .signers([depositor1])
    //                                 .rpc()
    //     console.log("tx deposited cpi ",tx)
    // })
    test("borrow loan ",async()=>{

        const {bankPda,platformTokenAccount,depositor1Pda,platformPda,platformMintPda,loanPda}=await setupTestEnvironment()
        await initializeBankAcc(bank_program,signer)
        await initializeDlp(dlp_program,signer,platformMintPda)
        const {token,tokenAccount}=await createMintAndTokenAccount(client,depositor1)
        const borrowerTokenAccount = await createAccount(client,signer,platformMintPda,depositor1.publicKey);

        let [vaultAccPda]=await getPda([Buffer.from("VAULT"),token.toBuffer()],bank_program.programId);
        let [vaultHolderPda]=await getPda([Buffer.from("VAULT_HOLDER"),signer.publicKey.toBuffer(),token.toBuffer()],bank_program.programId);
        console.log("platformowner & signer",signer.publicKey.toBase58())
        console.log("platform mint  pda",platformMintPda.toBase58())
        console.log("platform acc ",platformPda.toBase58())
        console.log("depo1 ",depositor1.publicKey.toBase58())
        const tx = await dlp_program.methods
                                    .borrowLoan(new BN(1),new BN(100))
                                    .accounts({
                                        signer:depositor1.publicKey,
                                        platformAcc:platformPda,
                                        platformOwner:signer.publicKey,
                                        nftCollateral:token,
                                        nftTokenAccount:tokenAccount,
                                        nftHolder:vaultHolderPda,
                                        vaultAcc:vaultAccPda,
                                        bankOwner:signer.publicKey,
                                        bankAcc:bankPda,
                                        borrower:depositor1Pda,
                                        platformMint:platformMintPda,
                                        borrowerTokenAccount:borrowerTokenAccount,
                                        platformMintTokenAccount:platformTokenAccount,
                                        systemprogram:SYSTEM_PROGRAM_ID,
                                        tokenProgram:TOKEN_PROGRAM_ID,
                                        bankProgram:bank_program.programId,
                                        associatedTokenProgram:ASSOCIATED_TOKEN_PROGRAM_ID
                                        
                                    } as any)
                                    .signers([depositor1,signer])
                                    .rpc().catch(e=>console.log("Error :",e))
        console.log("tx borrow loan cpi ",tx)
        const loan_acc = await dlp_program.account.loanState.fetch(loanPda);
        console.log("loan amount",loan_acc.borrowedAmount.toString())
        console.log("loan borrower",loan_acc.borrower.toString())
        console.log("loan colletral",loan_acc.collateral.toString())
        console.log("loan interest",loan_acc.interest.toString())
        console.log("loan loanid",loan_acc.loanId.toString())
        console.log("loan start time",loan_acc.startTime.toString())
        console.log("loan end time",loan_acc.endTime.toString())
        console.log("loan amount with interest ",loan_acc.amountWithInterest.toString())
        const borrowerTA = await getAccount(client, borrowerTokenAccount);
        console.log("Borrower token mint amount  ", borrowerTA.amount);
    })
    
})