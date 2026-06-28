import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { memories } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { storeMemory, getRelevantMemories } from "@/lib/agent-engine";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");
  const query = searchParams.get("query");

  if (query && workspaceId) {
    const results = await getRelevantMemories(Number(workspaceId), query, 10);
    return NextResponse.json(results);
  }

  if (workspaceId) {
    const data = await db.select().from(memories).where(eq(memories.workspaceId, Number(workspaceId))).orderBy(desc(memories.createdAt)).limit(100);
    return NextResponse.json(data);
  }

  const data = await db.select().from(memories).orderBy(desc(memories.createdAt)).limit(100);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await storeMemory(body);
  return NextResponse.json(result[0], { status: 201 });
}
