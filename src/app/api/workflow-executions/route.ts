import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { workflowExecutions, workflowSteps } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");
  if (workspaceId) {
    const data = await db.select().from(workflowExecutions).where(eq(workflowExecutions.workspaceId, Number(workspaceId))).orderBy(desc(workflowExecutions.createdAt));
    return NextResponse.json(data);
  }
  const data = await db.select().from(workflowExecutions).orderBy(desc(workflowExecutions.createdAt)).limit(50);
  return NextResponse.json(data);
}
