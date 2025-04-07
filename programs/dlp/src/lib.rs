use anchor_lang::prelude::*;
use anchor_spl::token;
use anchor_spl::metadata::{
    CreateMetadataAccountsV3,
    create_metadata_accounts_v3,
    mpl_token_metadata::types::DataV2,
    Metadata
};

pub mod constants;
pub mod errors;
pub mod events;
pub mod instructions;
pub mod states;

use constants::*;
use errors::*;
use events::*;
use instructions::*;
use states::*;

declare_id!("G7uEs9veqxboMC7kCwpnduLq57GnhKD2T1t3SqbgafQR");

#[program]
pub mod dlp {
    use super::*;

    pub fn initialize_platform(ctx: Context<InitializePlatformI>) -> Result<()> {
        let platform_acc = &mut ctx.accounts.platform_acc;
        require!(!platform_acc.is_initialized,PlatformError::AlreadyInitializedPlatform);
        platform_acc.is_initialized=true;
        platform_acc.owner = ctx.accounts.signer.key();
        platform_acc.bump = ctx.bumps.platform_acc;
        Ok(())
    }
    pub fn create_nft(
        ctx: Context<CreateNFTI>,
        token_name: String,
        token_symbol: String,
        token_uri: String,
        seller_fee_basis_points: u16,
    ) -> Result<()> {
        let cpi_program = ctx.accounts.token_metadata_program.to_account_info();
        let cpi_context = CreateMetadataAccountsV3 {
            metadata: ctx.accounts.metadata_account.to_account_info(),
            mint: ctx.accounts.token_mint.to_account_info(),
            mint_authority: ctx.accounts.signer.to_account_info(),
            update_authority: ctx.accounts.signer.to_account_info(),
            payer: ctx.accounts.signer.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
            rent: ctx.accounts.rent.to_account_info(),
        };
        let data = DataV2 {
            name: token_name,
            symbol: token_symbol,
            uri: token_uri,
            seller_fee_basis_points,
            creators: None,
            collection: None,
            uses: None,
        };
        create_metadata_accounts_v3(
            CpiContext::new(cpi_program, cpi_context),
            data,
            false,
            true,
            None,
        )?;

        token::mint_to(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::MintTo {
                    mint: ctx.accounts.token_mint.to_account_info(),
                    to: ctx.accounts.token_account.to_account_info(),
                    authority: ctx.accounts.signer.to_account_info(),
                },
            ),
            1,
        )?;

        Ok(())
    }
}


