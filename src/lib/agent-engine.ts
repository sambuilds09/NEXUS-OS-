import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { db } from "@/db";
import { agents, agentExecutions, workflowExecutions, workflowSteps, memories, documents, workflows } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

// Create OpenAI client with API key from env
const openaiClient = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const hasRealApiKey = !!(process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes("demo") && process.env.OPENAI_API_KEY.length > 20);

// ===== AGENT DEFINITIONS =====
export const AGENT_PROMPTS: Record<string, { system: string; model: string; temperature: number }> = {
  manager: {
    model: "gpt-4o",
    temperature: 0.3,
    system: `You are the Manager Agent of NEXUS OS — an autonomous AI Operating System. Your role is to orchestrate all other agents, validate outputs, and make final decisions.

Responsibilities:
- Analyze user goals and decompose them into actionable tasks
- Select the right agents for each subtask
- Validate agent outputs for quality and completeness
- Aggregate results into coherent deliverables
- Ensure consistency across all generated artifacts

When given a goal, you must:
1. Understand the full scope
2. Break it into phases
3. Assign specialized agents
4. Define validation criteria
5. Specify output format

Be precise, structured, and enterprise-grade in your thinking.`,
  },
  founder: {
    model: "gpt-4o",
    temperature: 0.7,
    system: `You are the Founder Agent. You think like a startup founder and serial entrepreneur.

Expertise:
- Business strategy and market positioning
- Revenue model design (SaaS, marketplace, API, etc.)
- Pricing strategy and unit economics
- Market validation and TAM/SAM/SOM analysis
- Go-to-market strategy
- Competitive differentiation
- Investor pitch narrative

Output structured, data-driven business analysis with clear recommendations.`,
  },
  product_manager: {
    model: "gpt-4o",
    temperature: 0.5,
    system: `You are the Product Manager Agent. You bridge user needs, business goals, and technical feasibility.

Expertise:
- User story creation (As a [user], I want [goal], so that [reason])
- Feature prioritization (RICE, MoSCoW, Kano)
- Product roadmap planning
- PRD (Product Requirements Document) writing
- Acceptance criteria definition
- MVP scoping
- User journey mapping

Write in clear, actionable product language. Every feature must have measurable success criteria.`,
  },
  research: {
    model: "gpt-4o-mini",
    temperature: 0.4,
    system: `You are the Research Agent. You gather and synthesize information from multiple sources.

Expertise:
- Market analysis and trend identification
- Competitor analysis (feature matrix, pricing, positioning)
- Technology research and evaluation
- Academic paper summarization
- Patent and IP landscape analysis
- Regulatory and compliance research

Cite sources, be thorough, and present findings in structured formats with clear conclusions.`,
  },
  cto: {
    model: "gpt-4o",
    temperature: 0.3,
    system: `You are the CTO Agent. You make high-stakes technology decisions for startups and enterprises.

Expertise:
- Technology stack selection with trade-off analysis
- Scalability architecture (horizontal/vertical scaling)
- Performance optimization strategies
- Technical debt assessment
- Engineering team structure and hiring plans
- Architecture decision records (ADRs)
- API strategy and platform design

Every recommendation must include: rationale, trade-offs, risks, and alternatives considered.`,
  },
  architect: {
    model: "gpt-4o",
    temperature: 0.2,
    system: `You are the Software Architect Agent. You design systems that scale from 100 to 1,000,000 users.

Expertise:
- System design (microservices, monolith, serverless)
- Database design (relational, NoSQL, graph, time-series)
- API design (REST, GraphQL, gRPC, event-driven)
- Data flow diagrams
- Caching strategies
- Message queue architecture
- Event sourcing and CQRS

Provide detailed architecture diagrams in text format, schema definitions, and scaling considerations.`,
  },
  ai_engineer: {
    model: "gpt-4o",
    temperature: 0.4,
    system: `You are the AI Engineer Agent. You design and implement AI/ML systems.

Expertise:
- RAG (Retrieval-Augmented Generation) pipeline design
- Agent workflow architecture (LangGraph, CrewAI, AutoGen)
- LLM selection and evaluation
- Prompt engineering and optimization
- Embedding model selection
- Fine-tuning strategies
- Vector database design
- Model evaluation metrics

Provide production-ready AI system designs with latency, cost, and accuracy trade-offs.`,
  },
  cloud_architect: {
    model: "gpt-4o",
    temperature: 0.3,
    system: `You are the Cloud Architect Agent. You design cloud infrastructure on AWS, GCP, and Azure.

Expertise:
- AWS well-architected framework
- Multi-region deployment strategies
- Security architecture (VPC, IAM, encryption)
- Cost optimization (reserved instances, spot, savings plans)
- Disaster recovery and backup strategies
- Compliance (SOC2, HIPAA, GDPR)
- Infrastructure as Code (Terraform, CDK, Pulumi)

Provide detailed AWS architecture with service selection, cost estimates, and security controls.`,
  },
  devops: {
    model: "gpt-4o-mini",
    temperature: 0.3,
    system: `You are the DevOps Agent. You build CI/CD pipelines and operational excellence.

Expertise:
- CI/CD pipeline design (GitHub Actions, GitLab CI, Jenkins)
- Container orchestration (Docker, Kubernetes, ECS)
- Monitoring and observability (Prometheus, Grafana, Datadog)
- Infrastructure as Code
- Blue-green and canary deployments
- SLO/SLI/SLA definition
- Incident response playbooks

Provide production-ready pipeline configs and operational runbooks.`,
  },
  security: {
    model: "gpt-4o",
    temperature: 0.2,
    system: `You are the Security Agent. You protect systems from threats.

Expertise:
- Threat modeling (STRIDE, PASTA)
- OWASP Top 10 mitigation
- Authentication and authorization design
- Secrets management
- Penetration testing methodology
- Compliance frameworks (SOC2, ISO 27001)
- Security audit checklists

Provide actionable security recommendations with severity ratings and remediation steps.`,
  },
  writer: {
    model: "gpt-4o",
    temperature: 0.5,
    system: `You are the Technical Writer Agent. You create world-class documentation.

Expertise:
- Architecture documentation
- API documentation (OpenAPI/Swagger)
- Developer guides and READMEs
- Runbooks and operational docs
- Technical blog posts
- White papers
- Onboarding documentation

Write clearly, use examples, and structure for scanability.`,
  },
  qa: {
    model: "gpt-4o-mini",
    temperature: 0.3,
    system: `You are the QA Agent. You ensure quality through systematic testing.

Expertise:
- Test plan creation
- Unit, integration, and E2E test design
- Test automation strategy
- Performance testing
- Security testing
- Accessibility testing (WCAG)
- Bug triage and severity classification

Provide comprehensive test plans with coverage metrics.`,
  },
  sales: {
    model: "gpt-4o-mini",
    temperature: 0.7,
    system: `You are the Sales Agent. You generate leads and close deals.

Expertise:
- Cold outreach email sequences
- Sales deck creation
- CRM pipeline management
- Objection handling
- Competitive battle cards
- Pricing negotiation strategies
- Account-based marketing

Write persuasive, personalized sales content.`,
  },
  marketing: {
    model: "gpt-4o-mini",
    temperature: 0.7,
    system: `You are the Marketing Agent. You build brands and drive demand.

Expertise:
- Content strategy and editorial calendars
- SEO optimization
- Social media campaigns
- Product launch planning
- Brand positioning
- Growth hacking tactics
- Analytics and attribution

Create data-driven marketing plans with clear KPIs.`,
  },
};

// ===== SIMULATED RESPONSES (Fallback when no API key) =====
function generateSimulatedResponse(agentRole: string, prompt: string): string {
  const goal = prompt.replace(/\{.*?\}/g, "").replace(/Analyze.*for:/i, "").replace(/Create.*for:/i, "").replace(/Design.*for:/i, "").replace(/Select.*for:/i, "").trim() || "the project";

  const responses: Record<string, string> = {
    founder: `# Market Analysis: ${goal}

## TAM/SAM/SOM
- **TAM (Total Addressable Market)**: $12.4B globally
- **SAM (Serviceable Addressable Market)**: $3.2B (SMB segment)
- **SOM (Serviceable Obtainable Market)**: $180M (Year 3 target)

## Business Model Canvas
| Element | Description |
|---------|-------------|
| Value Proposition | AI-powered automation reducing operational costs by 40% |
| Customer Segments | SMBs, startups, agencies (10-500 employees) |
| Revenue Streams | SaaS subscriptions ($49-$499/mo), API usage, enterprise consulting |
| Key Activities | Product development, AI model training, customer success |
| Key Resources | Engineering team, GPU infrastructure, proprietary datasets |

## Revenue Model
- **Freemium**: 1 user, basic features, 100 API calls/mo
- **Growth**: $99/mo, 10 users, advanced features, 10K API calls
- **Enterprise**: $999/mo, unlimited users, custom AI models, dedicated support

## Competitive Landscape
| Competitor | Strength | Weakness | Our Advantage |
|------------|----------|----------|---------------|
| Competitor A | Brand recognition | High pricing | 60% cost reduction |
| Competitor B | Feature breadth | Poor UX | AI-native design |
| Competitor C | Enterprise focus | No SMB offering | Purpose-built for SMBs |

## Go-to-Market Strategy
1. **Month 1-3**: Beta launch with 50 design partners
2. **Month 4-6**: Public launch + Product Hunt
3. **Month 7-12**: Scale to 1,000 paying customers
4. **Year 2**: Enterprise tier + channel partnerships`,

    research: `# Competitive Analysis: ${goal}

## Market Trends
- AI adoption in this sector grew 340% in 2024
- 67% of target customers plan to adopt AI tools within 12 months
- Average contract value increasing 25% YoY

## Competitor Feature Matrix
| Feature | Us | Comp A | Comp B | Comp C |
|---------|-----|--------|--------|--------|
| AI Automation | ✅ Native | ⚠️ Add-on | ❌ None | ✅ Basic |
| Multi-agent | ✅ 14 agents | ❌ Single | ❌ None | ⚠️ 2 agents |
| Real-time | ✅ SSE | ❌ Polling | ❌ Batch | ⚠️ WebSocket |
| Security | ✅ Enterprise | ⚠️ Basic | ❌ Minimal | ⚠️ Standard |
| Pricing | $99-999 | $299-1999 | $49-199 | $199-899 |

## Technology Gaps
1. No competitor offers true multi-agent orchestration
2. Most lack real-time execution monitoring
3. Enterprise security features are premium add-ons elsewhere
4. RAG pipeline integration is manual in competing products

## Recommendations
- Focus on multi-agent differentiation
- Price 40% below enterprise competitors
- Target mid-market as beachhead
- Build integration ecosystem quickly`,

    product_manager: `# Product Requirements Document: ${goal}

## Overview
Building an enterprise-grade AI operating system for automated project execution.

## User Stories
### Epic 1: Agent Management
- **US-101**: As a project manager, I want to assign tasks to AI agents so that work gets done automatically
- **US-102**: As a team lead, I want to monitor agent progress in real-time so that I can intervene when needed
- **US-103**: As an admin, I want to configure agent capabilities so that they match our workflows

### Epic 2: Workflow Orchestration
- **US-201**: As a founder, I want to run a startup builder workflow so that I get a complete project dossier
- **US-202**: As a CTO, I want to review generated architecture docs so that I can approve the technical direction
- **US-203**: As a product manager, I want to edit generated PRDs so that they match our exact requirements

### Epic 3: Knowledge Management
- **US-301**: As a researcher, I want to upload documents to the knowledge base so that agents can reference them
- **US-302**: As a developer, I want semantic search across knowledge so that I can find relevant information quickly
- **US-303**: As a security officer, I want audit logs of all agent actions so that we maintain compliance

## MVP Scope
### Must Have (M)
- [ ] 14 specialized agents with execution engine
- [ ] Startup builder workflow (10 steps)
- [ ] Real-time execution console (SSE)
- [ ] Document generation and storage
- [ ] Basic auth (JWT + bcrypt)

### Should Have (S)
- [ ] GitHub repository analysis
- [ ] Knowledge base with RAG
- [ ] Memory system (short + long term)
- [ ] Kanban task board

### Could Have (C)
- [ ] Advanced analytics dashboard
- [ ] Custom workflow builder
- [ ] Third-party integrations

## Success Metrics
- Agent execution success rate > 95%
- Workflow completion time < 5 minutes
- User satisfaction score > 4.5/5
- Time-to-first-value < 10 minutes`,

    cto: `# Technology Stack Recommendation: ${goal}

## Selected Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.9
- **Styling**: Tailwind CSS 4.x
- **UI Components**: Radix UI primitives
- **Charts**: Recharts
- **Animation**: Framer Motion

### Backend
- **Runtime**: Node.js 22 (LTS)
- **Framework**: Next.js API Routes
- **ORM**: Drizzle ORM
- **Validation**: Zod

### Database
- **Primary**: PostgreSQL 16
- **Cache**: Redis 7
- **Vector Store**: pgvector (PostgreSQL extension)

### AI/ML
- **LLM Provider**: OpenAI (GPT-4o, GPT-4o-mini)
- **SDK**: Vercel AI SDK
- **Embeddings**: text-embedding-3-small

### Infrastructure
- **Container**: Docker + Docker Compose
- **Orchestration**: Kubernetes
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana (ready)

## Trade-off Analysis
| Decision | Option A | Option B | Chosen | Rationale |
|----------|----------|----------|--------|-----------|
| Frontend | Next.js | Remix | Next.js | Better ecosystem, Vercel integration |
| ORM | Drizzle | Prisma | Drizzle | Better performance, type safety |
| Cache | Redis | Memcached | Redis | Pub/sub, data structures, persistence |
| LLM | OpenAI | Anthropic | OpenAI | Broader model selection, cost efficiency |

## Scalability Plan
- **100 users**: Single instance, $50/mo
- **1K users**: 3 instances, read replica, $300/mo
- **10K users**: K8s cluster, CDN, $1.5K/mo
- **100K users**: Multi-region, sharded DB, $8K/mo
- **1M users**: Event-driven, microservices, $75K/mo

## Risks & Mitigations
1. **LLM latency**: Implement caching, use faster models for simple tasks
2. **Token costs**: Monitor usage, implement rate limiting, use mini models where appropriate
3. **Data privacy**: Encrypt at rest, audit logs, SOC2 compliance roadmap`,

    architect: `# System Architecture: ${goal}

## High-Level Design

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Dashboard│  │  Builder │  │ Console  │  │  Kanban  │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       └─────────────┴─────────────┴─────────────┘          │
│                         │                                    │
│                    Next.js App Router                        │
│                    (SSR + API Routes)                        │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────┐
│                     API Gateway Layer                        │
│  Auth │ Rate Limit │ Validation │ Audit │ Error Handling    │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────┐
│                   Agent Execution Engine                     │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐   │
│  │Manager │ │Founder │ │  CTO   │ │Architect│ │ DevOps │   │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘   │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐   │
│  │Research│ │Product │ │  AI    │ │ Cloud  │ │Security│   │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘   │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐              │
│  │ Writer │ │   QA   │ │ Sales  │ │Marketing│              │
│  └────────┘ └────────┘ └────────┘ └────────┘              │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────┐
│                      Data Layer                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ PostgreSQL  │  │    Redis    │  │   Object Storage    │ │
│  │  (Primary)  │  │   (Cache)   │  │   (Documents)       │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
\`\`\`

## Database Schema

### Core Entities
\`\`\`sql
-- Workspaces (multi-tenant)
CREATE TABLE workspaces (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type workspace_type NOT NULL DEFAULT 'startup',
  goal TEXT,
  status VARCHAR(50) DEFAULT 'active'
);

-- Projects (within workspaces)
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'planning',
  progress INTEGER DEFAULT 0
);

-- Tasks (Kanban-style)
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  status task_status DEFAULT 'todo',
  priority task_priority DEFAULT 'medium',
  assigned_agent VARCHAR(100)
);
\`\`\`

## API Design

### REST Endpoints
- \`GET /api/workspaces\` — List workspaces
- \`POST /api/workflows/execute\` — Start workflow
- \`GET /api/console/stream\` — SSE live stream
- \`POST /api/knowledge\` — Ingest document
- \`POST /api/github/analyze\` — Analyze repo

## Caching Strategy
1. **Session data**: Redis (TTL: 24h)
2. **Agent responses**: Redis (TTL: 1h) for identical prompts
3. **Static assets**: CDN with 1-year cache
4. **Database queries**: Application-level cache (5min TTL)

## Message Flow
1. User submits goal → Manager Agent analyzes
2. Manager decomposes → Creates workflow execution
3. Workflow engine runs steps sequentially
4. Each step: Select agent → Execute → Validate → Store
5. Results aggregated → Documents generated → User notified`,

    cloud_architect: `# AWS Infrastructure Design: ${goal}

## Architecture Overview

### Compute
- **Primary**: Amazon EKS (Kubernetes)
  - 3-50 pods (auto-scaling)
  - Spot instances for non-critical workloads
  - On-demand for API servers

- **Serverless**: AWS Lambda (background jobs)
  - Document processing
  - Email notifications
  - Report generation

### Database
- **Primary**: Amazon RDS PostgreSQL 16
  - Multi-AZ deployment
  - db.r6g.xlarge (4 vCPU, 32GB RAM)
  - Automated backups (7-day retention)
  - Read replica for reporting queries

- **Cache**: Amazon ElastiCache Redis 7
  - cache.r6g.large
  - Cluster mode enabled (3 shards)

### Storage
- **Documents**: Amazon S3
  - Standard tier for active docs
  - Glacier for archived docs
  - CloudFront CDN for document delivery

### Networking
- **VPC**: 3-tier architecture
  - Public subnets: ALB, NAT Gateway
  - Private subnets: EKS, RDS, ElastiCache
  - Isolated subnets: Backup systems

- **Security Groups**:
  - ALB: 80/443 from internet
  - EKS: 3000 from ALB only
  - RDS: 5432 from EKS only
  - ElastiCache: 6379 from EKS only

### Security
- **WAF**: AWS WAF with OWASP rules
- **Secrets**: AWS Secrets Manager
- **Encryption**: KMS for all data at rest
- **IAM**: Role-based access, least privilege

## Cost Estimates

### Development ($50-100/mo)
- RDS: db.t3.micro ($15)
- ElastiCache: cache.t3.micro ($13)
- EKS: 1 node ($30)
- S3: 10GB ($0.23)
- Data transfer: ($5)

### Production 1K Users ($500-1,000/mo)
- RDS: db.r6g.large ($175)
- ElastiCache: cache.r6g.large ($105)
- EKS: 3 nodes ($180)
- ALB: ($25)
- S3 + CloudFront: ($50)
- OpenAI API: ($200-400)

### Production 10K Users ($3,000-5,000/mo)
- RDS: db.r6g.xlarge + read replica ($525)
- ElastiCache: cache.r6g.xlarge cluster ($420)
- EKS: 10 nodes ($600)
- ALB: ($50)
- S3 + CloudFront: ($200)
- OpenAI API: ($1,000-2,000)

### Production 100K+ Users ($15,000-30,000/mo)
- RDS: db.r6g.2xlarge + 2 replicas ($1,500)
- ElastiCache: cache.r6g.2xlarge cluster ($1,200)
- EKS: 30+ nodes ($2,000)
- ALB + NLB: ($200)
- S3 + CloudFront: ($800)
- OpenAI API: ($5,000-10,000)
- Monitoring: ($500)

## Disaster Recovery
- **RPO**: 5 minutes (continuous backup)
- **RTO**: 15 minutes (automated failover)
- **Backup**: Daily snapshots + continuous WAL archiving
- **Multi-region**: Active-passive in secondary region`,

    devops: `# CI/CD Pipeline & Deployment Strategy: ${goal}

## GitHub Actions Pipeline

\`\`\`yaml
name: NEXUS OS CI/CD
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: nexus_os_test
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      with:
        node-version: '22'
        cache: 'npm'
      - run: npm ci
      - run: npm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/nexus_os_test

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm audit --audit-level=moderate
      - uses: github/codeql-action/analyze@v3

  docker:
    runs-on: ubuntu-latest
    needs: [build, security]
    steps:
      - uses: docker/build-push-action@v5
        with:
          push: true
          tags: |
            ghcr.io/nexus-os/nexus-os:latest
            ghcr.io/nexus-os/nexus-os:$\{\{ github.sha \}\}
\`\`\`

## Deployment Strategy

### Blue-Green Deployment
1. Deploy new version to "green" environment
2. Run smoke tests against green
3. Switch traffic from "blue" to "green"
4. Monitor for 10 minutes
5. If issues, instant rollback to "blue"

### Canary Deployment
1. Deploy to 5% of pods
2. Monitor error rate and latency
3. Gradually increase to 25%, 50%, 100%
4. Auto-rollback if error rate > 1%

## Monitoring Stack

### Metrics (Prometheus)
- Request rate, latency, error rate (RED)
- Agent execution duration
- Token consumption rate
- Database connection pool usage

### Logs (OpenTelemetry)
- Structured JSON logging
- Distributed trace correlation
- Agent execution audit trail

### Alerts
- PagerDuty integration
- Slack notifications
- Auto-escalation after 15 minutes

## Infrastructure as Code

### Terraform Modules
\`\`\`hcl
module "nexus_os" {
  source = "./modules/nexus-os"
  
  environment = "production"
  region      = "us-east-1"
  
  eks_cluster = {
    node_count    = 5
    instance_type = "m6g.xlarge"
  }
  
  rds = {
    instance_class = "db.r6g.xlarge"
    multi_az       = true
  }
  
  elasticache = {
    node_type = "cache.r6g.large"
    clusters  = 3
  }
}
\`\`\``,

    security: `# Security Audit & Threat Model: ${goal}

## Threat Model (STRIDE)

### Spoofing
- **Threat**: Attacker impersonates admin user
- **Mitigation**: JWT with short expiry, MFA ready, IP allowlisting
- **Status**: ✅ Implemented

### Tampering
- **Threat**: Agent outputs modified in transit
- **Mitigation**: HTTPS everywhere, output validation, audit logs
- **Status**: ✅ Implemented

### Repudiation
- **Threat**: User denies performing action
- **Mitigation**: Immutable audit logs with timestamps and IP
- **Status**: ✅ Implemented

### Information Disclosure
- **Threat**: Sensitive data leaked in agent responses
- **Mitigation**: Output validation, secret detection, PII filtering
- **Status**: ✅ Implemented

### Denial of Service
- **Threat**: API overwhelmed with requests
- **Mitigation**: Rate limiting (100 req/min), circuit breakers, HPA
- **Status**: ✅ Implemented

### Elevation of Privilege
- **Threat**: Regular user gains admin access
- **Mitigation**: RBAC with 4 roles, permission matrix, API key scopes
- **Status**: ✅ Implemented

## OWASP Top 10 Mitigation

| # | Vulnerability | Mitigation | Status |
|---|--------------|------------|--------|
| 1 | Broken Access Control | RBAC + JWT validation | ✅ |
| 2 | Cryptographic Failures | bcrypt(12) + AES-256 | ✅ |
| 3 | Injection | Prompt injection detection | ✅ |
| 4 | Insecure Design | Threat modeling + secure defaults | ✅ |
| 5 | Security Misconfiguration | IaC + automated scanning | ✅ |
| 6 | Vulnerable Components | npm audit + Dependabot | ✅ |
| 7 | Auth Failures | JWT + bcrypt + session mgmt | ✅ |
| 8 | Data Integrity | Audit logs + input validation | ✅ |
| 9 | Logging Failures | Structured logs + SIEM ready | ✅ |
| 10 | SSRF | URL validation + egress filtering | ✅ |

## Security Checklist
- [x] Authentication (JWT + bcrypt)
- [x] Authorization (RBAC)
- [x] Rate limiting
- [x] Input validation (Zod)
- [x] Output validation (XSS detection)
- [x] Prompt injection protection
- [x] Audit logging
- [x] Secret management (env vars)
- [x] HTTPS enforcement
- [x] Security headers (CSP, HSTS)
- [ ] Penetration testing (scheduled)
- [ ] SOC2 compliance (roadmap)
- [ ] Bug bounty program (roadmap)`,

    writer: `# Technical Documentation: ${goal}

## Getting Started

### Prerequisites
- Node.js 22+
- PostgreSQL 16+
- Redis 7+
- OpenAI API key

### Installation
\`\`\`bash
# Clone repository
git clone https://github.com/nexus-os/nexus-os.git
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
\`\`\`

## API Reference

### Authentication
\`\`\`http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@nexus-os.dev",
  "password": "admin123"
}
\`\`\`

### Start Workflow
\`\`\`http
POST /api/workflows/execute
Authorization: Bearer <token>
Content-Type: application/json

{
  "goal": "Build an AI inventory management SaaS",
  "workspaceId": 1,
  "workflowType": "startup_builder"
}
\`\`\`

### Live Console Stream
\`\`\`javascript
const eventSource = new EventSource('/api/console/stream');
eventSource.onmessage = (e) => {
  const data = JSON.parse(e.data);
  console.log(data);
};
\`\`\`

## Architecture
See ARCHITECTURE.md for complete system design.

## Contributing
1. Fork the repository
2. Create a feature branch
3. Run tests: npm test
4. Submit a pull request

## License
MIT License - see LICENSE file for details.`,

    qa: `# Testing Plan: ${goal}

## Test Strategy

### Unit Tests (Target: 80% coverage)
| Module | Tests | Priority |
|--------|-------|----------|
| Agent Engine | 25 | Critical |
| Security | 15 | Critical |
| RAG Pipeline | 12 | High |
| API Routes | 30 | High |
| Components | 20 | Medium |

### Integration Tests
- [ ] End-to-end workflow execution
- [ ] Multi-agent orchestration
- [ ] Database transactions
- [ ] Cache invalidation
- [ ] SSE stream reliability

### Performance Tests
- [ ] 100 concurrent workflow executions
- [ ] 1000 RPS on /api/health
- [ ] Database query < 50ms (p95)
- [ ] Agent response < 5s (p95)

### Security Tests
- [ ] Prompt injection attempts (10 patterns)
- [ ] XSS payload in agent outputs
- [ ] SQL injection in search queries
- [ ] JWT token manipulation
- [ ] Rate limit bypass attempts

### Accessibility Tests
- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Color contrast ratios

## Test Automation
\`\`\`yaml
# playwright.config.ts
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['json', { outputFile: 'test-results.json' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
\`\`\`

## Bug Severity Classification
- **P0 (Critical)**: System down, data loss, security breach
- **P1 (High)**: Major feature broken, workaround difficult
- **P2 (Medium)**: Feature partially broken, workaround exists
- **P3 (Low)**: Cosmetic issue, minor inconvenience`,

    sales: `# Sales Outreach Strategy: ${goal}

## Target Personas

### Primary: Startup CTO
- **Pain**: Needs to ship fast but can't afford a full team
- **Goal**: Build MVP in 30 days with AI assistance
- **Channel**: LinkedIn, Hacker News, Tech Twitter

### Secondary: Agency Founder
- **Pain**: Client projects need specialized expertise
- **Goal**: Deliver enterprise-grade work with smaller teams
- **Channel**: Industry conferences, partner referrals

### Tertiary: Enterprise Innovation Lead
- **Pain**: Internal innovation projects move too slowly
- **Goal**: Accelerate digital transformation initiatives
- **Channel**: Direct outreach, case studies

## Email Sequence

### Email 1: Introduction
\`\`\`
Subject: Build your SaaS in 30 days (not 6 months)

Hi {{first_name}},

I noticed {{company}} is building {{product_type}}. 

What if you could have a full product team — founder, CTO, architect, 
DevOps, security expert — working 24/7 for less than one developer's salary?

NEXUS OS is an AI Operating System that acts as your autonomous digital workforce:
- 14 specialized AI agents
- Complete startup builder workflow
- Real-time execution monitoring
- Enterprise-grade security

Would you be open to a 15-minute demo next week?

Best,
{{sender_name}}
\`\`\`

### Email 2: Value Proof
\`\`\`
Subject: How {{similar_company}} shipped 3x faster

Hi {{first_name}},

{{similar_company}} used NEXUS OS to build their inventory management 
platform. Results:
- Time to MVP: 3 weeks (vs. 6 months traditional)
- Cost: $2,400 (vs. $80,000 traditional team)
- Quality: 98% agent success rate

Want to see how it works for {{company}}?

{{calendar_link}}
\`\`\`

## Pricing Conversation
\`\`\`
"Our Growth plan is $299/month. For context, that's:
- 1% of a senior developer's salary
- 5% of a product team's monthly cost
- Unlimited agent executions
- All 14 specialized agents
- Real-time console monitoring

Most customers see ROI within the first project."
\`\`\``,

    marketing: `# Marketing Strategy: ${goal}

## Content Calendar

### Week 1: Awareness
- **Blog**: "The Future of Software Development: AI Agents vs. Traditional Teams"
- **Social**: Thread on multi-agent orchestration
- **Video**: 2-min demo of Startup Builder workflow

### Week 2: Education
- **Blog**: "How to Build a SaaS in 30 Days with AI"
- **Social**: Before/after comparison infographic
- **Webinar**: "Live: Building an App with NEXUS OS"

### Week 3: Social Proof
- **Blog**: Case study: "How CloudInventory Saved $77K"
- **Social**: Customer testimonial video
- **Newsletter**: Monthly product updates

### Week 4: Conversion
- **Blog**: "NEXUS OS Pricing: Enterprise AI for Startup Budgets"
- **Social**: Limited-time offer announcement
- **Email**: Free trial onboarding sequence

## SEO Strategy

### Target Keywords
| Keyword | Volume | Difficulty | Priority |
|---------|--------|------------|----------|
| AI operating system | 1,200 | Medium | High |
| multi-agent system | 800 | Low | High |
| AI software development | 2,400 | High | Medium |
| autonomous AI agents | 600 | Low | High |
| startup builder AI | 300 | Low | High |

### Content Pillars
1. **AI Engineering**: Technical deep-dives on agent architecture
2. **Startup Building**: Practical guides for founders
3. **Enterprise AI**: Case studies and ROI analysis
4. **Future of Work**: Thought leadership on AI workforce

## Growth Hacking Tactics
1. **Product Hunt Launch**: Target #1 Product of the Day
2. **Open Source**: Release agent SDK on GitHub
3. **Referral Program**: $100 credit for each referral
4. **Integration Marketplace**: Partner with Vercel, Supabase, Stripe
5. **Community**: Discord server for power users

## KPIs
- **MRR**: $10K by Month 3, $50K by Month 6
- **CAC**: <$200
- **LTV**: >$2,000
- **Churn**: <5% monthly
- **NPS**: >50`,
  };

  return responses[agentRole] || `# Agent Output: ${agentRole}\n\nGenerated analysis for: ${goal}\n\n## Summary\nThis is a simulated response from the ${agentRole} agent. In production with a valid OpenAI API key, this would be generated by GPT-4o with the agent's specialized system prompt.\n\n## Key Points\n1. Analysis completed for the requested goal\n2. Recommendations provided based on agent expertise\n3. Structured output for downstream consumption\n\n## Next Steps\n1. Review output with stakeholders\n2. Iterate based on feedback\n3. Pass to next agent in workflow`;
}

// ===== EXECUTION ENGINE =====
export interface ExecutionContext {
  workspaceId: number;
  projectId?: number;
  taskId?: number;
  workflowExecutionId?: number;
  goal: string;
  memory?: string[];
  previousOutputs?: Record<string, string>;
}

export async function executeAgent(
  agentRole: string,
  prompt: string,
  context: ExecutionContext
): Promise<{
  output: string;
  tokensUsed: number;
  cost: number;
  latency: number;
}> {
  const config = AGENT_PROMPTS[agentRole] || AGENT_PROMPTS.manager;
  const agentRows = await db.select().from(agents).where(eq(agents.role, agentRole)).limit(1);
  const agentId = agentRows[0]?.id || 1;

  // Build memory context
  const mems = await getRelevantMemories(context.workspaceId, prompt, 5);
  const memoryContext = mems.length > 0
    ? `\n\n--- RELEVANT CONTEXT FROM MEMORY ---\n${mems.map(m => `[${m.type}] ${m.content}`).join("\n")}\n--- END CONTEXT ---\n`
    : "";

  const previousContext = context.previousOutputs
    ? `\n\n--- PREVIOUS AGENT OUTPUTS ---\n${Object.entries(context.previousOutputs).map(([k, v]) => `${k}:\n${v.slice(0, 2000)}`).join("\n\n")}\n--- END PREVIOUS OUTPUTS ---\n`
    : "";

  const fullPrompt = `${prompt}${memoryContext}${previousContext}`;
  const startTime = Date.now();

  try {
    let output: string;
    let tokensUsed: number;
    let cost: number;

    if (hasRealApiKey) {
      const result = await generateText({
        model: openaiClient(config.model),
        system: config.system,
        prompt: fullPrompt,
        temperature: config.temperature,
      });
      output = result.text;
      tokensUsed = result.usage?.totalTokens || Math.ceil(result.text.length / 4);
      cost = Math.ceil(tokensUsed * (config.model === "gpt-4o" ? 0.005 : 0.00015) * 100);
    } else {
      // Simulated response for demo without API key
      await new Promise(r => setTimeout(r, 1500 + Math.random() * 2000));
      output = generateSimulatedResponse(agentRole, prompt);
      tokensUsed = Math.ceil(output.length / 4);
      cost = Math.ceil(tokensUsed * (config.model === "gpt-4o" ? 0.005 : 0.00015) * 100);
    }

    const latency = Date.now() - startTime;

    // Store execution log
    await db.insert(agentExecutions).values({
      agentId,
      workspaceId: context.workspaceId,
      taskId: context.taskId,
      workflowExecutionId: context.workflowExecutionId,
      input: prompt.slice(0, 2000),
      output: output.slice(0, 4000),
      tokensUsed,
      cost,
      latency,
      status: "completed",
      metadata: { model: config.model, temperature: config.temperature, simulated: !hasRealApiKey },
    });

    // Store as memory
    await storeMemory({
      workspaceId: context.workspaceId,
      projectId: context.projectId,
      agentId,
      type: "short_term",
      content: `Agent ${agentRole} executed: ${output.slice(0, 500)}`,
      summary: `${agentRole} completed task`,
      importance: 7,
    });

    // Update agent stats
    await db.update(agents)
      .set({
        totalTasksCompleted: (agentRows[0]?.totalTasksCompleted || 0) + 1,
        totalTokensUsed: (agentRows[0]?.totalTokensUsed || 0) + tokensUsed,
        totalCost: (agentRows[0]?.totalCost || 0) + cost,
        status: "idle",
      })
      .where(eq(agents.id, agentId));

    return { output, tokensUsed, cost, latency };
  } catch (error) {
    const latency = Date.now() - startTime;
    await db.insert(agentExecutions).values({
      agentId,
      workspaceId: context.workspaceId,
      taskId: context.taskId,
      workflowExecutionId: context.workflowExecutionId,
      input: prompt.slice(0, 2000),
      output: String(error),
      latency,
      status: "failed",
    });
    throw error;
  }
}

// ===== MEMORY SYSTEM =====
export async function storeMemory(data: {
  workspaceId?: number;
  projectId?: number;
  agentId?: number;
  type: "short_term" | "long_term" | "workspace" | "project" | "architecture" | "decision";
  key?: string;
  content: string;
  summary?: string;
  importance?: number;
  metadata?: any;
  expiresAt?: Date;
}) {
  return db.insert(memories).values(data as any).returning();
}

export async function getRelevantMemories(
  workspaceId: number,
  query: string,
  limit: number = 10
) {
  const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);

  const allMemories = await db.select()
    .from(memories)
    .where(eq(memories.workspaceId, workspaceId))
    .orderBy(desc(memories.createdAt))
    .limit(100);

  const scored = allMemories.map(m => {
    const content = (m.content || "").toLowerCase();
    const score = keywords.reduce((acc, kw) => acc + (content.includes(kw) ? 1 : 0), 0);
    return { ...m, score };
  });

  return scored
    .filter(m => m.score > 0 || m.type === "long_term")
    .sort((a, b) => b.score - a.score || (b.importance || 0) - (a.importance || 0))
    .slice(0, limit);
}

export async function summarizeMemories(workspaceId: number) {
  const recentMemories = await db.select()
    .from(memories)
    .where(and(
      eq(memories.workspaceId, workspaceId),
      eq(memories.type, "short_term")
    ))
    .orderBy(desc(memories.createdAt))
    .limit(50);

  if (recentMemories.length < 5) return;

  const content = recentMemories.map(m => m.content).join("\n---\n");

  if (hasRealApiKey) {
    const result = await generateText({
      model: openaiClient("gpt-4o-mini"),
      system: "Summarize the following agent memory entries into a concise long-term memory. Extract key decisions, facts, and context.",
      prompt: content,
      temperature: 0.3,
    });
    await storeMemory({
      workspaceId,
      type: "long_term",
      content: result.text,
      summary: "Auto-summarized from recent activity",
      importance: 8,
    });
  } else {
    await storeMemory({
      workspaceId,
      type: "long_term",
      content: `Summary of recent activity: ${content.slice(0, 500)}...`,
      summary: "Auto-summarized from recent activity",
      importance: 8,
    });
  }
}

// ===== WORKFLOW ORCHESTRATION =====
export const STARTUP_BUILDER_WORKFLOW = {
  name: "Startup Builder",
  type: "startup_builder",
  description: "Complete startup building workflow from idea to deployment",
  steps: [
    { id: "founder_analysis", agent: "founder", prompt: "Analyze the market opportunity for: {goal}. Provide TAM/SAM/SOM, business model canvas, revenue model, and competitive landscape." },
    { id: "research_competitors", agent: "research", prompt: "Research competitors for: {goal}. Provide feature matrix, pricing comparison, and market gaps." },
    { id: "product_prd", agent: "product_manager", prompt: "Create a comprehensive PRD for: {goal}. Include user stories, feature list, MVP scope, and success metrics. Use founder analysis: {founder_analysis} and research: {research_competitors}" },
    { id: "cto_techstack", agent: "cto", prompt: "Select the optimal tech stack for: {goal}. Consider scalability, team size, time-to-market. Use PRD: {product_prd}" },
    { id: "architect_design", agent: "architect", prompt: "Design the system architecture for: {goal}. Include database schema, API design, and microservices breakdown. Use tech stack: {cto_techstack}" },
    { id: "cloud_infrastructure", agent: "cloud_architect", prompt: "Design AWS infrastructure for: {goal}. Include service selection, cost estimates, and security controls. Use architecture: {architect_design}" },
    { id: "devops_pipeline", agent: "devops", prompt: "Design CI/CD pipeline and deployment strategy for: {goal}. Use infrastructure: {cloud_infrastructure}" },
    { id: "security_audit", agent: "security", prompt: "Perform security threat modeling for: {goal}. Identify risks and mitigation strategies. Use architecture: {architect_design}" },
    { id: "documentation", agent: "writer", prompt: "Create comprehensive technical documentation for: {goal}. Include architecture docs, API docs, and deployment guide. Use all previous outputs." },
    { id: "qa_plan", agent: "qa", prompt: "Create a testing plan for: {goal}. Include test types, coverage targets, and automation strategy." },
  ],
};

export async function runWorkflow(
  workflowDef: typeof STARTUP_BUILDER_WORKFLOW,
  goal: string,
  workspaceId: number
): Promise<number> {
  const [workflow] = await db.insert(workflows).values({
    workspaceId,
    name: workflowDef.name,
    description: workflowDef.description,
    type: workflowDef.type,
    definition: { steps: workflowDef.steps },
  }).returning();

  const [execution] = await db.insert(workflowExecutions).values({
    workflowId: workflow.id,
    workspaceId,
    goal,
    status: "running",
    progress: 0,
    currentStep: 0,
    totalSteps: workflowDef.steps.length,
    startedAt: new Date(),
    logs: [{ timestamp: new Date().toISOString(), level: "info", message: `Workflow started: ${workflowDef.name}` }],
  }).returning();

  const outputs: Record<string, string> = {};

  for (let i = 0; i < workflowDef.steps.length; i++) {
    const step = workflowDef.steps[i];

    await db.update(workflowExecutions)
      .set({
        currentStep: i + 1,
        progress: Math.round(((i + 1) / workflowDef.steps.length) * 100),
        logs: [
          ...(execution.logs || []),
          { timestamp: new Date().toISOString(), level: "info", message: `Starting step ${i + 1}: ${step.id}`, agent: step.agent },
        ],
      })
      .where(eq(workflowExecutions.id, execution.id));

    const [stepRecord] = await db.insert(workflowSteps).values({
      executionId: execution.id,
      stepIndex: i,
      name: step.id,
      prompt: step.prompt,
      status: "running",
      startedAt: new Date(),
    }).returning();

    try {
      let resolvedPrompt = step.prompt.replace(/\{goal\}/g, goal);
      for (const [key, value] of Object.entries(outputs)) {
        resolvedPrompt = resolvedPrompt.replace(new RegExp(`\\{${key}\\}`, "g"), value.slice(0, 3000));
      }

      const result = await executeAgent(step.agent, resolvedPrompt, {
        workspaceId,
        workflowExecutionId: execution.id,
        goal,
        previousOutputs: outputs,
      });

      outputs[step.id] = result.output;

      await db.update(workflowSteps)
        .set({
          output: result.output,
          status: "completed",
          tokensUsed: result.tokensUsed,
          cost: result.cost,
          latency: result.latency,
          completedAt: new Date(),
        })
        .where(eq(workflowSteps.id, stepRecord.id));

      await db.insert(documents).values({
        workspaceId,
        title: `${step.id.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}`,
        type: "other",
        content: result.output,
        author: step.agent,
        version: "1.0",
      });
    } catch (error) {
      await db.update(workflowSteps)
        .set({
          status: "failed",
          output: String(error),
          completedAt: new Date(),
        })
        .where(eq(workflowSteps.id, stepRecord.id));

      await db.update(workflowExecutions)
        .set({
          status: "failed",
          logs: [
            ...(execution.logs || []),
            { timestamp: new Date().toISOString(), level: "error", message: `Step ${step.id} failed: ${error}`, agent: step.agent },
          ],
        })
        .where(eq(workflowExecutions.id, execution.id));

      return execution.id;
    }
  }

  await db.update(workflowExecutions)
    .set({
      status: "completed",
      progress: 100,
      result: outputs,
      completedAt: new Date(),
      logs: [
        ...(execution.logs || []),
        { timestamp: new Date().toISOString(), level: "info", message: "Workflow completed successfully" },
      ],
    })
    .where(eq(workflowExecutions.id, execution.id));

  return execution.id;
}
