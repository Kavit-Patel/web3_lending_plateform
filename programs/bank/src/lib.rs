use anchor_lang::prelude::*;

pub mod constants;
pub mod instructions;
pub mod states;
pub mod implementations;

use constants::*;
use instructions::*;
use states::*;
use implementations::*;

declare_id!("46ZGHfPxd5JbtCbAnYUKXcHuoqkQQHDWQTcphxA5aeQM");

#[program]
pub mod bank {
    use super::*;

    pub fn initialize_bank(ctx: Context<InitializeBankI>) -> Result<()> {
        let bank_acc = &mut ctx.accounts.banck_state_acc;
        bank_acc.owner = ctx.accounts.signer.key();
        bank_acc.bump = ctx.bumps.banck_state_acc;
        Ok(())
    }
    pub fn deposite(ctx:Context<DepositeI>,amount:u64)->Result<()>{
        let vault = &mut ctx.accounts.vault;
        let depositor = &mut ctx.accounts.depositor;
        if !vault.is_initialize {
            vault.is_initialize = true;
            vault.owner = ctx.accounts.bank_owner.key();
            vault.bump = ctx.bumps.vault;
        }
        if !depositor.is_initialized {
            depositor.is_initialized = true;
            depositor.bump = ctx.bumps.depositor;
            depositor.wallet = ctx.accounts.signer.key();
        };

        vault.amount +=amount;
        
        ctx.accounts.transfer_to_vault(amount)?;


        Ok(())
    }
}
