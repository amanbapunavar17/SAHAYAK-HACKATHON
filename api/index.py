import sys
import os

root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_dir = os.path.join(root_dir, "backend")

for p in [backend_dir, root_dir]:
    if p and p not in sys.path:
        sys.path.insert(0, p)

try:
    from backend.app.main import app
except ImportError:
    from app.main import app

@app.middleware("http")
async def log_requests(request, call_next):
    return await call_next(request)

@app.api_route("/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def catch_all(path_name: str):
    routes = [route.path for route in app.routes]
    return {
        "status": "online",
        "requested_path": f"/{path_name}",
        "registered_routes": routes
    }






