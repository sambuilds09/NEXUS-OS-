import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { agents } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const data = await db.select().from(agents).orderBy(desc(agents.createdAt));
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await db.insert(agents).values(body).returning();
  return NextResponse.json(result[0], { status: 201 });
}
