import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Native modules must stay out of the Next.js bundler
  serverExternalPackages: [
    "better-sqlite3",
    "@prisma/adapter-better-sqlite3",
    "@prisma/adapter-pg",
    "pg",
    "pg-native",
  ],
  reactCompiler: false,
};

export default nextConfig;
