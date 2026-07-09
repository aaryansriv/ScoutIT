from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_bookmarks():
    return {"message": "Bookmarks — Phase 2"}


@router.post("/{company_id}")
async def add_bookmark(company_id: str):
    return {"message": f"Bookmark added for {company_id} — Phase 2"}


@router.delete("/{company_id}")
async def remove_bookmark(company_id: str):
    return {"message": f"Bookmark removed for {company_id} — Phase 2"}
