use anchor_lang::prelude::*;
use anchor_spl::token;
use anchor_spl::metadata::{
    CreateMetadataAccountsV3,
    create_metadata_accounts_v3,
    mpl_token_metadata::types::DataV2,
    Metadata
};
use bank::states::{DepositorState,BankState,VaultState};
use bank::cpi::accounts::DepositeI;

pub mod constants;
pub mod errors;
pub mod events;
pub mod instructions;
pub mod states;
pub mod implementations;

use constants::*;
use errors::*;
use events::*;
use instructions::*;
use states::*;
use implementations::*;

declare_id!("G7uEs9veqxboMC7kCwpnduLq57GnhKD2T1t3SqbgafQR");

#[program]
pub mod dlp {
    use super::*;

    pub fn initialize_platform(ctx: Context<InitializePlatformI>,platform_mint_total_supply:u64) -> Result<()> {
        let platform_acc = &mut ctx.accounts.platform_acc;
        require!(!platform_acc.is_initialized,PlatformError::AlreadyInitializedPlatform);
        platform_acc.is_initialized=true;
        platform_acc.owner = ctx.accounts.signer.key();
        platform_acc.loan_id = 1;
        platform_acc.platform_mint.mint = ctx.accounts.platform_mint.key();
        platform_acc.platform_mint.total_supply = platform_mint_total_supply;
        platform_acc.current_mint_amount = platform_mint_total_supply;
        platform_acc.bump = ctx.bumps.platform_acc;

        ctx.accounts.create_platform_mint(platform_mint_total_supply)?;

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
    pub fn depositor_cpi(ctx:Context<DepositorCpiI>,amount:u64)->Result<()>{
        let cpi_program = ctx.accounts.bank_program.to_account_info();
        let cpi_accounts = DepositeI{
            signer:ctx.accounts.signer.to_account_info(),
            bank_owner:ctx.accounts.bank_owner.to_account_info(),
            bank_acc:ctx.accounts.bank_acc.to_account_info(),
            mint:ctx.accounts.mint.to_account_info(),
            from_token_account:ctx.accounts.from_token_account.to_account_info(),
            vault_acc:ctx.accounts.vault_acc.to_account_info(),
            vault:ctx.accounts.vault.to_account_info(),
            depositor:ctx.accounts.depositor.to_account_info(),
            system_program:ctx.accounts.system_program.to_account_info(),
            token_program:ctx.accounts.token_program.to_account_info()
        };
        let cpi_ctx = CpiContext::new(cpi_program,cpi_accounts);
        bank::cpi::deposite(cpi_ctx, amount)?;
        Ok(())
    }
    pub fn borrow_loan(ctx:Context<BorrowLoanI>,loan_id:u128,borrow_amount:u64)->Result<()>{
        let platform_acc = &ctx.accounts.platform_acc;
        require!(loan_id==platform_acc.loan_id,PlatformError::InvalidLoanId);
        bank::cpi::deposite(ctx.accounts.borrow_loan(), 1)?;
        ctx.accounts.transfer_to_borrower(borrow_amount)?;
        let loan_acc = &mut ctx.accounts.loan_acc;
        let platform_acc = &mut ctx.accounts.platform_acc;
        let clock = Clock::get()?;
        loan_acc.loan_id = loan_id;
        loan_acc.borrower = ctx.accounts.borrower.key();
        loan_acc.borrowed_amount = borrow_amount;
        loan_acc.collateral = ctx.accounts.nft_collateral.key();
        loan_acc.interest = 10;
        loan_acc.start_time = clock.unix_timestamp as u64;
        loan_acc.end_time = loan_acc.start_time + 30 * 24 * 60 * 60;
        loan_acc.amount_with_interest = borrow_amount + (borrow_amount * loan_acc.interest / 100);
        loan_acc.bump = ctx.bumps.loan_acc;

        platform_acc.loan_id +=1;
        Ok(())
    }
}


