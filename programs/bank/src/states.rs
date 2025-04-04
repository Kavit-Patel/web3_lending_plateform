use anchor_lang::prelude::*;


#[account]
#[derive(InitSpace)]
pub struct BankState {
    pub owner:Pubkey,
    pub bump:u8
}

#[account]
#[derive(InitSpace)]
pub struct VaultState {
    pub is_initialize:bool,
    pub owner:Pubkey,
    pub token_address:Pubkey,
    pub amount:u64,
    pub bump:u8
}

#[account]
#[derive(InitSpace)]
pub struct DepositorState {
    pub is_initialized:bool,
    pub wallet:Pubkey,
    pub bump:u8
}