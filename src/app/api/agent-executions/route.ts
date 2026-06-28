import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { agentExecutions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agentId = searchParams.get("agentId");
  if (agentId) {
    const data = await db.select().from(agentExecutions).where(eq(agentExecutions.agentId, Number(agentId))).orderBy(desc(agentExecutions.createdAt));
    return NextResponse.json(data);
  }
  const data = await db.select().from(agentExecutions).orderBy(desc(agentExecutions.createdAt));
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await db.insert(agentExecutions).values(body).returning();
  return NextResponse.json(result[0], { status: 201 });
}
