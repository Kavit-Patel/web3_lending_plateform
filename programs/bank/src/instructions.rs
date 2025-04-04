use anchor_lang::prelude::*;
use anchor_spl::token::{Mint,TokenAccount,Token};

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
    pub vault:Account<'info,VaultState>,
    #[account(
        init_if_needed,
        payer = bank_owner,
        space = 8 + DepositorState::INIT_SPACE,
        seeds = [DEPOSITOR,signer.key().as_ref()],
        bump
    )]
    pub depositor:Account<'info,DepositorState>,
    pub system_program:Program<'info,System>,
    pub token_program:Program<'info,Token>
    
}