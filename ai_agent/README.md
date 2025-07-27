# PullSight AI Agent

An AI-powered Pull Request reviewer that automatically analyzes code changes and provides intelligent summaries and reviews using Claude AI.

## Features

- **PR Summary Generation**: Automatically creates concise summaries of pull requests
- **Code Review**: Provides detailed, actionable feedback on code changes
- **Multi-LLM Support**: Built with extensible LLM service architecture
- **Docker Support**: Easy deployment with Docker and Docker Compose

## Prerequisites

- Python 3.11+
- Docker and Docker Compose (for containerized deployment)
- Claude API Key (Anthropic)

## Installation

### Option 1: Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai_agent
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   Create a `.env` file in the project root:
   ```env
   CLAUDE_API_KEY=your_claude_api_key_here
   BACKEND_SUMMARY_ENDPOINT=http://localhost:8001/test/summary
   BACKEND_REVIEW_ENDPOINT=http://localhost:8001/test/review
   ```

### Option 2: Docker Deployment

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai_agent
   ```

2. **Set up environment variables**
   Create a `.env` file in the project root:
   ```env
   CLAUDE_API_KEY=your_claude_api_key_here
   BACKEND_SUMMARY_ENDPOINT=http://test-receiver:8001/test/summary
   BACKEND_REVIEW_ENDPOINT=http://test-receiver:8001/test/review
   ```

3. **Run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

## Running the Application

### Local Development
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Docker
```bash
docker-compose up
```

The application will be available at `http://localhost:8000`

## API Endpoints

### Main Supervisor Endpoint
- **POST** `/ai_agent/`
- **Purpose**: Main entry point for PR review processing
- **Request Body**: PR webhook payload (see `app/models/pr_event.py`)
- **Response**: 
  ```json
  {
    "status": "completed"
  }
  ```

### Health Check
- **GET** `/`
- **Response**:
  ```json
  {
    "message": "AI-Powered PR Reviewer is running!"
  }
  ```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CLAUDE_API_KEY` | Your Anthropic Claude API key | Required |
| `BACKEND_SUMMARY_ENDPOINT` | Endpoint for posting summary results | `http://backend/summary` |
| `BACKEND_REVIEW_ENDPOINT` | Endpoint for posting review results | `http://backend/review` |

### LLM Service Configuration

The application uses Claude by default. To use a different LLM:

1. Implement the `BaseLLMService` interface in `app/services/llm_base.py`
2. Update the dependency injection in `app/api/supervisor.py`

## Project Structure

```
ai_agent/
├── app/
│   ├── api/                    # API endpoints
│   │   ├── review.py          # Review generation logic
│   │   ├── summary.py         # Summary generation logic
│   │   └── supervisor.py      # Main supervisor endpoint
│   ├── models/                # Data models
│   │   ├── pr_event.py       # PR event data structures
│   │   └── pr_response.py    # Response models
│   ├── services/              # Business logic
│   │   ├── claude_service.py # Claude AI integration
│   │   └── llm_base.py       # LLM service interface
│   └── main.py               # FastAPI application entry
├── config/
│   ├── prompt.yaml           # AI prompts configuration
│   └── settings.py           # Application settings
├── Dockerfile                # Docker configuration
├── docker-compose.yml        # Docker Compose setup
├── requirements.txt          # Python dependencies
└── test_receiver.py         # Test endpoint for development
```

## Development

### Testing

The project includes a test receiver service that simulates backend endpoints:

```bash
# Run test receiver separately
uvicorn test_receiver:app --host 0.0.0.0 --port 8001
```

### Adding New LLM Providers

1. Create a new service class implementing `BaseLLMService`
2. Add the required API key to settings
3. Update the dependency injection in the supervisor

Example:
```python
class GroqService(BaseLLMService):
    def __init__(self):
        self.client = AsyncGroq(api_key=settings.GROQ_API_KEY)
    
    async def generate_pr_summary(self, prompt: str) -> str:
        # Implementation here
        pass
    
    async def generate_code_review(self, prompt: str) -> str:
        # Implementation here
        pass
```

## Deployment

### Production Deployment

1. **Set up environment variables** for your production environment
2. **Configure backend endpoints** to point to your actual backend services
3. **Deploy using Docker**:
   ```bash
   docker build -t ai-agent .
   docker run -p 8000:8000 --env-file .env ai-agent
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request
