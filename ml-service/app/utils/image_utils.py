# image_utils.py — Prepares leaf images for the AI model
# The model needs images in a specific size and format

import numpy as np
from PIL import Image
import io

# MobileNetV2 expects images of exactly this size
IMAGE_SIZE = (224, 224)

def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """
    Takes raw image bytes (from upload) and converts to
    the format our AI model expects.
    
    Steps:
    1. Open the image
    2. Convert to RGB (remove alpha channel if PNG)
    3. Resize to 224x224
    4. Convert to numpy array
    5. Normalize pixel values from 0-255 to 0-1
    6. Add batch dimension
    """
    
    # Step 1 & 2: Open image and convert to RGB
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    
    # Step 3: Resize to what model expects
    image = image.resize(IMAGE_SIZE)
    
    # Step 4: Convert to numpy array
    img_array = np.array(image)
    
    # Step 5: Normalize - MobileNetV2 expects values between -1 and 1
    img_array = img_array / 127.5 - 1.0
    
    # Step 6: Add batch dimension (model expects shape: 1, 224, 224, 3)
    img_array = np.expand_dims(img_array, axis=0)
    
    return img_array


def validate_image(image_bytes: bytes) -> bool:
    """Check if the uploaded file is actually a valid image."""
    try:
        image = Image.open(io.BytesIO(image_bytes))
        image.verify()  # Verify it's a real image
        return True
    except Exception:
        return False