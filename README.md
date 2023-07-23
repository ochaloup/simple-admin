# Simple admin

A contract to check setting up an admin field.

## To run

```
pnpm cli -u devnet create-simple-account --address <path keypair> --admin <pubkey>
pnpm cli -u devnet print-message <account pubkey> --admin <path keypair> --message 'some message'

# to get base58 string for SPL Gov
pnpm cli -u devnet print-message <account pubkey> --admin <path keypair> --message 'some message' --print-only

# to get info about simple accounts
pnpm cli -ud show
# to get info about print accounts
pnpm cli -ud show -a <simple-account-address> -n
```

## Development

To start

```
pnpm install
pnpm build
```

### Testing

```
pnpm test

# running a single anchor base test
FILE=packages/simple-admin-sdk/__tests__/admin.ts pnpm anchor-test
```
