# NEXUS OS — AI Operating System

[![NEXUS OS](public/images/nexus-hero.jpg)](https://nexus-os.dev)

> An autonomous digital workforce for startups, agencies, and engineering teams.

## What is NEXUS OS?

NEXUS OS is a production-grade AI Operating System that acts as a complete digital workforce. Unlike chatbots, it functions as an autonomous company operating system capable of:

- **Planning** — Decomposes goals into actionable phases
- **Researching** — Market analysis, competitor research, technology evaluation
- **Designing** — System architecture, database schemas, API specifications
- **Building** — Code generation, CI/CD pipelines, deployment strategies
- **Documenting** — PRDs, architecture docs, API documentation
- **Managing** — Task tracking, progress monitoring, quality validation
- **Optimizing** — Cost analysis, security audits, performance tuning

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        NEXUS OS v2.0                         │
├─────────────────────────────────────────────────────────────┤
│  Next.js Frontend  │  API Routes  │  Agent Execution Engine  │
├─────────────────────────────────────────────────────────────┤
│  14 Specialized AI Agents  │  Memory  │  RAG  │  Workflows  │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL  │  Redis  │  Vector Store  │  Object Storage   │
└─────────────────────────────────────────────────────────────┘
```

## Multi-Agent Architecture

| Agent | Role | Model | Expertise |
|-------|------|-------|-----------|
| Manager | Orchestrator | GPT-4o | Workflow orchestration, validation |
| Founder | Business Strategy | GPT-4o | Market analysis, revenue models |
| Product Manager | Product Planning | GPT-4o | User stories, roadmaps, PRDs |
| Research | Intelligence | GPT-4o-mini | Competitor analysis, tech research |
| CTO | Technology | GPT-4o | Stack selection, scalability |
| Software Architect | System Design | GPT-4o | Database, API, microservices |
| AI Engineer | ML/AI Systems | GPT-4o | RAG, agent workflows, LLMs |
| Cloud Architect | Infrastructure | GPT-4o | AWS, security, cost optimization |
| DevOps | Operations | GPT-4o-mini | CI/CD, Kubernetes, monitoring |
| Security | Protection | GPT-4o | Threat modeling, compliance |
| Technical Writer | Documentation | GPT-4o | Architecture docs, API docs |
| QA | Quality Assurance | GPT-4o-mini | Test plans, validation |
| Sales | Revenue | GPT-4o-mini | Outreach, lead generation |
| Marketing | Growth | GPT-4o-mini | Campaigns, content strategy |

## Features

### Startup Builder Workflow
Input a goal like "Build an AI inventory management SaaS" and get a complete project dossier:

1. Market Analysis (TAM/SAM/SOM, business model canvas)
2. Competitor Research (feature matrix, pricing, gaps)
3. PRD Creation (user stories, MVP scope, success metrics)
4. Tech Stack Selection (with trade-off analysis)
5. System Architecture (database schema, API design)
6. AWS Infrastructure (service selection, cost estimates)
7. CI/CD Pipeline (GitHub Actions, deployment strategy)
8. Security Audit (STRIDE threat model, OWASP mitigation)
9. Technical Documentation (architecture docs, API docs)
10. Testing Plan (coverage targets, automation strategy)

### Enterprise RAG Pipeline
- PDF, DOCX, PPTX, TXT ingestion
- Website crawling
- GitHub repository analysis
- YouTube transcript processing
- Semantic search with cosine similarity
- Source citation tracking

### Live Agent Console
- Real-time SSE stream
- Active workflow monitoring
- Execution logs with timestamps
- Token usage and cost tracking

### Security & Compliance
- JWT authentication with bcrypt
- RBAC (admin, manager, member, viewer)
- Prompt injection detection
- XSS output validation
- Rate limiting
- Immutable audit logs

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Framer Motion, Recharts
- **Backend**: Next.js API Routes, Drizzle ORM
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **AI**: Vercel AI SDK, OpenAI GPT-4o / GPT-4o-mini
- **DevOps**: Docker, Docker Compose, Kubernetes, GitHub Actions

## Quick Start

### Prerequisites
- Node.js 22+
- PostgreSQL 16+
- Redis 7+ (optional)
- OpenAI API key

### Installation

```bash
# Clone repository
git clone https://github.com/sambuilds09/nexus-os.git
cd nexus-os

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your credentials

# Run database migrations
npx drizzle-kit push

# Seed database
npx tsx src/scripts/seed.ts

# Start development server
npm run dev
```

### Environment Variables

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app_db
JWT_SECRET=your-jwt-secret
OPENAI_API_KEY=sk-your-openai-api-key
REDIS_URL=redis://localhost:6379
```

### Docker

```bash
# Start full stack
docker-compose up -d

# View logs
docker-compose logs -f app
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | User registration |
| `/api/auth/login` | POST | User login |
| `/api/auth/me` | GET | Current user |
| `/api/workspaces` | CRUD | Workspace management |
| `/api/projects` | CRUD | Project management |
| `/api/tasks` | CRUD | Task management (Kanban) |
| `/api/agents` | CRUD | Agent fleet |
| `/api/workflows/execute` | POST | Start workflow |
| `/api/workflow-executions` | GET | Workflow status |
| `/api/knowledge` | POST/GET | RAG ingestion/search |
| `/api/memory` | POST/GET | Memory storage/retrieval |
| `/api/github/analyze` | POST | Repository analysis |
| `/api/console/stream` | SSE | Live execution stream |
| `/api/audit-logs` | GET | Security audit trail |
| `/api/stats` | GET | Dashboard statistics |

## Screenshots

| Dashboard | Startup Builder | Live Console |
|-----------|----------------|--------------|
| ![Dashboard](public/images/nexus-dashboard.jpg) | ![Builder](public/images/nexus-builder.jpg) | ![Console](public/images/nexus-console.jpg) |

| Agent Fleet | Knowledge Base | GitHub Intelligence |
|-----------|----------------|---------------------|
| ![Agents](public/images/nexus-agents.jpg) | ![Knowledge](public/images/nexus-knowledge.jpg) | ![GitHub](public/images/nexus-github.jpg) |

## Scaling

| Users | Architecture | Cost |
|-------|-------------|------|
| 100 | Single instance | $50-100/mo |
| 1,000 | 3 instances + read replica | $200-400/mo |
| 10,000 | K8s cluster + CDN | $1,000-2,000/mo |
| 100,000 | Multi-region + message queues | $5,000-10,000/mo |
| 1,000,000 | Event-driven microservices | $50,000-100,000/mo |

## License

MIT License — see [LICENSE](LICENSE) for details.

---

Built with 💜 by the NEXUS OS team.
