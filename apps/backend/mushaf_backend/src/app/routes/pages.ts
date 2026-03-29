import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import multipart from '@fastify/multipart';
import { Page } from '../models/page.model';
import { parseDocx } from '../utils/parseDocx';

export default async function pagesRoutes(fastify: FastifyInstance) {
  // Register multipart support scoped to this plugin
  fastify.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10 MB max per upload
    },
  });

  /**
   * POST /pages/:pageNumber
   * Upload a .docx file for a Mushaf page.
   * Parses it and upserts into MongoDB.
   */
  fastify.post(
    '/pages/:pageNumber',
    async (
      request: FastifyRequest<{ Params: { pageNumber: string } }>,
      reply: FastifyReply
    ) => {
      const pageNumber = parseInt(request.params.pageNumber, 10);

      if (isNaN(pageNumber) || pageNumber < 1 || pageNumber > 604) {
        return reply
          .status(400)
          .send({ error: 'pageNumber must be an integer between 1 and 604' });
      }

      // Read uploaded file
      const data = await request.file();
      if (!data) {
        return reply.status(400).send({ error: 'No file uploaded' });
      }

      if (!data.filename.endsWith('.docx')) {
        return reply.status(400).send({ error: 'Only .docx files are accepted' });
      }

      // Buffer the entire file
      const chunks: Buffer[] = [];
      for await (const chunk of data.file) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);

      // Parse docx → structured PageInput
      let pageInput;
      try {
        pageInput = await parseDocx(buffer, pageNumber);
      } catch (err: unknown) {
        fastify.log.error(err);
        const message = err instanceof Error ? err.message : 'Parse error';
        return reply.status(422).send({ error: `Failed to parse .docx: ${message}` });
      }

      // Upsert into MongoDB
      const saved = await Page.findOneAndUpdate(
        { pageNumber },
        {
          pageNumber: pageInput.pageNumber,
          lines: pageInput.lines,
        },
        { upsert: true, new: true, runValidators: true }
      );

      return reply.status(200).send(saved);
    }
  );

  /**
   * GET /pages/:pageNumber
   * Retrieve a stored Mushaf page by its number.
   */
  fastify.get(
    '/pages/:pageNumber',
    async (
      request: FastifyRequest<{ Params: { pageNumber: string } }>,
      reply: FastifyReply
    ) => {
      const pageNumber = parseInt(request.params.pageNumber, 10);

      if (isNaN(pageNumber) || pageNumber < 1 || pageNumber > 604) {
        return reply
          .status(400)
          .send({ error: 'pageNumber must be an integer between 1 and 604' });
      }

      const page = await Page.findOne({ pageNumber }).lean();

      if (!page) {
        return reply
          .status(404)
          .send({ error: `Page ${pageNumber} not found` });
      }

      return reply.status(200).send(page);
    }
  );
}
