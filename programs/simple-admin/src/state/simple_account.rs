use anchor_lang::prelude::*;

#[account]
#[derive(Debug)]
pub struct SimpleAccount {
    pub admin: Pubkey,
    // TODO: print call count can be removed, not needed (plus u64 is nonsense when other is u32)
    pub print_call_count: u64,
    pub created_account_next_index: u32,
}
