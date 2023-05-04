use anchor_lang::prelude::*;

pub mod error;
pub mod events;
pub mod instructions;
pub mod state;

use instructions::*;

/// solana-security-txt for admin contract
use solana_security_txt::security_txt;
security_txt! {
    name: "Simple admin contract for testing purposes",
    project_url: "https://github.com/ochaloup/simple-admin",
    contacts: "twitter: @_chalda",
    policy: "",
    preferred_languages: "en, cz",
    auditors: "None"
}

#[constant]
pub const PROGRAM_ID: &str = "sa3HiPEaDZk5JyU1CCmmRbcWnBc9U4TzHq42RWVUNQS";

declare_id!("sa3HiPEaDZk5JyU1CCmmRbcWnBc9U4TzHq42RWVUNQS");

#[program]
pub mod simple_admin {
    use super::*;

    pub fn create_simple_account(
        ctx: Context<CreateSimpleAccount>,
        params: CreateSimpleAccountParams,
    ) -> Result<()> {
        ctx.accounts.process(params)
    }

    pub fn print_admin(ctx: Context<PrintAdmin>, params: PrintAdminParams) -> Result<()> {
        ctx.accounts.process(params)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::str::FromStr;

    #[test]
    fn program_ids_match() {
        assert_eq!(crate::ID, Pubkey::from_str(PROGRAM_ID).unwrap());
    }
}
