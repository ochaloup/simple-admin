use anchor_lang::prelude::*;

#[event]
pub struct CreateSimpleAccountEvent {
    pub admin: Pubkey,
}

#[event]
pub struct PrintAdminEvent {
    pub admin: Pubkey,
    pub message: String,
}
