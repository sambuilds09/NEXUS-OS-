import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { githubRepos } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");
  if (workspaceId) {
    const data = await db.select().from(githubRepos).where(eq(githubRepos.workspaceId, Number(workspaceId))).orderBy(desc(githubRepos.createdAt));
    return NextResponse.json(data);
  }
  const data = await db.select().from(githubRepos).orderBy(desc(githubRepos.createdAt)).limit(50);
  return NextResponse.json(data);
}
