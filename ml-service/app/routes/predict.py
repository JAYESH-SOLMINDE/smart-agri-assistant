# predict.py — The API endpoint that receives images and returns predictions

from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from app.model import disease_model
from app.utils.image_utils import validate_image

# Create a router (like Express Router in Node.js)
router = APIRouter()

@router.post("/predict")
async def predict_disease(
    file: UploadFile = File(...),        # The uploaded image
    crop_type: str   = Form("unknown")  # Optional crop type hint
):
    """
    Receives a leaf image and returns disease prediction.
    
    How to call this:
    POST /predict
    Body: multipart form with 'file' (image) and 'crop_type' (string)
    """
    
    # Step 1: Check file type
    allowed_types = ["image/jpeg", "image/png", "image/jpg", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG, or WEBP images are allowed"
        )
    
    # Step 2: Read the image bytes
    image_bytes = await file.read()
    
    # Step 3: Check file size (max 10MB)
    if len(image_bytes) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="Image too large. Maximum size is 10MB"
        )
    
    # Step 4: Validate it's a real image
    if not validate_image(image_bytes):
        raise HTTPException(
            status_code=400,
            detail="Invalid image file. Please upload a clear leaf photo"
        )
    
    # Step 5: Run AI prediction
    try:
        result = disease_model.predict(image_bytes)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )
    
    # Step 6: Return result
    return {
        "success":    True,
        "crop_type":  crop_type,
        "disease":    result["disease"],
        "confidence": result["confidence"],
        "is_healthy": result["is_healthy"],
        "treatment":  result["treatment"],
        "prevention": result["prevention"],
        "severity":   result["severity"],
    }


@router.get("/health")
async def health_check():
    """Quick check to see if ML service is running."""
    return {
        "status":        "ok",
        "message":       "ML Service is running!",
        "model_trained": disease_model.is_loaded,
        "classes":       38
    }