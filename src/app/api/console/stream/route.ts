import { NextRequest } from "next/server";
import { db } from "@/db";
import { workflowExecutions, agentExecutions } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      send({ type: "connected", message: "Console stream connected" });

      const interval = setInterval(async () => {
        try {
          const [activeWorkflows] = await db.select({ count: sql<number>`count(*)` })
            .from(workflowExecutions)
            .where(eq(workflowExecutions.status, "running"));

          const recentExecutions = await db.select()
            .from(agentExecutions)
            .orderBy(desc(agentExecutions.createdAt))
            .limit(10);

          const recentWorkflows = await db.select()
            .from(workflowExecutions)
            .orderBy(desc(workflowExecutions.createdAt))
            .limit(5);

          send({
            type: "update",
            timestamp: new Date().toISOString(),
            activeWorkflows: activeWorkflows.count,
            recentExecutions,
            recentWorkflows,
          });
        } catch (e) {
          send({ type: "error", message: String(e) });
        }
      }, 3000);

      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
