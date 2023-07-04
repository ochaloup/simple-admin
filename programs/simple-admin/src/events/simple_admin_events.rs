use anchor_lang::prelude::*;

#[event]
pub struct CreateSimpleAccountEvent {
    pub admin: Pubkey,
}

#[event]
pub struct PrintMessageEvent {
    pub admin: Pubkey,
    pub message: String,
    pub print_account: Pubkey,
    pub print_call_count: u64,
    pub created_account_next_index: u32,
}
