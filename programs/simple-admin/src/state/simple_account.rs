use anchor_lang::prelude::*;

#[account]
#[derive(Debug)]
pub struct SimpleAccount {
    pub admin: Pubkey,
    pub print_call_count: u64,
    pub created_account_next_index: u32,
}
