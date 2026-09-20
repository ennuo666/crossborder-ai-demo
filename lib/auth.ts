import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

let instance: ReturnType<typeof createAuth> | undefined;
function createAuth() {
  if (!process.env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET.length < 32) throw new Error("BETTER_AUTH_SECRET must contain at least 32 characters");
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required for authentication");
  return betterAuth({
    database: prismaAdapter(prisma, { provider: "postgresql" }),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    emailAndPassword: { enabled: true, minPasswordLength: 12 },
    session: { expiresIn: 60 * 60 * 24 * 7 },
    logger: { disabled: true },
  });
}
export function getAuth() { return instance ??= createAuth(); }
export async function currentUser(headers: Headers) {
  return (await getAuth().api.getSession({ headers }))?.user ?? null;
}
