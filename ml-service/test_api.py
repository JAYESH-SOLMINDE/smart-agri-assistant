# test_api.py — Quick test to check if ML service works
# Run: python test_api.py

import requests
import sys
import os

BASE_URL = "http://localhost:8000"

def test_health():
    """Test if service is running."""
    print("1️⃣  Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        data = response.json()
        print(f"   ✅ Status: {data['status']}")
        print(f"   ✅ Model trained: {data['model_trained']}")
        return True
    except Exception as e:
        print(f"   ❌ Failed: {e}")
        print("   Make sure the ML service is running: uvicorn app.main:app --reload")
        return False

def test_prediction(image_path: str = None):
    """Test disease prediction with an image."""
    print("\n2️⃣  Testing disease prediction...")
    
    # Create a simple test image if none provided
    if not image_path or not os.path.exists(image_path):
        print("   Creating a test image...")
        from PIL import Image, ImageDraw
        import io
        
        # Create a simple green leaf-colored image
        img = Image.new("RGB", (224, 224), color=(34, 139, 34))
        draw = ImageDraw.Draw(img)
        draw.ellipse([50, 50, 174, 174], fill=(0, 100, 0))
        
        img_bytes = io.BytesIO()
        img.save(img_bytes, format="JPEG")
        img_bytes.seek(0)
        
        files    = {"file": ("test_leaf.jpg", img_bytes, "image/jpeg")}
        data     = {"crop_type": "Tomato"}
    else:
        files = {"file": open(image_path, "rb")}
        data  = {"crop_type": "Tomato"}
    
    try:
        response = requests.post(f"{BASE_URL}/predict", files=files, data=data)
        result   = response.json()
        
        print(f"   ✅ Disease:     {result.get('disease', 'N/A')}")
        print(f"   ✅ Confidence:  {result.get('confidence', 0) * 100:.1f}%")
        print(f"   ✅ Healthy:     {result.get('is_healthy', False)}")
        print(f"   ✅ Severity:    {result.get('severity', 'N/A')}")
        print(f"   ✅ Treatment:   {result.get('treatment', 'N/A')[:60]}...")
        return True
    except Exception as e:
        print(f"   ❌ Failed: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing Smart Agri ML Service\n")
    
    image_path = sys.argv[1] if len(sys.argv) > 1 else None
    
    h = test_health()
    if h:
        test_prediction(image_path)
    
    print("\n✅ Tests complete!")