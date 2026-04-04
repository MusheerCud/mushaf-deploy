import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import mongoose from 'mongoose';

async function dbPlugin(fastify: FastifyInstance) {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  fastify.log.info('Connecting to MongoDB...');
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 20000, // Increased to 20 seconds
  });
  fastify.log.info('MongoDB connected successfully');

  fastify.addHook('onClose', async () => {
    await mongoose.disconnect();
    fastify.log.info('MongoDB disconnected');
  });
}

export default fp(dbPlugin, { name: 'db' });
