import dotenv from "dotenv";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

let client: PrismaClient | undefined;

export function getPrisma(): PrismaClient {
  client ??= new PrismaClient();
  return client;
}
