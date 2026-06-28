import { NextRequest, NextResponse } from "next/server";
import { runWorkflow, STARTUP_BUILDER_WORKFLOW } from "@/lib/agent-engine";

export async function POST(req: NextRequest) {
  const { goal, workspaceId, workflowType = "startup_builder" } = await req.json();

  if (!goal || !workspaceId) {
    return NextResponse.json({ error: "goal and workspaceId required" }, { status: 400 });
  }

  // Check for prompt injection
  const { detectPromptInjection } = await import("@/lib/security");
  const injection = detectPromptInjection(goal);
  if (injection.detected) {
    return NextResponse.json({ error: "Prompt injection detected", pattern: injection.pattern }, { status: 400 });
  }

  try {
    const workflowDef = workflowType === "startup_builder" ? STARTUP_BUILDER_WORKFLOW : STARTUP_BUILDER_WORKFLOW;
    const executionId = await runWorkflow(workflowDef, goal, Number(workspaceId));
    return NextResponse.json({ executionId, status: "started" });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
