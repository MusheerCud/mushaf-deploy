import Fastify from 'fastify';
import { app } from './app/app';

const host = process.env.HOST ?? '0.0.0.0';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

console.log('--- Environment Check ---');
console.log('HOST:', host);
console.log('PORT:', port);
console.log('MONGODB_URI present:', !!process.env.MONGODB_URI);
if (process.env.MONGODB_URI) {
  const uri = process.env.MONGODB_URI;
  const masked = uri.replace(/:([^@]+)@/, ':****@');
  console.log('MONGODB_URI (masked):', masked);
}
console.log('-------------------------');

// Instantiate Fastify with some config
const server = Fastify({
  logger: true,
});

// Register your application as a normal plugin.
server.register(app);

// Start listening.
server.listen({ port, host }, (err) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  } else {
    console.log(`[ ready ] http://${host}:${port}`);
  }
});
