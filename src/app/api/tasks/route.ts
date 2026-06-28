import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  if (projectId) {
    const data = await db.select().from(tasks).where(eq(tasks.projectId, Number(projectId))).orderBy(desc(tasks.createdAt));
    return NextResponse.json(data);
  }
  const data = await db.select().from(tasks).orderBy(desc(tasks.createdAt));
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await db.insert(tasks).values(body).returning();
  return NextResponse.json(result[0], { status: 201 });
}
