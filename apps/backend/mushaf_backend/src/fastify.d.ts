import { FastifyRequest, FastifyReply } from 'fastify';
import { Permission } from './app/models/user.model';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requirePermission: (
      permission: Permission
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
