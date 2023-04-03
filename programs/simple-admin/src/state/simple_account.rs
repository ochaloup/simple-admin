use anchor_lang::prelude::*;

#[account]
#[derive(Debug)]
pub struct SimpleAccount {
    pub admin: Pubkey,
    pub print_call_count: u64,
}
