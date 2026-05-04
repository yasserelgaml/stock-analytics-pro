# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🛠 Development Commands

### Full Stack (Docker)
- Build and run entire stack: `docker-compose up --build`
- Stop stack: `docker-compose down`

### Backend (FastAPI)
- Install dependencies: `pip install -r backend/requirements.txt`
- Run backend: `uvicorn backend.app.main:app --reload`
- API Docs: `http://localhost:8000/docs`

### Frontend (Next.js)
- Install dependencies: `cd frontend && npm install`
- Run development server: `cd frontend && npm run dev`
- Build for production: `cd frontend && npm run build`

## 🏗 Architecture

### Backend (FastAPI + SQLAlchemy Async)
Follows a **Service Layer** pattern to decouple API routing from business logic:
- **Routes (`backend/app/api/v1/`)**: Handles HTTP requests and responses.
- **Services (`backend/app/services/`)**: Contains all business logic, calculations (technical indicators), and external API integrations (yfinance).
- **Models (`backend/app/models/`)**: SQLAlchemy database models.
- **Schemas (`backend/app/schemas/`)**: Pydantic models for request/response validation.
- **Core (`backend/app/core/`)**: Configuration, security (JWT), and caching logic.
- **DB (`backend/app/db/`)**: Session management and base classes.

### Frontend (Next.js 14 App Router)
- **App Router (`frontend/app/`)**: Defines routes and page layouts.
- **Components/Logic (`frontend/src/`)**: UI components and client-side logic.
- **Utilities (`frontend/lib/`)**: Shared helper functions and API clients.

## 📏 Engineering Guidelines

### Backend Constraints
- **Type Safety**: Mandatory Type Hints for all functions.
- **File Size**: Maximum 200 lines per file. Split into smaller modules if this limit is exceeded.
- **Environment**: Use Pydantic Settings for `.env` management.
- **Documentation**: Every service function must have a docstring explaining the business logic.

### Workflow
- **Plan before Act**: Always present a clear implementation plan before writing code.
- **Atomic Tasks**: Break large features into small, manageable atomic tasks.
