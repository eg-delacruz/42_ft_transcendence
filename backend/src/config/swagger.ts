import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ft_transcendence API',
      version: '1.0.0',
      description:
        'Interactive API documentation for the ft_transcendence backend. Protected endpoints require the access_token cookie set via /auth/login or /auth/register.',
    },
    servers: [{ url: '/api' }],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'access_token',
        },
      },
    },
  },
  apis: [path.join(__dirname, '..', 'modules', '**', '*.routes.{ts,js}')],
};

export const swaggerSpec = swaggerJsdoc(options);
