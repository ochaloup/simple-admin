use crate::error::SimpleAdminError;
use crate::events::simple_account::PrintAdminEvent;
use crate::state::simple_account::SimpleAccount;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct PrintAdmin<'info> {
    #[account(mut, has_one = admin @ SimpleAdminError::InvalidAdmin)]
    pub simple_admin_account: Account<'info, SimpleAccount>,

    pub admin: Signer<'info>,
}

#[derive(AnchorDeserialize, AnchorSerialize, Debug, Clone)]
pub struct PrintAdminParams {
    message: String,
}

impl<'info> PrintAdmin<'info> {
    pub fn process(&mut self, PrintAdminParams { message }: PrintAdminParams) -> Result<()> {
        msg!("{}", message);

        emit!(PrintAdminEvent {
            message,
            admin: self.admin.key()
        });

        self.simple_admin_account.print_call_count += 1;

        Ok(())
    }
}
