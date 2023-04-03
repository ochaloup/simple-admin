use crate::events::CreateSimpleAccountEvent;
use crate::state::simple_account::SimpleAccount;
use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_program;

#[derive(Accounts)]
pub struct CreateSimpleAccount<'info> {
    #[account(
        init,
        payer = rent_payer,
        space = 8 + std::mem::size_of::<SimpleAccount>()
    )]
    pub simple_account: Account<'info, SimpleAccount>,

    #[account(
        mut,
        owner = system_program::ID
    )]
    pub rent_payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(AnchorDeserialize, AnchorSerialize, Debug, Clone)]
pub struct CreateSimpleAccountParams {
    admin: Pubkey,
}

impl<'info> CreateSimpleAccount<'info> {
    pub fn process(&mut self, CreateSimpleAccountParams {
        admin,
    }: CreateSimpleAccountParams) -> Result<()> {
        self.simple_account.set_inner(SimpleAccount { admin, print_call_count: 0 });

        emit!(CreateSimpleAccountEvent {
            admin,
        });
        Ok(())
    }
}
