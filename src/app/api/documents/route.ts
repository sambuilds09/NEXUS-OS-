import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");
  if (workspaceId) {
    const data = await db.select().from(documents).where(eq(documents.workspaceId, Number(workspaceId))).orderBy(desc(documents.createdAt));
    return NextResponse.json(data);
  }
  const data = await db.select().from(documents).orderBy(desc(documents.createdAt));
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await db.insert(documents).values(body).returning();
  return NextResponse.json(result[0], { status: 201 });
}
