import { NextResponse } from "next/server";
import { db } from "@/db";
import { workspaces, projects, tasks, agents, documents, agentExecutions } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  const [workspaceCount] = await db.select({ count: sql<number>`count(*)` }).from(workspaces);
  const [projectCount] = await db.select({ count: sql<number>`count(*)` }).from(projects);
  const [taskCount] = await db.select({ count: sql<number>`count(*)` }).from(tasks);
  const [agentCount] = await db.select({ count: sql<number>`count(*)` }).from(agents);
  const [documentCount] = await db.select({ count: sql<number>`count(*)` }).from(documents);
  const [executionCount] = await db.select({ count: sql<number>`count(*)` }).from(agentExecutions);

  const taskStatusCounts = await db.select({
    status: tasks.status,
    count: sql<number>`count(*)`,
  }).from(tasks).groupBy(tasks.status);

  const recentExecutions = await db.select().from(agentExecutions).orderBy(sql`${agentExecutions.createdAt} desc`).limit(10);

  return NextResponse.json({
    workspaces: workspaceCount.count,
    projects: projectCount.count,
    tasks: taskCount.count,
    agents: agentCount.count,
    documents: documentCount.count,
    executions: executionCount.count,
    taskStatusCounts,
    recentExecutions,
  });
}
