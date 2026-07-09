from fastapi import APIRouter

router = APIRouter()


@router.post("/login")
async def login():
    # Placeholder — integrate Clerk or Better Auth JWT verification here
    return {"message": "Auth route — integrate Clerk/Better Auth"}


@router.post("/register")
async def register():
    return {"message": "Auth route — integrate Clerk/Better Auth"}
