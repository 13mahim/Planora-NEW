import { defineConfig } from "prisma/config";

process.env.DATABASE_URL = "postgresql://neondb_owner:npg_FcvMWGD2a1yx@ep-holy-lab-am2pwkbo-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require";

export default defineConfig({
  earlyAccess: true,
  schema: "prisma/schema.prisma",
});
