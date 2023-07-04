# Simple admin

A contract to check setting up an admin field.

## To run

```
pnpm cli -c devnet create-simple-account --address <path keypair> --admin <pubkey>
pnpm cli -c devnet print-message <account pubkey> --admin <path keypair> --message 'some message'

# to get base58 string for SPL Gov
pnpm cli -c devnet print-message <account pubkey> --admin <path keypair> --message 'some message' --print-only

# to get info about accounts
pnpm cli -c devnet show
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
