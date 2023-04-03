export type SimpleAdmin = {
  "version": "0.1.0",
  "name": "simple_admin",
  "constants": [
    {
      "name": "STAKE_DIRECTION_SEED",
      "type": "bytes",
      "value": "[115, 116, 97, 107, 101, 45, 100, 105, 114, 101, 99, 116, 105, 111, 110]"
    }
  ],
  "instructions": [
    {
      "name": "createVote",
      "accounts": [
        {
          "name": "voteRecord",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "vote record that will be created"
          ]
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true,
          "docs": [
            "pubkey that the simple admin vote record will be created for"
          ]
        },
        {
          "name": "root",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "root account that the vote record belongs under"
          ]
        },
        {
          "name": "rentPayer",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "rent payer for creation of the vote record account"
          ]
        },
        {
          "name": "validatorVote",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "updateVote",
      "accounts": [
        {
          "name": "voteRecord",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "vote record that will be updated"
          ]
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true,
          "docs": [
            "pubkey that the simple admin vote record belongs to"
          ]
        },
        {
          "name": "validatorVote",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "removeVote",
      "accounts": [
        {
          "name": "voteRecord",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "vote record that will be closed"
          ]
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true,
          "docs": [
            "pubkey that the simple admin vote record belongs to"
          ]
        },
        {
          "name": "root",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "root account the simple admin vote record PDA account was derived from"
          ]
        },
        {
          "name": "rentCollector",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "account to obtain rent for closing the vote record account"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "createRoot",
      "accounts": [
        {
          "name": "root",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "root account that will be created"
          ]
        },
        {
          "name": "rentPayer",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "to deduct rent for account creation from"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "root",
      "docs": [
        "simple admin Root account",
        "Used as a root account for PDA calculation of the vote record accounts, storing a statistic information."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "voteCount",
            "docs": [
              "how many vote records created the simple admin contract with this root account"
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "voteRecord",
      "docs": [
        "Account storing information to direct the stake directly to a validator",
        "An user can create one vote record account directing to a validator"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "root",
            "docs": [
              "root account that the vote record belongs under"
            ],
            "type": "publicKey"
          },
          {
            "name": "owner",
            "docs": [
              "the pubkey that the simple admin vote recorded will be created for"
            ],
            "type": "publicKey"
          },
          {
            "name": "validatorVote",
            "docs": [
              "validator vote account that the owner's stake directs to"
            ],
            "type": "publicKey"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump this account was created with"
            ],
            "type": "u8"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "CreateRootEvent",
      "fields": [
        {
          "name": "root",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "CreateVoteRecordEvent",
      "fields": [
        {
          "name": "root",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "validatorVote",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "bump",
          "type": "u8",
          "index": false
        },
        {
          "name": "newVoteCount",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "RemoveVoteRecordEvent",
      "fields": [
        {
          "name": "root",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "validatorVote",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "newVoteCount",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "UpdateVoteRecordEvent",
      "fields": [
        {
          "name": "root",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "oldValidatorVote",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "newValidatorVote",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidVoteProgram",
      "msg": "Account not owned by Solana Vote program"
    },
    {
      "code": 6001,
      "name": "InvalidValidatorVoteAccount",
      "msg": "Account is has not a correct validator vote account"
    }
  ]
};

export const IDL: SimpleAdmin = {
  "version": "0.1.0",
  "name": "simple_admin",
  "constants": [
    {
      "name": "STAKE_DIRECTION_SEED",
      "type": "bytes",
      "value": "[115, 116, 97, 107, 101, 45, 100, 105, 114, 101, 99, 116, 105, 111, 110]"
    }
  ],
  "instructions": [
    {
      "name": "createVote",
      "accounts": [
        {
          "name": "voteRecord",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "vote record that will be created"
          ]
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true,
          "docs": [
            "pubkey that the simple admin vote record will be created for"
          ]
        },
        {
          "name": "root",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "root account that the vote record belongs under"
          ]
        },
        {
          "name": "rentPayer",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "rent payer for creation of the vote record account"
          ]
        },
        {
          "name": "validatorVote",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "updateVote",
      "accounts": [
        {
          "name": "voteRecord",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "vote record that will be updated"
          ]
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true,
          "docs": [
            "pubkey that the simple admin vote record belongs to"
          ]
        },
        {
          "name": "validatorVote",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "removeVote",
      "accounts": [
        {
          "name": "voteRecord",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "vote record that will be closed"
          ]
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true,
          "docs": [
            "pubkey that the simple admin vote record belongs to"
          ]
        },
        {
          "name": "root",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "root account the simple admin vote record PDA account was derived from"
          ]
        },
        {
          "name": "rentCollector",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "account to obtain rent for closing the vote record account"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "createRoot",
      "accounts": [
        {
          "name": "root",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "root account that will be created"
          ]
        },
        {
          "name": "rentPayer",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "to deduct rent for account creation from"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "root",
      "docs": [
        "simple admin Root account",
        "Used as a root account for PDA calculation of the vote record accounts, storing a statistic information."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "voteCount",
            "docs": [
              "how many vote records created the simple admin contract with this root account"
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "voteRecord",
      "docs": [
        "Account storing information to direct the stake directly to a validator",
        "An user can create one vote record account directing to a validator"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "root",
            "docs": [
              "root account that the vote record belongs under"
            ],
            "type": "publicKey"
          },
          {
            "name": "owner",
            "docs": [
              "the pubkey that the simple admin vote recorded will be created for"
            ],
            "type": "publicKey"
          },
          {
            "name": "validatorVote",
            "docs": [
              "validator vote account that the owner's stake directs to"
            ],
            "type": "publicKey"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump this account was created with"
            ],
            "type": "u8"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "CreateRootEvent",
      "fields": [
        {
          "name": "root",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "CreateVoteRecordEvent",
      "fields": [
        {
          "name": "root",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "validatorVote",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "bump",
          "type": "u8",
          "index": false
        },
        {
          "name": "newVoteCount",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "RemoveVoteRecordEvent",
      "fields": [
        {
          "name": "root",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "validatorVote",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "newVoteCount",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "UpdateVoteRecordEvent",
      "fields": [
        {
          "name": "root",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "oldValidatorVote",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "newValidatorVote",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidVoteProgram",
      "msg": "Account not owned by Solana Vote program"
    },
    {
      "code": 6001,
      "name": "InvalidValidatorVoteAccount",
      "msg": "Account is has not a correct validator vote account"
    }
  ]
};
