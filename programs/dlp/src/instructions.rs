use anchor_lang::prelude::*;
use anchor_spl::token::{self,Mint,Token,TokenAccount};
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::metadata::Metadata;

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
    pub system_program:Program<'info,System>
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