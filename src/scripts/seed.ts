import { db } from "@/db";
import { workspaces, projects, tasks, agents, documents, conversations, agentExecutions, workflows, workflowExecutions, users, auditLogs } from "@/db/schema";
import { hashPassword } from "@/lib/security";
import { sql } from "drizzle-orm";

async function seed() {
  // Clear existing data (respect foreign keys)
  await db.delete(auditLogs);
  await db.delete(agentExecutions);
  await db.delete(workflowExecutions);
  await db.delete(workflows);
  await db.delete(conversations);
  await db.delete(documents);
  await db.delete(tasks);
  await db.delete(projects);
  await db.delete(agents);
  await db.delete(workspaces);
  await db.delete(users);

  // Reset sequences
  await db.execute(sql`ALTER SEQUENCE workspaces_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE projects_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE tasks_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE agents_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE documents_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE conversations_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE agent_executions_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE workflows_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE workflow_executions_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE users_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE audit_logs_id_seq RESTART WITH 1`);

  // Seed admin user
  const passwordHash = await hashPassword("admin123");
  const [adminUser] = await db.insert(users).values({
    email: "admin@nexus-os.dev",
    name: "System Admin",
    passwordHash,
    role: "admin",
  }).returning();

  // Seed workspaces
  const ws = await db.insert(workspaces).values({
    name: "CloudInventory SaaS",
    description: "A cloud-based inventory management platform for SMBs",
    type: "saas",
    goal: "Build a cloud-based inventory management SaaS that helps small and medium businesses track stock, manage suppliers, and forecast demand using AI.",
    status: "active",
  }).returning();
  const workspaceId = ws[0].id;

  const ws2 = await db.insert(workspaces).values({
    name: "Nexus AI Research",
    description: "Internal R&D for multi-agent orchestration",
    type: "research",
    goal: "Research and develop next-generation multi-agent orchestration frameworks.",
    status: "active",
  }).returning();

  // Seed projects
  const proj = await db.insert(projects).values({
    workspaceId,
    name: "MVP Development",
    description: "Core platform MVP with inventory tracking and dashboard",
    status: "in_progress",
    progress: 45,
  }).returning();
  const projectId = proj[0].id;

  const proj2 = await db.insert(projects).values({
    workspaceId,
    name: "AI Demand Forecasting",
    description: "Machine learning module for inventory demand prediction",
    status: "planning",
    progress: 10,
  }).returning();

  await db.insert(projects).values({
    workspaceId: ws2[0].id,
    name: "Agent Communication Protocol",
    description: "Standardized messaging protocol between agents",
    status: "in_progress",
    progress: 62,
  });

  // Seed tasks
  await db.insert(tasks).values([
    { projectId, title: "Design database schema", description: "Create PostgreSQL schema for inventory, products, and users", status: "done", priority: "high", assignedAgent: "Software Architect", estimatedHours: 8, actualHours: 6 },
    { projectId, title: "Set up CI/CD pipeline", description: "Configure GitHub Actions for automated testing and deployment", status: "in_progress", priority: "high", assignedAgent: "DevOps Agent", estimatedHours: 6, actualHours: 4 },
    { projectId, title: "Build REST API", description: "Develop FastAPI endpoints for CRUD operations", status: "in_progress", priority: "critical", assignedAgent: "CTO Agent", estimatedHours: 16, actualHours: 8 },
    { projectId, title: "Create React frontend", description: "Build dashboard UI with Next.js and Tailwind", status: "todo", priority: "high", assignedAgent: "AI Engineer", estimatedHours: 20 },
    { projectId, title: "Write API documentation", description: "Generate OpenAPI spec and developer docs", status: "todo", priority: "medium", assignedAgent: "Technical Writer", estimatedHours: 6 },
    { projectId, title: "Security audit", description: "Perform threat modeling and security review", status: "todo", priority: "critical", assignedAgent: "Security Agent", estimatedHours: 10 },
    { projectId: proj2[0].id, title: "Research ML models", description: "Evaluate forecasting models for inventory prediction", status: "in_progress", priority: "high", assignedAgent: "Research Agent", estimatedHours: 12, actualHours: 5 },
  ]);

  // Seed agents with system prompts
  const agentData = [
    { name: "Manager Agent", role: "manager", description: "Orchestrates all agents, validates outputs, and makes final decisions.", avatar: "MG", color: "#8b5cf6", status: "idle" as const, capabilities: ["Planning", "Delegation", "Validation", "Decision Making"], tools: ["workflow_orchestrator", "quality_validator", "result_aggregator"], systemPrompt: "You are the Manager Agent of NEXUS OS. Orchestrate all other agents, validate outputs, and make final decisions.", model: "gpt-4o", temperature: 0.3, totalTasksCompleted: 142, successRate: 98, totalTokensUsed: 450000, totalCost: 4500 },
    { name: "Founder Agent", role: "founder", description: "Defines business strategy, market validation, revenue models, and pricing.", avatar: "FD", color: "#f59e0b", status: "idle" as const, capabilities: ["Business Strategy", "Market Validation", "Revenue Modeling", "Pricing"], tools: ["market_analyzer", "competitor_tracker", "financial_modeler"], systemPrompt: "You are the Founder Agent. Think like a startup founder and serial entrepreneur.", model: "gpt-4o", temperature: 0.7, totalTasksCompleted: 89, successRate: 95, totalTokensUsed: 280000, totalCost: 2800 },
    { name: "Product Manager", role: "product_manager", description: "Creates user stories, roadmaps, and feature specifications.", avatar: "PM", color: "#10b981", status: "idle" as const, capabilities: ["User Stories", "Roadmaps", "Feature Planning", "Backlog Management"], tools: ["prd_generator", "roadmap_planner", "feature_prioritizer"], systemPrompt: "You are the Product Manager Agent. Bridge user needs, business goals, and technical feasibility.", model: "gpt-4o", temperature: 0.5, totalTasksCompleted: 156, successRate: 97, totalTokensUsed: 320000, totalCost: 3200 },
    { name: "Research Agent", role: "research", description: "Conducts market analysis, competitor research, and technology research.", avatar: "RS", color: "#3b82f6", status: "idle" as const, capabilities: ["Market Analysis", "Competitor Research", "Technology Research", "Trend Analysis"], tools: ["web_scraper", "data_analyzer", "report_generator"], systemPrompt: "You are the Research Agent. Gather and synthesize information from multiple sources.", model: "gpt-4o-mini", temperature: 0.4, totalTasksCompleted: 112, successRate: 94, totalTokensUsed: 150000, totalCost: 225 },
    { name: "CTO Agent", role: "cto", description: "Selects technology stack and plans for scalability.", avatar: "CT", color: "#ef4444", status: "idle" as const, capabilities: ["Technology Selection", "Scalability Planning", "Architecture Review", "Tech Leadership"], tools: ["stack_evaluator", "scalability_analyzer", "adr_generator"], systemPrompt: "You are the CTO Agent. Make high-stakes technology decisions for startups and enterprises.", model: "gpt-4o", temperature: 0.3, totalTasksCompleted: 134, successRate: 99, totalTokensUsed: 380000, totalCost: 3800 },
    { name: "Software Architect", role: "architect", description: "Designs system architecture, database schemas, and APIs.", avatar: "SA", color: "#6366f1", status: "idle" as const, capabilities: ["System Design", "Database Design", "API Design", "Microservices"], tools: ["schema_designer", "api_designer", "diagram_generator"], systemPrompt: "You are the Software Architect Agent. Design systems that scale from 100 to 1,000,000 users.", model: "gpt-4o", temperature: 0.2, totalTasksCompleted: 178, successRate: 98, totalTokensUsed: 420000, totalCost: 4200 },
    { name: "AI Engineer", role: "ai_engineer", description: "Builds RAG pipelines, agent workflows, and selects LLMs.", avatar: "AI", color: "#ec4899", status: "idle" as const, capabilities: ["RAG Systems", "Agent Workflows", "LLM Selection", "Prompt Engineering"], tools: ["rag_builder", "prompt_optimizer", "model_evaluator"], systemPrompt: "You are the AI Engineer Agent. Design and implement AI/ML systems.", model: "gpt-4o", temperature: 0.4, totalTasksCompleted: 95, successRate: 92, totalTokensUsed: 310000, totalCost: 3100 },
    { name: "Cloud Architect", role: "cloud_architect", description: "Designs AWS infrastructure, security, and cost optimization.", avatar: "CL", color: "#06b6d4", status: "idle" as const, capabilities: ["AWS Design", "Security", "Cost Optimization", "Infrastructure"], tools: ["aws_designer", "cost_calculator", "security_scanner"], systemPrompt: "You are the Cloud Architect Agent. Design cloud infrastructure on AWS, GCP, and Azure.", model: "gpt-4o", temperature: 0.3, totalTasksCompleted: 87, successRate: 96, totalTokensUsed: 260000, totalCost: 2600 },
    { name: "DevOps Agent", role: "devops", description: "Manages CI/CD, deployment, and monitoring infrastructure.", avatar: "DO", color: "#84cc16", status: "idle" as const, capabilities: ["CI/CD", "Deployment", "Monitoring", "Infrastructure as Code"], tools: ["pipeline_builder", "deploy_automator", "monitor_setup"], systemPrompt: "You are the DevOps Agent. Build CI/CD pipelines and operational excellence.", model: "gpt-4o-mini", temperature: 0.3, totalTasksCompleted: 203, successRate: 99, totalTokensUsed: 180000, totalCost: 270 },
    { name: "Security Agent", role: "security", description: "Performs threat analysis and security reviews.", avatar: "SC", color: "#dc2626", status: "idle" as const, capabilities: ["Threat Analysis", "Security Reviews", "Penetration Testing", "Compliance"], tools: ["threat_modeler", "vuln_scanner", "compliance_checker"], systemPrompt: "You are the Security Agent. Protect systems from threats.", model: "gpt-4o", temperature: 0.2, totalTasksCompleted: 76, successRate: 100, totalTokensUsed: 220000, totalCost: 2200 },
    { name: "Technical Writer", role: "writer", description: "Creates documentation and architecture docs.", avatar: "TW", color: "#14b8a6", status: "idle" as const, capabilities: ["Documentation", "Architecture Docs", "API Docs", "User Guides"], tools: ["doc_generator", "api_doc_builder", "readme_writer"], systemPrompt: "You are the Technical Writer Agent. Create world-class documentation.", model: "gpt-4o", temperature: 0.5, totalTasksCompleted: 145, successRate: 98, totalTokensUsed: 290000, totalCost: 2900 },
    { name: "QA Agent", role: "qa", description: "Develops testing plans and validates deliverables.", avatar: "QA", color: "#f97316", status: "idle" as const, capabilities: ["Testing Plans", "Validation", "Automation", "Bug Tracking"], tools: ["test_planner", "coverage_analyzer", "bug_reporter"], systemPrompt: "You are the QA Agent. Ensure quality through systematic testing.", model: "gpt-4o-mini", temperature: 0.3, totalTasksCompleted: 198, successRate: 97, totalTokensUsed: 160000, totalCost: 240 },
    { name: "Sales Agent", role: "sales", description: "Handles outreach and lead generation.", avatar: "SL", color: "#eab308", status: "idle" as const, capabilities: ["Outreach", "Lead Generation", "CRM", "Deal Closing"], tools: ["email_generator", "lead_scorer", "pitch_writer"], systemPrompt: "You are the Sales Agent. Generate leads and close deals.", model: "gpt-4o-mini", temperature: 0.7, totalTasksCompleted: 67, successRate: 88, totalTokensUsed: 90000, totalCost: 135 },
    { name: "Marketing Agent", role: "marketing", description: "Plans campaigns and content strategy.", avatar: "MK", color: "#a855f7", status: "idle" as const, capabilities: ["Campaigns", "Content Strategy", "SEO", "Social Media"], tools: ["campaign_planner", "seo_optimizer", "content_generator"], systemPrompt: "You are the Marketing Agent. Build brands and drive demand.", model: "gpt-4o-mini", temperature: 0.7, totalTasksCompleted: 54, successRate: 91, totalTokensUsed: 75000, totalCost: 112 },
  ];

  const insertedAgents = await db.insert(agents).values(agentData).returning();

  // Seed documents
  await db.insert(documents).values([
    { workspaceId, projectId, title: "Product Requirements Document", type: "prd", content: "# PRD: CloudInventory SaaS\n\n## Overview\nCloudInventory is a cloud-based inventory management platform...", author: "Product Manager", version: "1.2" },
    { workspaceId, projectId, title: "System Architecture Diagram", type: "architecture", content: "# Architecture\n\n## High-Level Design\n- Next.js Frontend\n- FastAPI Backend\n- PostgreSQL Database\n- Redis Cache\n- ChromaDB Vector Store\n", author: "Software Architect", version: "1.0" },
    { workspaceId, projectId, title: "Database Schema Design", type: "database_schema", content: "# Database Schema\n\n## Tables\n- users\n- products\n- inventory\n- suppliers\n- orders\n", author: "Software Architect", version: "1.1" },
    { workspaceId, projectId, title: "API Specification", type: "api_spec", content: "# API Spec\n\n## Authentication\nJWT-based auth with refresh tokens.\n\n## Endpoints\nGET /api/v1/products\nPOST /api/v1/products\n...", author: "CTO Agent", version: "1.0" },
    { workspaceId, title: "Development Roadmap Q1-Q4", type: "roadmap", content: "# Roadmap\n\n## Q1: MVP\n- Core inventory tracking\n- Basic dashboard\n\n## Q2: AI Features\n- Demand forecasting\n- Automated reordering\n", author: "Product Manager", version: "2.0" },
    { workspaceId, title: "Investor Pitch Deck", type: "pitch", content: "# Pitch Deck\n\n## Problem\nSMBs lose $1.1T annually due to poor inventory management.\n\n## Solution\nAI-powered inventory platform...", author: "Founder Agent", version: "1.0" },
  ]);

  // Seed conversations
  await db.insert(conversations).values([
    { workspaceId, title: "MVP Planning Session", messages: [
      { role: "user", content: "Let's plan the MVP for CloudInventory", timestamp: new Date().toISOString() },
      { role: "assistant", content: "I'll coordinate with the Product Manager and Software Architect to define the MVP scope.", agent: "Manager Agent", timestamp: new Date().toISOString() },
      { role: "assistant", content: "Based on market research, the MVP should include: inventory tracking, supplier management, and a basic dashboard.", agent: "Product Manager", timestamp: new Date().toISOString() },
    ]},
  ]);

  // Seed agent executions
  await db.insert(agentExecutions).values([
    { agentId: insertedAgents[0].id, workspaceId, input: "Plan MVP for CloudInventory", output: "MVP plan created with 6 phases", tokensUsed: 1240, cost: 12, latency: 2300, status: "completed", metadata: { model: "gpt-4o" } },
    { agentId: insertedAgents[2].id, workspaceId, input: "Create user stories for inventory tracking", output: "15 user stories generated", tokensUsed: 890, cost: 8, latency: 1800, status: "completed", metadata: { model: "gpt-4o" } },
    { agentId: insertedAgents[4].id, workspaceId, input: "Select tech stack for SaaS platform", output: "Recommended: Next.js + FastAPI + PostgreSQL", tokensUsed: 1560, cost: 15, latency: 3200, status: "completed", metadata: { model: "gpt-4o" } },
    { agentId: insertedAgents[5].id, workspaceId, taskId: 1, input: "Design database schema", output: "Schema with 12 tables designed", tokensUsed: 2100, cost: 21, latency: 4100, status: "completed", metadata: { model: "gpt-4o" } },
    { agentId: insertedAgents[8].id, workspaceId, taskId: 2, input: "Set up CI/CD pipeline", output: "GitHub Actions workflow configured", tokensUsed: 1340, cost: 13, latency: 2800, status: "running", metadata: { model: "gpt-4o-mini" } },
  ]);

  // Seed workflows
  const [workflow] = await db.insert(workflows).values({
    workspaceId,
    name: "Startup Builder",
    description: "Complete startup building workflow from idea to deployment",
    type: "startup_builder",
    definition: {
      steps: [
        { id: "founder_analysis", agent: "founder", prompt: "Analyze the market opportunity" },
        { id: "research_competitors", agent: "research", prompt: "Research competitors" },
        { id: "product_prd", agent: "product_manager", prompt: "Create PRD" },
        { id: "cto_techstack", agent: "cto", prompt: "Select tech stack" },
        { id: "architect_design", agent: "architect", prompt: "Design system architecture" },
      ],
    },
  }).returning();

  // Seed workflow execution
  await db.insert(workflowExecutions).values({
    workflowId: workflow.id,
    workspaceId,
    goal: "Build a cloud-based inventory management SaaS",
    status: "completed",
    progress: 100,
    currentStep: 5,
    totalSteps: 5,
    tokensUsed: 8500,
    cost: 85,
    startedAt: new Date(Date.now() - 3600000),
    completedAt: new Date(),
    logs: [
      { timestamp: new Date(Date.now() - 3600000).toISOString(), level: "info", message: "Workflow started: Startup Builder" },
      { timestamp: new Date(Date.now() - 3000000).toISOString(), level: "info", message: "Step 1 completed: Founder Agent market analysis", agent: "Founder Agent" },
      { timestamp: new Date(Date.now() - 2400000).toISOString(), level: "info", message: "Step 2 completed: Research Agent competitor analysis", agent: "Research Agent" },
      { timestamp: new Date(Date.now() - 1800000).toISOString(), level: "info", message: "Step 3 completed: Product Manager PRD", agent: "Product Manager" },
      { timestamp: new Date(Date.now() - 1200000).toISOString(), level: "info", message: "Step 4 completed: CTO tech stack selection", agent: "CTO Agent" },
      { timestamp: new Date(Date.now() - 600000).toISOString(), level: "info", message: "Step 5 completed: Software Architect system design", agent: "Software Architect" },
      { timestamp: new Date().toISOString(), level: "info", message: "Workflow completed successfully" },
    ],
  });

  // Seed audit logs
  await db.insert(auditLogs).values([
    { userId: adminUser.id, workspaceId, action: "create", resource: "workspace", resourceId: workspaceId, details: { name: "CloudInventory SaaS" }, ipAddress: "127.0.0.1" },
    { userId: adminUser.id, workspaceId, action: "execute", resource: "workflow", details: { workflowType: "startup_builder" }, ipAddress: "127.0.0.1" },
    { userId: adminUser.id, action: "login", details: { method: "password" }, ipAddress: "127.0.0.1" },
  ]);

  console.log("Seed completed successfully");
}

seed().catch(console.error);
