import { NextRequest, NextResponse } from "next/server";
import { analyzeGitHubRepo } from "@/lib/github";

export async function POST(req: NextRequest) {
  const { url, workspaceId } = await req.json();

  if (!url) {
    return NextResponse.json({ error: "url required" }, { status: 400 });
  }

  try {
    const result = await analyzeGitHubRepo(url, workspaceId ? Number(workspaceId) : undefined);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
