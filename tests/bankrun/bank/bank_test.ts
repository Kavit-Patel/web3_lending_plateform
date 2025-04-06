import * as anchor from "@coral-xyz/anchor";
const BANK_IDL = require("../../../target/idl/bank.json")
import {Bank} from "../../../target/types/bank";
import { assert, expect } from "chai";
import { describe, test } from "@jest/globals"; 
import { BanksClient, startAnchor } from "solana-bankrun";
// import {createMint,createAccount,mintTo} from "@solana/spl-token";
import {createMint,createAccount,mintTo} from "spl-token-bankrun";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";
import { BankrunProvider } from "anchor-bankrun";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { getPda } from "../utils";
import { getTokenBalance, initializeBankAcc } from "./helper";
import { BN } from "bn.js";

describe("testing for bank ",()=>{
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
            {name:"bank",programId:new anchor.web3.PublicKey(BANK_IDL.address)}
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
    bank_program = new anchor.Program<Bank>(BANK_IDL,provider);

    let [bankPda]=await getPda([Buffer.from("BANK_ACC_STATE")],bank_program.programId);
    let [depositor1Pda]=await getPda([Buffer.from("DEPOSITOR"),depositor1.publicKey.toBuffer()],bank_program.programId);
  


    return {client,bankPda,depositor1Pda}

    }
    async function createMintAndTokenAccount(client,signer){
        const token = await createMint(client,signer,signer.publicKey,null,6);
        const tokenAccount = await createAccount(client,signer,token,signer.publicKey);
        await mintTo(client,signer,token,tokenAccount,signer,10000e6);

        // const token = await createMint(bank_program.provider.connection,payer,payer.publicKey,null,6);
        // const tokenAccount = await createAccount(bank_program.provider.connection,payer,token,payer.publicKey);

        return {token,tokenAccount};
    }


    test("initialize bank",async()=>{
        const {bankPda} =await setupTestEnvironment();
        await initializeBankAcc(bank_program,signer);

        const bankAcc = await bank_program.account.bankState.fetch(bankPda);
        assert(bankAcc.isInitialized,"Bank Account not initialized !");
        assert(bankAcc.owner.toBase58()==signer.publicKey.toBase58(),"Bank account owner mismatch !")
        
    })
    test("deposite to bank",async()=>{
        const {client,bankPda,depositor1Pda}=await setupTestEnvironment();
        await initializeBankAcc(bank_program,signer);
        const {token,tokenAccount} = await createMintAndTokenAccount(client,depositor1);
        const [vaultAccPda]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("VAULT"),token.toBuffer()],bank_program.programId);
        const [vaultPda]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("VAULT_HOLDER"),signer.publicKey.toBuffer(),token.toBuffer()],bank_program.programId);
        const balance = await getTokenBalance(client, tokenAccount);
        console.log("Balance:", balance.toString());
        const deposite_amount = 10e6
        await bank_program.methods
                          .deposite(new BN(deposite_amount))
                          .accounts({
                            signer:depositor1.publicKey,
                            bankOwner:signer.publicKey,
                            bankAcc:bankPda,
                            mint:token,
                            fromTokenAccount:tokenAccount,
                            vaultAcc:vaultAccPda,
                            depositeAcc:depositor1Pda
                          } as any)
                          .signers([depositor1,signer])
                          .rpc();

        let depositeAcc = await bank_program.account.depositorState.fetch(depositor1Pda);
        let vaultAccount = await bank_program.account.vaultState.fetch(vaultAccPda);
        const balance_after= await getTokenBalance(client, tokenAccount);
        const vault_balance= await getTokenBalance(client, vaultPda);
        console.log("deposited amount",Number(deposite_amount))
        console.log("vbalance",Number(vault_balance))
        assert(Number(balance)==(Number(balance_after)+Number(deposite_amount)),"Invalid balance transfer")
        assert(depositeAcc.isInitialized,"Depositor account not created !")
        assert(vaultAccount.isInitialized,"Vault account not created !")

    })
    test("withdraw from bank",async()=>{
        const {client,bankPda,depositor1Pda}=await setupTestEnvironment();
        await initializeBankAcc(bank_program,signer);
        const {token,tokenAccount} = await createMintAndTokenAccount(client,depositor1);
        const [vaultAccPda]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("VAULT"),token.toBuffer()],bank_program.programId);
        const [vaultPda]=anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("VAULT_HOLDER"),signer.publicKey.toBuffer(),token.toBuffer()],bank_program.programId);
        const balance = await getTokenBalance(client, tokenAccount);
        console.log("Balance:", balance.toString());
        const deposite_amount = 10e6
        await bank_program.methods
                          .deposite(new BN(deposite_amount))
                          .accounts({
                            signer:depositor1.publicKey,
                            bankOwner:signer.publicKey,
                            bankAcc:bankPda,
                            mint:token,
                            fromTokenAccount:tokenAccount,
                            vaultAcc:vaultAccPda,
                            depositeAcc:depositor1Pda
                          } as any)
                          .signers([depositor1,signer])
                          .rpc();
        const withdrawal_amount = new BN(5e6)
        const vault_balance_pre= await getTokenBalance(client, vaultPda);
        await bank_program.methods
                          .withdraw(withdrawal_amount)
                          .accounts({
                            bankAcc:bankPda,
                            bankOwner:signer.publicKey,
                            mint:token,
                            signer:depositor1.publicKey,
                            toAccount:tokenAccount,
                            vault:vaultPda,
                            vaultAcc:vaultAccPda,
                            withdrawerAcc:depositor1Pda,
                          })
                          .signers([depositor1])
                          .rpc();
        const vault_balance_post= await getTokenBalance(client, vaultPda);
        assert(Number(vault_balance_pre)==Number(vault_balance_post)+Number(withdrawal_amount));
    })
})