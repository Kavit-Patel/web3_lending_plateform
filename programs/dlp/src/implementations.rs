use anchor_lang::prelude::*;
use anchor_spl::token::{self,MintTo,mint_to,Transfer,transfer};

use crate::instructions::*;
use crate::constants::*;

use bank::cpi::accounts::DepositeI;



impl<'info>InitializePlatformI<'info>{
    pub fn create_platform_mint(&self,total_supply:u64)->Result<()>{
        let cpi_program = self.token_program.to_account_info();
        let signer_seeds:&[&[&[u8]]]=&[&[PLATFORM,&[self.platform_acc.bump]]];
        let cpi_accounts = MintTo{
            mint:self.platform_mint.to_account_info(),
            to:self.platform_token_account.to_account_info(),
            authority:self.platform_acc.to_account_info()
        };
        let cpi_ctx = CpiContext::new(cpi_program,cpi_accounts).with_signer(signer_seeds);
        mint_to(cpi_ctx, total_supply)?;
        Ok(())
    }
}
impl<'info>BorrowLoanI<'info>{
    pub fn borrow_loan(&self)->CpiContext<'_,'_,'_,'info,DepositeI<'info>>{
        let cpi_program=self.bank_program.to_account_info();
        let cpi_accounts = DepositeI {
            signer:self.signer.to_account_info(),
            bank_owner:self.bank_owner.to_account_info(),
            bank_acc:self.bank_acc.to_account_info(),
            mint:self.nft_collateral.to_account_info(),
            from_token_account:self.nft_token_account.to_account_info(),
            vault_acc:self.vault_acc.to_account_info(),
            vault:self.nft_holder.to_account_info(),
            depositor:self.borrower.to_account_info(),
            system_program:self.system_program.to_account_info(),
            token_program:self.token_program.to_account_info()
        };
        CpiContext::new(cpi_program,cpi_accounts)
    }
    pub fn transfer_to_borrower(&self,loan_amount:u64)->Result<()>{

        let cpi_program = self.token_program.to_account_info();
        let signer_seeds:&[&[&[u8]]]=&[&[b"PLATFORM",&[self.platform_acc.bump]]];
        let cpi_accounts = Transfer{
            from:self.platform_mint_token_account.to_account_info(),
            to:self.borrower_token_account.to_account_info(),
            authority:self.platform_acc.to_account_info()
        };
        let cpi_ctx = CpiContext::new(cpi_program,cpi_accounts).with_signer(signer_seeds);
        transfer(cpi_ctx,loan_amount)?;
        Ok(())
    }
}