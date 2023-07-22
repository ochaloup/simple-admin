use crate::error::SimpleAdminError;
use crate::events::PrintMessageEvent;
use crate::state::print_account::PrintAccount;
use crate::state::simple_account::SimpleAccount;
use crate::PRINT_MESSAGE_ACCOUNT_SEED;
use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_program;

#[derive(Accounts)]
#[instruction(message: String)]
pub struct PrintMessage<'info> {
    #[account(mut, has_one = admin @ SimpleAdminError::InvalidAdmin)]
    pub simple_admin_account: Account<'info, SimpleAccount>,

    pub admin: Signer<'info>,

    #[account(
      init,
      payer = rent_payer,
      space = 8 + 32 + message.len() + 8 + 4,
      seeds = [
        PRINT_MESSAGE_ACCOUNT_SEED,
        simple_admin_account.key().as_ref(),
        &simple_admin_account.created_account_next_index.to_le_bytes(),
      ],
      bump,
    )]
    pub print_account: Account<'info, PrintAccount>,

    #[account(
      mut,
      owner = system_program::ID
    )]
    pub rent_payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

/**
 * Instruction to print a message to transaction log
 * and saves the message to a separate account
 * to be available for later inspection on blockchain.
 *
 * Only transaction signed with admin key is permitted to call this instruction.
 * The admin key is stored in the SimpleAccount root account.
 */
impl<'info> PrintMessage<'info> {
    pub fn process(&mut self, message: String, _print_account_bump: u8) -> Result<()> {
        msg!("{}", message);

        self.print_account.set_inner(PrintAccount {
            simple_account: self.simple_admin_account.key(),
            message: message.clone(),
        });

        self.simple_admin_account.print_call_count += 1;
        self.simple_admin_account.created_account_next_index += 1;

        emit!(PrintMessageEvent {
            message,
            admin: self.admin.key(),
            print_account: self.print_account.key(),
            print_call_count: self.simple_admin_account.print_call_count,
            created_account_next_index: self.simple_admin_account.created_account_next_index,
        });

        Ok(())
    }
}
