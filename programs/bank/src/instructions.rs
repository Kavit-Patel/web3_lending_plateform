use anchor_lang::prelude::*;
use anchor_spl::token::{Mint,TokenAccount,Token};
use anchor_spl::associated_token::AssociatedToken;

use crate::constants::*;
use crate::states::*;



#[derive(Accounts)]
pub struct InitializeBankI<'info>{
    #[account(mut)]
    pub signer:Signer<'info>,
    #[account(
        init,
        payer = signer,
        space = 8 + BankState::INIT_SPACE,
        seeds = [BANK_ACC_STATE],
        bump
    )]
    pub banck_state_acc:Account<'info,BankState>,
    pub system_program:Program<'info,System>
}

#[derive(Accounts)]
pub struct DepositeI<'info>{
    #[account(mut)]
    pub signer:Signer<'info>,
    #[account(mut,address=bank_acc.owner)]
    pub bank_owner:Signer<'info>,
    #[account(mut)]
    pub bank_acc:Account<'info,BankState>,
    pub mint:Account<'info,Mint>,
    #[account(mut,token::mint=mint,token::authority=signer.key())]
    pub from_token_account:Account<'info,TokenAccount>,
    #[account(
        init_if_needed,
        payer = bank_owner,
        space = 8 + VaultState::INIT_SPACE,
        seeds = [VAULT,mint.key().as_ref()],
        bump
    )]
    pub vault_acc:Account<'info,VaultState>,
    #[account(
        init_if_needed,
        payer = bank_owner,
        token::mint = mint,
        token::authority = bank_acc,
        seeds=[VAULT_HOLDER,bank_owner.key().as_ref(),mint.key().as_ref()],
        bump        
    )]
    pub vault:Account<'info,TokenAccount>,
    #[account(
        init_if_needed,
        payer = bank_owner,
        space = 8 + DepositorState::INIT_SPACE,
        seeds = [DEPOSITOR,signer.key().as_ref()],
        bump
    )]
    pub depositor:Account<'info,DepositorState>,
    pub system_program:Program<'info,System>,
    pub token_program:Program<'info,Token>,
    
}

#[derive(Accounts)]
pub struct WithdrawI<'info>{
    #[account(mut)]
    pub signer:Signer<'info>,
    pub withdrawer_acc:Account<'info,DepositorState>,
    #[account(mut)]
    pub bank_acc:Account<'info,BankState>,
    ///CHECK:
    #[account(address=bank_acc.owner)]
    pub bank_owner:AccountInfo<'info>,
    pub mint:Account<'info,Mint>,
    #[account(mut)]
    pub vault_acc:Account<'info,VaultState>,
    #[account(mut,token::mint=mint,token::authority=bank_acc.key())]
    pub vault:Account<'info,TokenAccount>,
    #[account(mut,token::mint=mint,token::authority=signer.key())]
    pub to_account:Account<'info,TokenAccount>,
    pub token_program:Program<'info,Token>

}