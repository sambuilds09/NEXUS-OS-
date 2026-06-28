import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { conversations } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await db.select().from(conversations).where(eq(conversations.id, Number(id)));
  if (!data.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data[0]);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const result = await db.update(conversations).set({ ...body, updatedAt: new Date() }).where(eq(conversations.id, Number(id))).returning();
  return NextResponse.json(result[0]);
}
