# Production Dockerfile for Hugging Face Spaces
# FastAPI Backend - Stock Analytics API

# Use Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Set environment variables for production
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV ENVIRONMENT=production

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Pre-install pandas-ta from GitHub to avoid pip issues
RUN pip install --no-cache-dir pandas-ta-remake

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app/ ./app/

# Create database directory and initialize database
RUN mkdir -p /app/data

# Expose port 7860 (required by Hugging Face Spaces)
EXPOSE 7860

# Run the application with uvicorn in production mode
# Using a single worker to avoid SQLite locking issues
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
