
module.exports = {
  openapi: '3.0.3',
  info: {
    title: "Texas Hold'em Online API",
    version: '1.0.0',
  },
  servers: [
    {
      url: '/',
      description: 'Current server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ApiSuccess: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Success' },
          data: {},
        },
        required: ['success', 'message'],
      },
      ApiError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'An error occurred' },
          errors: {
            description: 'Optional error details (e.g. validation errors)',
            type: 'array',
            items: { type: 'object' },
          },
        },
        required: ['success', 'message'],
      },
      AuthToken: {
        type: 'object',
        properties: {
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        },
        required: ['token'],
      },
      LedgerEntry: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '1' },
          userId: { type: 'string', example: '1' },
          type: {
            type: 'string',
            enum: ['deposit', 'withdrawal', 'bet', 'win', 'refund', 'bonus'],
            example: 'deposit',
          },
          amount: { type: 'number', example: 5000 },
          balanceAfter: { type: 'number', example: 95000 },
          description: { type: 'string', example: 'Cash game buy-in' },
          reference: { type: 'string', example: 'table_buyin' },
          created: { type: 'string', format: 'date-time', example: '2026-04-15T12:00:00.000Z' },
        },
        required: ['id', 'userId', 'type', 'amount', 'balanceAfter', 'created'],
      },
      LedgerListResponseData: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/LedgerEntry' },
          },
          pagination: {
            type: 'object',
            properties: {
              limit: { type: 'integer', example: 20 },
              nextCursor: { type: ['string', 'null'], example: '3' },
              hasMore: { type: 'boolean', example: false },
              total: { type: 'integer', example: 3 },
            },
            required: ['limit', 'nextCursor', 'hasMore', 'total'],
          },
        },
        required: ['items', 'pagination'],
      },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        responses: {
          200: {
            description: 'OK',
          },
        },
      },
    },
    '/': {
      get: {
        summary: 'API root',
        responses: {
          200: {
            description: 'API info',
          },
        },
      },
    },
    '/api/users': {
      post: {
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Demo Player' },
                  email: { type: 'string', example: 'player@demo.com' },
                  password: { type: 'string', example: 'secret123' },
                },
                required: ['name', 'email', 'password'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Created',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/AuthToken' } },
            },
          },
          400: {
            description: 'Validation failed',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
            },
          },
          409: {
            description: 'Conflict',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
            },
          },
        },
      },
    },
    '/api/auth': {
      get: {
        summary: 'Get current authenticated user',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'OK' },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
            },
          },
          404: {
            description: 'Not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
            },
          },
        },
      },
      post: {
        summary: 'Login and return JWT token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'player1@demo.com' },
                  password: { type: 'string', example: 'any-password' },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/AuthToken' } },
            },
          },
          400: {
            description: 'Validation failed',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
            },
          },
        },
      },
    },
    '/api/chips/free': {
      get: {
        summary: 'Request free chips (demo)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'OK' },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
            },
          },
        },
      },
    },
    '/api/v1/ledger': {
      get: {
        summary: 'List player ledger entries (read-only)',
        description:
          'Cursor pagination: pass `cursor=<lastSeenId>` to fetch the next page. Response includes `pagination.nextCursor`.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'type',
            in: 'query',
            required: false,
            schema: {
              type: 'string',
              enum: ['deposit', 'withdrawal', 'bet', 'win', 'refund', 'bonus'],
            },
          },
          { name: 'fromDate', in: 'query', required: false, schema: { type: 'string', format: 'date-time' } },
          { name: 'toDate', in: 'query', required: false, schema: { type: 'string', format: 'date-time' } },
          { name: 'minAmount', in: 'query', required: false, schema: { type: 'number', minimum: 0 } },
          { name: 'maxAmount', in: 'query', required: false, schema: { type: 'number', minimum: 0 } },
          { name: 'search', in: 'query', required: false, schema: { type: 'string', maxLength: 200 } },
          { name: 'cursor', in: 'query', required: false, schema: { type: 'string' } },
          { name: 'limit', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 100 } },
        ],
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    {
                      type: 'object',
                      properties: {
                        data: { $ref: '#/components/schemas/LedgerListResponseData' },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: {
            description: 'Validation failed (including invalid filter combinations)',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
            },
          },
        },
      },
    },
    '/api/v1/ledger/{id}': {
      get: {
        summary: 'Get a single ledger entry by id',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccess' },
                    {
                      type: 'object',
                      properties: {
                        data: { $ref: '#/components/schemas/LedgerEntry' },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: {
            description: 'Validation failed',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
            },
          },
          404: {
            description: 'Not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
            },
          },
        },
      },
    },
  },
};

