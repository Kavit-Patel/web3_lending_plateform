import { web3 } from "@coral-xyz/anchor";

export const getPda = async(seeds:(Uint8Array<ArrayBufferLike> | Buffer<ArrayBufferLike>)[],programId: web3.PublicKey)=>web3.PublicKey.findProgramAddressSync(seeds, programId);