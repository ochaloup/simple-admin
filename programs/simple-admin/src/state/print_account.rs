use anchor_lang::prelude::*;

#[account]
#[derive(Debug)]
pub struct PrintAccount {
    pub simple_account: Pubkey,
    pub message: String,
}
