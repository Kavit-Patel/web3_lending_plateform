use anchor_lang::prelude::*;






#[account]
#[derive(InitSpace)]
pub struct PlatformState {
    pub is_initialized:bool,
    pub owner:Pubkey,
    pub bump:u8
}
