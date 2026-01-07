"""
Hugging Face Space - Todo App Backend Entry Point
"""

from app.main import app

# For Hugging Face Spaces, make sure we use the correct port
if __name__ == "__main__":
    import uvicorn
    import os

    port = int(os.environ.get("PORT", 7860))  # Hugging Face uses PORT environment variable
    host = "0.0.0.0"  # Bind to all interfaces

    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=False  # Disable reload in production
    )