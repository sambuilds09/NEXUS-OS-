import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { knowledgeSources } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { ingestKnowledge, retrieveKnowledge } from "@/lib/rag";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");
  const query = searchParams.get("query");

  if (query && workspaceId) {
    const results = await retrieveKnowledge(Number(workspaceId), query, 5);
    return NextResponse.json(results);
  }

  if (workspaceId) {
    const data = await db.select().from(knowledgeSources).where(eq(knowledgeSources.workspaceId, Number(workspaceId))).orderBy(desc(knowledgeSources.createdAt));
    return NextResponse.json(data);
  }

  const data = await db.select().from(knowledgeSources).orderBy(desc(knowledgeSources.createdAt)).limit(50);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { workspaceId, name, type, content, sourceUrl, metadata } = await req.json();

  if (!workspaceId || !name || !content) {
    return NextResponse.json({ error: "workspaceId, name, and content required" }, { status: 400 });
  }

  try {
    const sourceId = await ingestKnowledge(Number(workspaceId), name, type, content, sourceUrl, metadata);
    return NextResponse.json({ sourceId, status: "processing" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
