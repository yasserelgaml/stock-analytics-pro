from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.analysis import router as analysis_router
from app.api.v1.watchlist import router as watchlist_router
from app.api.v1.auth import router as auth_router
from app.core.config import settings

app = FastAPI(
    title="Trading API",
    description="Professional Stock Analysis API with AI Insights",
    version="1.0.0"
)

# Production CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(analysis_router, prefix="/api/v1/analysis", tags=["Analysis"])
app.include_router(watchlist_router, prefix="/api/v1/watchlist", tags=["Watchlist"])

@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint for monitoring and production readiness.
    """
    return {
        "status": "healthy",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)