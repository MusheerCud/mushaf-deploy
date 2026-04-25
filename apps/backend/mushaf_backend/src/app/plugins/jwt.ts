import fp from 'fastify-plugin';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import jwtPlugin from '@fastify/jwt';
import { TokenPayload } from '../types/auth.types';
import { Permission } from '../models/user.model';

// Extend Fastify types so TypeScript knows about request.user
declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: TokenPayload;
    user: TokenPayload;
  }
}

async function jwtSetup(fastify: FastifyInstance) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  fastify.register(jwtPlugin, {
    secret,
    sign: { expiresIn: '7d' },
  });

  /**
   * Decorate fastify with an `authenticate` preHandler.
   * Usage: { preHandler: [fastify.authenticate] }
   */
  fastify.decorate(
    'authenticate',
    async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.status(401).send({ error: 'Unauthorized: invalid or missing token' });
      }
    }
  );

  /**
   * Returns a preHandler that checks whether the authenticated user has a
   * specific permission in their token payload.
   *
   * Usage: { preHandler: [fastify.authenticate, fastify.requirePermission('upload')] }
   */
  fastify.decorate(
    'requirePermission',
    function (permission: Permission) {
      return async function (request: FastifyRequest, reply: FastifyReply) {
        const user = request.user as TokenPayload;
        if (!user?.permissions?.includes(permission)) {
          reply.status(403).send({ error: `Forbidden: '${permission}' permission required` });
        }
      };
    }
  );
}

export default fp(jwtSetup, { name: 'jwt' });
