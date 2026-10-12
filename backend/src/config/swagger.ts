import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ft_transcendence API',
      version: '1.0.0',
      description:
        'Interactive API documentation for the ft_transcendence backend. Protected endpoints require the access_token cookie set via /auth/login or /auth/register.\n\n' +
        '## Public API quickstart (API key)\n\n' +
        'External clients call `/public/*` with an `x-api-key` header — no cookie.\n\n' +
        '**1. Log in as admin** (once; gives you a cookie): `POST /auth/login` with the seeded super-admin from `.env` (`SUPER_EMAIL` / `SUPER_PASS`). In this browser UI the cookie is sent automatically.\n\n' +
        '**2. Issue a key:** `POST /api-keys` with `{"name":"evaluator-client","scopes":["read","write"]}`. Copy `body.apiKey` — it is shown ONCE and expires 24h after issuance.\n\n' +
        '**3. Test it:** `curl -k https://localhost:3000/api/public/games -H "x-api-key: <the-key>"`. No key gives 401, revoked key or missing scope gives 403, over 100 requests per 15 minutes gives 429.',
    },
    servers: [{ url: '/api' }],
    tags: [
      {
        name: 'Public',
        description: 'External key-secured namespace (`x-api-key` header, no cookie). Start at POST /api-keys to issue a key, then call these endpoints.',
      },
      {
        name: 'ApiKeys',
        description: 'Admin-only key issuance and management (cookie auth, never `x-api-key`). Plaintext secrets are returned only at creation.',
      },
      {
        name: 'Chat (WebSocket)',
        description: 'Real-time chat over Socket.IO. Not REST — see the /chat endpoint below for connection details and event reference.',
      },
    ],
    paths: {
      '/chat': {
        get: {
          tags: ['Chat (WebSocket)'],
          summary: 'WebSocket connection info & event reference',
          description:
            '**This is not a REST endpoint.** It documents the Socket.IO WebSocket API.\n\n' +
            '## Connection\n\n' +
            'Connect to `wss://localhost:3000/chat` using the Socket.IO client:\n\n' +
            '```js\n' +
            'const socket = io("https://localhost:3000/chat", {\n' +
            '  withCredentials: true,\n' +
            '  transports: ["websocket"],\n' +
            '});\n' +
            '```\n\n' +
            'Auth is automatic — the `access_token` cookie is sent with the handshake.\n\n' +
            '## Client → Server events\n\n' +
            '| Event | Payload | Ack Response |\n' +
            '|-------|---------|--------------|\n' +
            '| `get_rooms` | `{}` | `{ rooms: RoomInfo[] }` |\n' +
            '| `create_room` | `{ name, description? }` | `{ room }` |\n' +
            '| `get_room` | `{ roomId }` | `RoomInfo` |\n' +
            '| `get_room_messages` | `{ roomId, limit?, offset? }` | `{ messages, total }` |\n' +
            '| `join_room` | `{ roomId }` | `{ roomId, userId }` |\n' +
            '| `leave_room` | `{ roomId }` | `{ roomId, userId }` |\n' +
            '| `send_message` | `{ roomId, text }` | `ChatMessage` (max 5000 chars) |\n' +
            '| `typing` | `roomId` (string) | No ACK |\n' +
            '| `stop_typing` | `roomId` (string) | No ACK |\n\n' +
            '## Server → Client events\n\n' +
            '| Event | Payload |\n' +
            '|-------|---------|\n' +
            '| `message:new` | `ChatMessage` |\n' +
            '| `room:user_joined` | `{ roomId, user, timestamp }` |\n' +
            '| `room:user_left` | `{ roomId, user, timestamp }` |\n' +
            '| `room:typing` | `{ roomId, user, timestamp }` |\n' +
            '| `room:stop_typing` | `{ roomId, user, timestamp }` |\n\n' +
            'Redis-backed pub/sub adapter. Message history capped at 200 per room. If Redis is down, the chat namespace is not initialized (graceful degradation).',
          responses: {
            '101': {
              description: 'Switching Protocols — WebSocket upgrade. This is informational; the actual communication happens via Socket.IO events listed above.',
            },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'access_token',
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
        },
      },
    },
  },
  apis: [path.join(__dirname, '..', 'modules', '**', '*.routes.{ts,js}')],
};

export const swaggerSpec = swaggerJsdoc(options);
