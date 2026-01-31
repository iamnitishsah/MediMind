from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from app.services.prescription import generate_prescription_service
from loguru import logger

router = APIRouter()


@router.post("/generate_prescription")
async def generate_prescription(request: Request):
    logger.info("Received /generate_prescription request")

    try:
        data = await request.json()
        logger.debug(f"Payload: {data}")
    except Exception as e:
        logger.warning(f"Invalid JSON: {e}")
        return JSONResponse(content={"error": "Invalid JSON"}, status_code=400)

    try:
        result = generate_prescription_service(data)
        return JSONResponse(
            content=result.dict() if hasattr(result, "dict") else result
        )
    except ValueError as e:
        return JSONResponse(content={"error": str(e)}, status_code=400)
    except Exception:
        logger.exception("Internal server error")
        return JSONResponse(content={"error": "Internal server error"}, status_code=500)
