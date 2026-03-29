import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';

// Memaksa Node untuk mencari file .env di folder yang sama
dotenv.config();

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
  },
});