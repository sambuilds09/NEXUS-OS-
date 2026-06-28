import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { workspaces } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const data = await db.select().from(workspaces).orderBy(desc(workspaces.createdAt));
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await db.insert(workspaces).values(body).returning();
  return NextResponse.json(result[0], { status: 201 });
}
