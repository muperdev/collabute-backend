import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      redirectURI: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/auth/github/callback`,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 24 hours
  },
  trustedOrigins: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    process.env.BACKEND_URL || 'http://localhost:3001',
    'https://collabute.com',
  ],
  secret: process.env.JWT_SECRET || 'your-secret-key',
  baseURL: process.env.BACKEND_URL || 'http://localhost:3001',
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
