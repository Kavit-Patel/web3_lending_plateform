use anchor_lang::prelude::*;

declare_id!("G7uEs9veqxboMC7kCwpnduLq57GnhKD2T1t3SqbgafQR");

#[program]
pub mod dlp {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
