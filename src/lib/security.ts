import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "nexus-os-default-secret-change-in-production"
);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createJWT(payload: { sub: string; email: string; role: string }): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .setIssuer("nexus-os")
    .setAudience("nexus-os")
    .sign(JWT_SECRET);
}

export async function verifyJWT(token: string): Promise<{ sub: string; email: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: "nexus-os",
      audience: "nexus-os",
      clockTolerance: 60,
    });
    return payload as any;
  } catch {
    return null;
  }
}

// RBAC
export const PERMISSIONS = {
  admin: ["*"],
  manager: ["workspaces:read", "workspaces:write", "projects:read", "projects:write", "agents:read", "agents:execute", "tasks:read", "tasks:write", "documents:read", "documents:write", "workflows:read", "workflows:execute", "knowledge:read", "knowledge:write", "settings:read"],
  member: ["workspaces:read", "projects:read", "agents:read", "tasks:read", "tasks:write", "documents:read", "workflows:read", "knowledge:read"],
  viewer: ["workspaces:read", "projects:read", "agents:read", "tasks:read", "documents:read"],
};

export function hasPermission(role: string, permission: string): boolean {
  const perms = PERMISSIONS[role as keyof typeof PERMISSIONS] || [];
  return perms.includes("*") || perms.includes(permission);
}

// Prompt injection protection
export const PROMPT_INJECTION_PATTERNS = [
  /ignore previous instructions/i,
  /disregard.*prompt/i,
  /you are now.*instead/i,
  /system prompt.*leak/i,
  /DAN mode/i,
  /jailbreak/i,
  /ignore.*above/i,
  /new instructions/i,
  /pretend to be/i,
  /act as.*ignore/i,
];

export function detectPromptInjection(input: string): { detected: boolean; pattern?: string } {
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      return { detected: true, pattern: pattern.source };
    }
  }
  return { detected: false };
}

// Output validation
export function validateAgentOutput(output: string): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  if (output.length < 10) issues.push("Output too short");
  if (output.includes("<script") || output.includes("javascript:")) issues.push("Potential XSS in output");
  if (output.includes("BEGIN PGP") || output.includes("PRIVATE KEY")) issues.push("Potential secret leak");

  return { valid: issues.length === 0, issues };
}

// Rate limiting (simple in-memory for demo; use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, maxRequests: number = 100, windowMs: number = 60000): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count, resetAt: record.resetAt };
}
