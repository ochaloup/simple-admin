use anchor_lang::prelude::*;

pub mod error;
pub mod events;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("sagP7gnuzqDuGH2NsUkzpeLWkUJLgeuwb1drHtho6op");

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
