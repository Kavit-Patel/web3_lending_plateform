import * as anchor from "@coral-xyz/anchor";
import { Bank } from "../../../target/types/bank";
import { BanksClient } from "solana-bankrun";
import { AccountLayout } from "@solana/spl-token";
import { BN } from "bn.js";


export async function getTokenBalance(client: BanksClient, tokenAccount: anchor.web3.PublicKey): Promise<anchor.BN> {
    const accInfo = await client.getAccount(tokenAccount);
    if (!accInfo) throw new Error("Token account not found");
    const data = AccountLayout.decode(accInfo.data);
    return new BN(data.amount.toString());
  }

export const initializeBankAcc = async(program:anchor.Program<Bank>,signer:anchor.web3.Keypair)=> await program.methods
                                                                                    .initializeBank()
                                                                                    .accounts({
                                                                                        signer:signer.publicKey,
                                                                                    })
                                                                                    .signers([signer])
                                                                                    .rpc();
