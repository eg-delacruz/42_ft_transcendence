/**
 * Socket JWT Authentication Middleware
 * Reusable middleware for Socket.IO namespaces.
 * Reads the token from auth.token, Authorization header, or HttpOnly cookie.
 */

import jwt from 'jsonwebtoken';
import { Socket } from 'socket.io';

import env from '@config/env';
import { logger } from '@config/logger';
import { SocketUser } from '@interfaces/socket';

export function jwtSocketMiddleware(socket: Socket, next: (err?: Error) => void): void {
    try {
        // 1. Bearer token from Authorization header
        const authHeader = socket.handshake.headers?.authorization;
        const bearerToken =
            authHeader && authHeader.startsWith('Bearer ')
                ? authHeader.slice(7)
                : null;

        // 2. HttpOnly cookie (set by Express on login)
        const cookieHeader = socket.handshake.headers?.cookie;
        const cookieToken = cookieHeader
            ? cookieHeader
                  .split(';')
                  .map((part) => part.trim())
                  .find((part) => part.startsWith('access_token='))
                  ?.split('=')[1] ?? null
            : null;

        // 3. Explicit auth object (useful for native clients)
        const token = socket.handshake.auth?.token || bearerToken || cookieToken;

        if (!token) {
            return next(new Error('Unauthorized: no token provided'));
        }

        const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
        const userId = typeof decoded.id === 'string' ? decoded.id : null;
        const email  = typeof decoded.email  === 'string' ? decoded.email  : null;
        const role   = typeof decoded.role   === 'string' ? decoded.role   : null;

        if (!userId || !email || !role) {
            return next(new Error('Unauthorized: invalid token payload'));
        }

        socket.data.user = {
            userId,
            email,
            role: role as SocketUser['role'],
        } satisfies SocketUser;

        logger.debug(`[socket-auth] OK socket=${socket.id} user=${userId} ns=${socket.nsp.name}`);
        next();
    } catch {
        next(new Error('Unauthorized: invalid or expired token'));
    }
}