import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import mongoose from 'mongoose';

async function dbPlugin(fastify: FastifyInstance) {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  await mongoose.connect(uri);
  fastify.log.info(`MongoDB connected: ${uri}`);

  fastify.addHook('onClose', async () => {
    await mongoose.disconnect();
    fastify.log.info('MongoDB disconnected');
  });
}

export default fp(dbPlugin, { name: 'db' });
