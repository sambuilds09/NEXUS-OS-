import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await db.select().from(projects).where(eq(projects.id, Number(id)));
  if (!data.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data[0]);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const result = await db.update(projects).set({ ...body, updatedAt: new Date() }).where(eq(projects.id, Number(id))).returning();
  return NextResponse.json(result[0]);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.delete(projects).where(eq(projects.id, Number(id)));
  return NextResponse.json({ success: true });
}
