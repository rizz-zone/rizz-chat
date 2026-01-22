import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./db/schema";
import { env } from "$env/dynamic/private";
import { dev } from "$app/environment";

// Auth URLs configuration:
// - APP_URL: The SvelteKit app URL (where auth is hosted)
// - API_URL: The Durable Object/Worker API URL (needs to verify JWTs)
//
// Local dev:   APP_URL=http://localhost:5173, API_URL=http://localhost:8787
// Production:  APP_URL=https://chat.rizz.zone, API_URL=https://chat-api.rizz.zone

const appUrl = env.APP_URL ?? (dev ? "http://localhost:5173" : undefined);
const apiUrl = env.API_URL ?? (dev ? "http://localhost:8787" : undefined);

if (!appUrl) {
  throw new Error("APP_URL environment variable is required");
}

// Build trusted origins list
const trustedOrigins: string[] = [];
if (apiUrl) {
  trustedOrigins.push(apiUrl);
}
// Add any additional trusted origins from env
if (env.TRUSTED_ORIGINS) {
  trustedOrigins.push(...env.TRUSTED_ORIGINS.split(",").map((o) => o.trim()));
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema,
  }),

  baseURL: appUrl,

  // Secret for signing sessions (generate with: openssl rand -base64 32)
  secret: env.BETTER_AUTH_SECRET,

  // Email/password authentication
  emailAndPassword: {
    enabled: true,
  },

  // Cross-origin configuration
  trustedOrigins,

  // Cookie settings for cross-origin
  advanced: {
    // For same-site subdomains (e.g., chat.rizz.zone and chat-api.rizz.zone)
    // Enable crossSubDomainCookies if they share a parent domain
    ...(env.COOKIE_DOMAIN && {
      crossSubDomainCookies: {
        enabled: true,
        domain: env.COOKIE_DOMAIN, // e.g., ".rizz.zone"
      },
    }),
    // Use secure cookies in production
    cookieOptions: {
      secure: !dev,
      sameSite: dev ? "lax" : "none", // "none" required for cross-origin with credentials
    },
  },

  // Session configuration
  session: {
    // How long until session expires (7 days)
    expiresIn: 60 * 60 * 24 * 7,
    // How often to refresh session (1 day)
    updateAge: 60 * 60 * 24,
  },

  plugins: [
    // JWT plugin for cross-service authentication
    // The DO/Worker can verify tokens using the JWKS endpoint
    jwt({
      jwt: {
        // JWT is valid for 15 minutes
        expiresIn: 60 * 15,
        // Audience is the API URL (the service that will verify the JWT)
        audience: apiUrl,
        // Issuer is the app URL (where the JWT was created)
        issuer: appUrl,
      },
      jwks: {
        // JWKS endpoint path
        jwksPath: "/.well-known/jwks.json",
        // Rotate keys every 30 days
        rotationInterval: 60 * 60 * 24 * 30,
        // Keep old keys valid for 7 days after rotation
        gracePeriod: 60 * 60 * 24 * 7,
      },
    }),
  ],
});

// Export the auth type for client-side type inference
export type Auth = typeof auth;
