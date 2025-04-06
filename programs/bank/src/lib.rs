use anchor_lang::prelude::*;
use anchor_spl::token::{transfer,Transfer};

pub mod constants;
pub mod instructions;
pub mod states;
pub mod implementations;
pub mod errors;

use instructions::*;
use errors::*;

declare_id!("46ZGHfPxd5JbtCbAnYUKXcHuoqkQQHDWQTcphxA5aeQM");

#[program]
pub mod bank {
    use super::*;

    pub fn initialize_bank(ctx: Context<InitializeBankI>) -> Result<()> {
        let bank_acc = &mut ctx.accounts.banck_state_acc;
        require!(!bank_acc.is_initialized,BankError::AlreadyInitializedBank);
        bank_acc.is_initialized = true;
        bank_acc.owner = ctx.accounts.signer.key();
        bank_acc.bump = ctx.bumps.banck_state_acc;
        Ok(())
    }
    pub fn deposite(ctx:Context<DepositeI>,amount:u64)->Result<()>{
        let vault_acc = &mut ctx.accounts.vault_acc;
        let depositor = &mut ctx.accounts.depositor;
        if !vault_acc.is_initialized {
            vault_acc.is_initialized = true;
            vault_acc.owner = ctx.accounts.bank_owner.key();
            vault_acc.bump = ctx.bumps.vault_acc;
        }
        if !depositor.is_initialized {
            depositor.is_initialized = true;
            depositor.bump = ctx.bumps.depositor;
            depositor.wallet = ctx.accounts.signer.key();
        };

        vault_acc.amount += amount;

        ctx.accounts.transfer_to_vault(amount)?;


        Ok(())
    }
    pub fn withdraw(ctx:Context<WithdrawI>,amount:u64)->Result<()>{
        let withdrawer_acc =&ctx.accounts.withdrawer_acc;
        let vault_acc = & ctx.accounts.vault_acc;
        require!(withdrawer_acc.wallet==ctx.accounts.signer.key(),BankError::InvalidWithdrawer);
        require!(amount<=vault_acc.amount,BankError::InvalidAmount);
        
        ctx.accounts.transfer_from_vault(amount)?;
        let vault_acc = &mut ctx.accounts.vault_acc;
        vault_acc.amount-=amount;

        Ok(())
    }
}
