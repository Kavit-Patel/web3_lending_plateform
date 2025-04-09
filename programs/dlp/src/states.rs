use anchor_lang::prelude::*;






#[account]
#[derive(InitSpace)]
pub struct PlatformState {
    pub is_initialized:bool,
    pub owner:Pubkey,
    pub loan_id:u128,
    pub platform_mint:PlatformMintState,
    pub current_mint_amount:u64,
    pub bump:u8
}

#[account]
#[derive(InitSpace)]
pub struct PlatformMintState {
   pub mint:Pubkey,
   pub total_supply:u64,
}

#[account]
#[derive(InitSpace)]
pub struct LoanState {
    pub loan_id:u128,
    pub borrower:Pubkey,
    pub borrowed_amount:u64,
    pub interest:u64,
    pub collateral:Pubkey,
    pub start_time:u64,
    pub end_time:u64,
    pub amount_with_interest:u64,
    pub bump:u8

}