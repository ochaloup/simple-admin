export type SimpleAdmin = {
  "version": "0.1.0",
  "name": "simple_admin",
  "constants": [
    {
      "name": "PROGRAM_ID",
      "type": "string",
      "value": "\"sa4ihCaRZKuYZtY4fcdnNqx9vx9Lc6KELrL2nBkzNn2\""
    },
    {
      "name": "PRINT_MESSAGE_ACCOUNT_SEED",
      "type": "bytes",
      "value": "[112, 114, 105, 110, 116, 95, 109, 101, 115, 115, 97, 103, 101]"
    }
  ],
  "instructions": [
    {
      "name": "createSimpleAccount",
      "accounts": [
        {
          "name": "simpleAccount",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "rentPayer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "CreateSimpleAccountParams"
          }
        }
      ]
    },
    {
      "name": "printMessage",
      "accounts": [
        {
          "name": "simpleAdminAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "printAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rentPayer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "message",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "printAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "simpleAccount",
            "type": "publicKey"
          },
          {
            "name": "message",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "simpleAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "publicKey"
          },
          {
            "name": "printCallCount",
            "type": "u64"
          },
          {
            "name": "createdAccountNextIndex",
            "type": "u32"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "CreateSimpleAccountParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "publicKey"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "CreateSimpleAccountEvent",
      "fields": [
        {
          "name": "admin",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "PrintMessageEvent",
      "fields": [
        {
          "name": "admin",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "message",
          "type": "string",
          "index": false
        },
        {
          "name": "printAccount",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "printCallCount",
          "type": "u64",
          "index": false
        },
        {
          "name": "createdAccountNextIndex",
          "type": "u32",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidAdmin",
      "msg": "Account is not a valid admin account"
    }
  ]
};

export const IDL: SimpleAdmin = {
  "version": "0.1.0",
  "name": "simple_admin",
  "constants": [
    {
      "name": "PROGRAM_ID",
      "type": "string",
      "value": "\"sa4ihCaRZKuYZtY4fcdnNqx9vx9Lc6KELrL2nBkzNn2\""
    },
    {
      "name": "PRINT_MESSAGE_ACCOUNT_SEED",
      "type": "bytes",
      "value": "[112, 114, 105, 110, 116, 95, 109, 101, 115, 115, 97, 103, 101]"
    }
  ],
  "instructions": [
    {
      "name": "createSimpleAccount",
      "accounts": [
        {
          "name": "simpleAccount",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "rentPayer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "CreateSimpleAccountParams"
          }
        }
      ]
    },
    {
      "name": "printMessage",
      "accounts": [
        {
          "name": "simpleAdminAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "printAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rentPayer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "message",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "printAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "simpleAccount",
            "type": "publicKey"
          },
          {
            "name": "message",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "simpleAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "publicKey"
          },
          {
            "name": "printCallCount",
            "type": "u64"
          },
          {
            "name": "createdAccountNextIndex",
            "type": "u32"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "CreateSimpleAccountParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "publicKey"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "CreateSimpleAccountEvent",
      "fields": [
        {
          "name": "admin",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "PrintMessageEvent",
      "fields": [
        {
          "name": "admin",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "message",
          "type": "string",
          "index": false
        },
        {
          "name": "printAccount",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "printCallCount",
          "type": "u64",
          "index": false
        },
        {
          "name": "createdAccountNextIndex",
          "type": "u32",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidAdmin",
      "msg": "Account is not a valid admin account"
    }
  ]
};
