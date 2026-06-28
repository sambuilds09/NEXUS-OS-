import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { workflowExecutions, workflowSteps } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const exec = await db.select().from(workflowExecutions).where(eq(workflowExecutions.id, Number(id)));
  if (!exec.length) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const steps = await db.select().from(workflowSteps).where(eq(workflowSteps.executionId, Number(id))).orderBy(workflowSteps.stepIndex);

  return NextResponse.json({ ...exec[0], steps });
}
