# PullSight AI - Docker Compose Setup

This guide explains how to run the complete PullSight AI application stack using Docker Compose.

## Architecture

The application consists of three main services:

1. **Backend** (NestJS) - Port 3001
2. **Frontend** (Next.js) - Port 3000
3. **AI Agent** (FastAPI/Python) - Port 8030

## Prerequisites

- Docker and Docker Compose installed
- Git repository cloned locally

## Environment Setup

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Update the `.env` file with your actual values:

### Required Environment Variables

```bash
# Database
MONGODB_URI=your-mongodb-connection-string

# JWT
JWT_SECRET=your-secure-jwt-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Bitbucket OAuth
BITBUCKET_CLIENT_ID=your-bitbucket-client-id
BITBUCKET_CLIENT_SECRET=your-bitbucket-client-secret

# GitLab OAuth
GITLAB_CLIENT_ID=your-gitlab-client-id
GITLAB_CLIENT_SECRET=your-gitlab-client-secret

# GitHub App
GITHUB_APP_ID=your-github-app-id
GITHUB_APP_SLUG=your-github-app-slug

# AI Agent
CLAUDE_API_KEY=your-claude-api-key
BACKEND_SUMMARY_ENDPOINT=http://pullsightai-backend:3001/v1/github/summary
BACKEND_REVIEW_ENDPOINT=http://pullsightai-backend:3001/v1/github/reviews
```

3. Place your GitHub App private key file:

```bash
cp your-github-app.private-key.pem backend/app.private-key.pem
```

## Running the Application

### Development Mode

Start all services:

```bash
docker compose up -d --build
```

View logs:

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f pullsightai-backend
docker compose logs -f pullsightai-frontend
docker compose logs -f pullsightai-ai-agent
```

Stop all services:

```bash
docker compose down
```

### Service Health Checks

- **Backend**: http://localhost:3001
- **Frontend**: http://localhost:3000
- **AI Agent**: http://localhost:8030/health

## Service Details

### Backend (NestJS)

- **Port**: 3001
- **Container**: pullsightai-backend
- **Health**: http://localhost:3001/health
- **Features**: OAuth, API endpoints, database integration

### Frontend (Next.js)

- **Port**: 3000
- **Container**: pullsightai-frontend
- **Health**: http://localhost:3000
- **Features**: User interface, OAuth flows

### AI Agent (FastAPI)

- **Port**: 8030
- **Container**: pullsightai-ai-agent
- **Health**: http://localhost:8030/health
- **Features**: AI-powered PR reviews using Claude API

## Networking

All services communicate through a custom Docker network (`pullsightai-network`):

- Frontend → Backend: `http://pullsightai-backend:3001`
- Backend → AI Agent: `http://pullsightai-ai-agent:8030`
- AI Agent → Backend: `http://pullsightai-backend:3001`

## Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure ports 3000, 3001, and 8030 are available
2. **Environment variables**: Verify all required variables are set in `.env`
3. **Docker volumes**: Clear volumes if experiencing persistent issues:
   ```bash
   docker compose down -v
   docker compose up -d --build
   ```

### Debugging

Check service status:

```bash
docker compose ps
```

View service logs:

```bash
docker compose logs [service-name]
```

Access container shell:

```bash
docker compose exec pullsightai-backend sh
docker compose exec pullsightai-ai-agent bash
```

## GitHub Actions Integration

The repository includes a GitHub Actions workflow (`deploy-dev.yml`) that:

1. Creates environment files for all services
2. Builds and deploys all containers
3. Checks service health
4. Displays logs for debugging

### Required GitHub Secrets

Set these in your repository's GitHub Settings → Secrets:

- `MONGODB_URI`
- `JWT_SECRET`
- `GITHUB_CLIENT_ID` (as `GIT_CLIENT_ID`)
- `GITHUB_CLIENT_SECRET` (as `GIT_CLIENT_SECRET`)
- `BITBUCKET_CLIENT_ID`
- `BITBUCKET_CLIENT_SECRET`
- `GITLAB_CLIENT_ID`
- `GITLAB_CLIENT_SECRET`
- `GITHUB_APP_ID` (as `GIT_APP_ID`)
- `GITHUB_APP_SLUG` (as `GIT_APP_SLUG`)
- `GITHUB_PRIVATE_KEY_PATH` (as `GIT_PRIVATE_KEY_PATH`)
- `GITHUB_PRIVATE_KEY` (as `GIT_PRIVATE_KEY`)
- `GITHUB_WEBHOOK_SECRET` (as `GIT_WEBHOOK_SECRET`)
- `CLAUDE_API_KEY`

### Required GitHub Variables

Set these in your repository's GitHub Settings → Variables:

- `NODE_ENV`
- `PORT`
- `CLIENT_URL`
- `BASE_URL`
- `DOMAIN`
- `AI_AGENT_PR_POST_URL`
- `BACKEND_SUMMARY_ENDPOINT`
- `BACKEND_REVIEW_ENDPOINT`
- `NEXT_NODE_ENV`
- `NEXT_TELEMETRY_DISABLED`
- `NEXT_PUBLIC_API_URL`

## Development

For local development without Docker:

1. **Backend**:

   ```bash
   cd backend
   npm install
   npm run start:dev
   ```

2. **Frontend**:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **AI Agent**:
   ```bash
   cd ai_agent
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8030
   ```
