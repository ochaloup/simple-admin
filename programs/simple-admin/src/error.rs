use anchor_lang::prelude::*;

#[error_code]
pub enum SimpleAdminError {
    #[msg("Account is not a valid admin account")]
    InvalidAdmin, // 6000
}
