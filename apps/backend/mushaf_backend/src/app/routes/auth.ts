import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcryptjs';
import { User, DEFAULT_PERMISSIONS, UserRole } from '../models/user.model';
import { RegisterBody, LoginBody, TokenPayload } from '../types/auth.types';

export default async function authRoutes(fastify: FastifyInstance) {
  /**
   * POST /auth/register
   * Create a new user account. Password is hashed with bcrypt (12 rounds).
   * Returns a signed JWT on success.
   */
  fastify.post<{ Body: RegisterBody }>(
    '/auth/register',
    async (request: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply) => {
      const { email, name, mobileNumber, password } = request.body;

      // Basic field validation
      if (!email || !name || !mobileNumber || !password) {
        return reply.status(400).send({ error: 'All fields are required: email, name, mobileNumber, password' });
      }
      if (password.length < 6) {
        return reply.status(400).send({ error: 'Password must be at least 6 characters' });
      }

      // Check duplicate email
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return reply.status(409).send({ error: 'An account with this email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Determine role — first user ever becomes admin
      const userCount = await User.countDocuments();
      const role: UserRole = userCount === 0 ? 'admin' : 'user';

      const user = new User({
        email: email.toLowerCase(),
        name,
        mobileNumber,
        password: hashedPassword,
        role,
        permissions: DEFAULT_PERMISSIONS[role],
      });
      await user.save();

      // Sign JWT
      const payload: TokenPayload = {
        sub: (user._id as unknown as string).toString(),
        email: user.email,
        role: user.role,
        permissions: user.permissions as any,
      };
      const token = fastify.jwt.sign(payload);

      return reply.status(201).send({
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          mobileNumber: user.mobileNumber,
          role: user.role,
          permissions: user.permissions,
        },
      });
    }
  );

  /**
   * POST /auth/login
   * Verify credentials, return a signed JWT.
   */
  fastify.post<{ Body: LoginBody }>(
    '/auth/login',
    async (request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) => {
      const { email, password } = request.body;

      if (!email || !password) {
        return reply.status(400).send({ error: 'Email and password are required' });
      }

      // Explicitly select password (it's hidden by default)
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      if (!user) {
        return reply.status(401).send({ error: 'Invalid email or password' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return reply.status(401).send({ error: 'Invalid email or password' });
      }

      const payload: TokenPayload = {
        sub: (user._id as unknown as string).toString(),
        email: user.email,
        role: user.role,
        permissions: user.permissions as any,
      };
      const token = fastify.jwt.sign(payload);

      return reply.status(200).send({
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          mobileNumber: user.mobileNumber,
          role: user.role,
          permissions: user.permissions,
        },
      });
    }
  );

  /**
   * GET /auth/me
   * Protected. Returns the currently authenticated user's profile.
   */
  fastify.get(
    '/auth/me',
    {
      preHandler: [fastify.authenticate],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const payload = request.user as TokenPayload;

      const user = await User.findById(payload.sub);
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }

      return reply.status(200).send({
        id: user._id,
        email: user.email,
        name: user.name,
        mobileNumber: user.mobileNumber,
        role: user.role,
        permissions: user.permissions,
        createdAt: user.createdAt,
      });
    }
  );
}
