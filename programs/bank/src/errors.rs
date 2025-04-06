use anchor_lang::prelude::*;


#[error_code]
pub enum BankError {
    #[msg("Bank Already initialized !")]
    AlreadyInitializedBank,
    #[msg("Withdrawer is invalid !")]
    InvalidWithdrawer,
    #[msg("Amount exceeds available amount !")]
    InvalidAmount
}