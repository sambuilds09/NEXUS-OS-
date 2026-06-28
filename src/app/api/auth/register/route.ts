import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, createJWT } from "@/lib/security";

export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length > 0) {
    return NextResponse.json({ error: "User already exists" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const [user] = await db.insert(users).values({
    email,
    name: name || email.split("@")[0],
    passwordHash,
    role: "member",
  }).returning();

  const token = await createJWT({ sub: String(user.id), email: user.email, role: user.role });

  return NextResponse.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
}
