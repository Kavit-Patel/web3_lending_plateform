use anchor_lang::prelude::*;


#[error_code]
pub enum PlatformError{
    #[msg("Platform Already Initialized !")]
    AlreadyInitializedPlatform
}