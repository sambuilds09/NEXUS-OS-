import { db } from "@/db";
import { knowledgeSources, knowledgeChunks, memories } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

// Simple text chunking strategy
export function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    let chunkEnd = end;
    // Try to break at sentence boundary
    if (end < text.length) {
      const lastPeriod = text.lastIndexOf(".", end);
      const lastNewline = text.lastIndexOf("\n", end);
      const breakPoint = Math.max(lastPeriod, lastNewline);
      if (breakPoint > start + chunkSize / 2) {
        chunkEnd = breakPoint + 1;
      }
    }
    chunks.push(text.slice(start, chunkEnd).trim());
    start = chunkEnd - overlap;
    if (start < 0) start = 0;
    if (start >= text.length - overlap) break;
  }
  return chunks.filter(c => c.length > 50);
}

// Simple embedding simulation (in production, use OpenAI embeddings API)
export async function generateEmbedding(text: string): Promise<number[]> {
  // Hash-based deterministic embedding for demo
  // In production: return openai.embeddings.create({ model: "text-embedding-3-small", input: text })
  const embedding: number[] = [];
  const hash = simpleHash(text);
  for (let i = 0; i < 1536; i++) {
    embedding.push(Math.sin(hash * (i + 1) * 0.001) * 0.5 + 0.5);
  }
  return embedding;
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Cosine similarity between embeddings
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function ingestKnowledge(
  workspaceId: number,
  name: string,
  type: "pdf" | "docx" | "pptx" | "txt" | "website" | "github" | "youtube" | "markdown",
  content: string,
  sourceUrl?: string,
  metadata?: any
): Promise<number> {
  // Create source record
  const [source] = await db.insert(knowledgeSources).values({
    workspaceId,
    name,
    type,
    sourceUrl,
    content: content.slice(0, 50000),
    fileSize: content.length,
    metadata,
    status: "processing",
  }).returning();

  // Chunk content
  const chunks = chunkText(content);

  // Store chunks with embeddings
  for (let i = 0; i < chunks.length; i++) {
    const embedding = await generateEmbedding(chunks[i]);
    await db.insert(knowledgeChunks).values({
      sourceId: source.id,
      workspaceId,
      content: chunks[i],
      embedding,
      chunkIndex: i,
      metadata: { sourceName: name, sourceType: type, chunkIndex: i },
    });
  }

  // Update source
  await db.update(knowledgeSources)
    .set({ chunkCount: chunks.length, status: "ready" })
    .where(eq(knowledgeSources.id, source.id));

  return source.id;
}

export async function retrieveKnowledge(
  workspaceId: number,
  query: string,
  topK: number = 5
): Promise<Array<{ content: string; source: string; similarity: number; metadata: any }>> {
  const queryEmbedding = await generateEmbedding(query);

  const chunks = await db.select()
    .from(knowledgeChunks)
    .where(eq(knowledgeChunks.workspaceId, workspaceId));

  const scored = chunks.map(chunk => ({
    chunk,
    similarity: cosineSimilarity(queryEmbedding, (chunk.embedding as number[]) || []),
  }));

  scored.sort((a, b) => b.similarity - a.similarity);

  const topChunks = scored.slice(0, topK);

  // Fetch source names
  const sourceIds = [...new Set(topChunks.map(c => c.chunk.sourceId))];
  const sources = await db.select()
    .from(knowledgeSources)
    .where(sql`${knowledgeSources.id} IN (${sql.join(sourceIds.map(id => sql`${id}`))})`);

  const sourceMap = new Map(sources.map(s => [s.id, s]));

  return topChunks.map(({ chunk, similarity }) => ({
    content: chunk.content,
    source: sourceMap.get(chunk.sourceId)?.name || "Unknown",
    similarity: Math.round(similarity * 100) / 100,
    metadata: chunk.metadata,
  }));
}

export async function getKnowledgeSources(workspaceId: number) {
  return db.select()
    .from(knowledgeSources)
    .where(eq(knowledgeSources.workspaceId, workspaceId))
    .orderBy(desc(knowledgeSources.createdAt));
}
