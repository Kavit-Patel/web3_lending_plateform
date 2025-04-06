use anchor_lang::prelude::*;
use anchor_spl::token::{Transfer,transfer};
use crate::instructions::*;
use crate::constants::*;



impl<'info>DepositeI<'info>{
    pub fn transfer_to_vault(&self,amount:u64)->Result<()>{
        let cpi_program = self.token_program.to_account_info();
        let cpi_accounts = Transfer{
            from:self.from_token_account.to_account_info(),
            to:self.vault.to_account_info(),
            authority:self.signer.to_account_info()
        };
        let cpi_ctx = CpiContext::new(cpi_program,cpi_accounts);
        transfer(cpi_ctx, amount)?;
        Ok(())
    }
}

impl<'info>WithdrawI<'info>{
    pub fn transfer_from_vault(&self,amount:u64)->Result<()>{
        let cpi_program = self.token_program.to_account_info();
        let signer_seeds:&[&[&[u8]]]=&[&[BANK_ACC_STATE,&[self.bank_acc.bump]]];
        let cpi_accounts = Transfer{
            from:self.vault.to_account_info(),
            to:self.to_account.to_account_info(),
            authority:self.bank_acc.to_account_info()
        };
        let cpi_ctx = CpiContext::new(cpi_program,cpi_accounts).with_signer(signer_seeds);
        transfer(cpi_ctx,amount);
        Ok(())
    }
}