use anchor_lang::prelude::*;
use anchor_spl::token::{self,Mint,Token,TokenAccount};
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::metadata::Metadata;
use bank::states::{DepositorState,BankState,VaultState};
use bank::constants::*;
use bank::program::Bank;

use crate::states::*;
use crate::constants::*;


#[derive(Accounts)]
pub struct InitializePlatformI<'info>{
    #[account(mut)]
    pub signer:Signer<'info>,
    #[account(
        init,
        payer = signer,
        space = 8 + PlatformState::INIT_SPACE,
        seeds = [PLATFORM],
        bump
    )]
    pub platform_acc:Account<'info,PlatformState>,
    #[account(
        init,
        payer = signer,
        mint::decimals=6,
        mint::authority=platform_acc,
        seeds=[PLATFORM_MINT],
        bump
    )]
    pub platform_mint:Account<'info,Mint>,
    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = platform_mint,
        associated_token::authority = platform_acc
    )]
    pub platform_token_account:Account<'info,TokenAccount>,
    pub system_program:Program<'info,System>,
    pub token_program:Program<'info,Token>,
    pub associated_token_program:Program<'info,AssociatedToken>,
    pub rent:Sysvar<'info,Rent>
}

#[derive(Accounts)]
pub struct CreateNFTI<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    /// CHECK: Metadata account for NFT creation
    #[account(
        mut,
        seeds = [b"metadata", token_metadata_program.key().as_ref(), token_mint.key().as_ref()],
        bump,
        seeds::program = token_metadata_program.key()
    )]
    pub metadata_account: UncheckedAccount<'info>,
    #[account(
        init,
        payer = signer,
        mint::decimals = 0,
        mint::authority = signer,
    )]
    pub token_mint: Account<'info, Mint>,
    #[account(
        init,
        payer = signer,
        associated_token::mint = token_mint,
        associated_token::authority = signer,
    )]
    pub token_account: Account<'info, TokenAccount>,
    pub rent: Sysvar<'info, Rent>,
    pub token_metadata_program: Program<'info, Metadata>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[derive(Accounts)]
pub struct DepositorCpiI<'info>{
    #[account(mut)]
    pub signer:Signer<'info>,
    #[account(mut,address=bank_acc.owner)]
    pub bank_owner:Signer<'info>,
    #[account(mut)]
    pub bank_acc:Account<'info,BankState>,
    pub mint:Account<'info,Mint>,
    #[account(mut,token::mint=mint,token::authority=signer.key())]
    pub from_token_account:Account<'info,TokenAccount>,
    ///CHECK:
    #[account(mut)]
    pub vault_acc:AccountInfo<'info>,
    ///CHECK:
    #[account(mut)]
    pub vault:AccountInfo<'info>,
    ///CHECK:
    #[account(mut)]
    pub depositor:AccountInfo<'info>,
    pub system_program:Program<'info,System>,
    pub token_program:Program<'info,Token>,
    pub bank_program:Program<'info,Bank>

}

#[derive(Accounts)]
#[instruction(loan_id:u128)]
pub struct BorrowLoanI<'info>{
    #[account(mut)]
    pub signer:Signer<'info>,
    #[account(mut)]
    pub platform_acc:Account<'info,PlatformState>,
    #[account(mut)]
    pub platform_owner:Signer<'info>,
    pub nft_collateral:Account<'info,Mint>,
    #[account(
        mut,
        token::mint=nft_collateral,
        token::authority=signer.key()
    )]
    pub nft_token_account:Account<'info,TokenAccount>,
    ///CHECK:
    #[account(
        mut
    )]
    pub nft_holder:AccountInfo<'info>,
    ///CHECK:
    #[account(
        mut
    )]
    pub vault_acc:AccountInfo<'info>,
    #[account(mut,address=bank_acc.owner)]
    pub bank_owner:Signer<'info>,
    #[account(mut)]
    pub bank_acc:Account<'info,BankState>,
    ///CHECK:
    #[account(mut)]
    pub borrower:AccountInfo<'info>,
    #[account(
        init,
        payer = platform_owner,
        space = 8 + LoanState::INIT_SPACE,
        seeds = [LOAN,loan_id.to_le_bytes().as_ref()],
        bump
    )]
    pub loan_acc:Account<'info,LoanState>,
    pub platform_mint:Account<'info,Mint>,
    #[account(mut)]
    pub platform_mint_token_account:Account<'info,TokenAccount>,
    #[account(
        init_if_needed,
        payer = platform_owner,
        associated_token::mint = platform_mint,
        associated_token::authority=signer,

    )]
    pub borrower_token_account:Account<'info,TokenAccount>,
    pub system_program:Program<'info,System>,
    pub token_program:Program<'info,Token>,
    pub bank_program:Program<'info,Bank>,
    pub associated_token_program:Program<'info,AssociatedToken>
}