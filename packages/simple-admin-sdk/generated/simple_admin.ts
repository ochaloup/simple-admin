export type SimpleAdmin = {
  "version": "0.1.0",
  "name": "simple_admin",
  "constants": [
    {
      "name": "PROGRAM_ID",
      "type": "string",
      "value": "\"sa3HiPEaDZk5JyU1CCmmRbcWnBc9U4TzHq42RWVUNQS\""
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
      "name": "printAdmin",
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
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "PrintAdminParams"
          }
        }
      ]
    }
  ],
  "accounts": [
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
    },
    {
      "name": "PrintAdminParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "message",
            "type": "string"
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
      "name": "PrintAdminEvent",
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
      "value": "\"sa3HiPEaDZk5JyU1CCmmRbcWnBc9U4TzHq42RWVUNQS\""
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
      "name": "printAdmin",
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
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "PrintAdminParams"
          }
        }
      ]
    }
  ],
  "accounts": [
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
    },
    {
      "name": "PrintAdminParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "message",
            "type": "string"
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
      "name": "PrintAdminEvent",
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
