# model.py — The AI disease detection model
# Uses MobileNetV2 with Transfer Learning

import numpy as np
import os
import json
import tensorflow as tf
from app.utils.image_utils import preprocess_image
from app.disease_info import get_disease_info

# All 38 disease classes from PlantVillage dataset
# The model outputs one of these 38 categories
CLASS_NAMES = [
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    "Apple___healthy",
    "Blueberry___healthy",
    "Cherry_(including_sour)___Powdery_mildew",
    "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight",
    "Corn_(maize)___healthy",
    "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)",
    "Peach___Bacterial_spot",
    "Peach___healthy",
    "Pepper,_bell___Bacterial_spot",
    "Pepper,_bell___healthy",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Raspberry___healthy",
    "Soybean___healthy",
    "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch",
    "Strawberry___healthy",
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy",
]

# Path where the trained model will be saved
MODEL_PATH = "saved_models/plant_disease_model.keras"

class DiseaseDetectionModel:
    """
    Wraps MobileNetV2 for plant disease detection.
    On first run it builds the model architecture.
    After training it loads saved weights.
    """

    def __init__(self):
        self.model = None
        self.is_loaded = False
        self._load_or_build_model()

    def _load_or_build_model(self):
        """Load saved model if it exists, otherwise build a new one."""
        
        if os.path.exists(MODEL_PATH):
            print("✅ Loading saved model from disk...")
            self.model    = tf.keras.models.load_model(MODEL_PATH)
            self.is_loaded = True
            print("✅ Model loaded successfully!")
        else:
            print("⚠️  No saved model found. Building fresh model...")
            print("⚠️  Run training/train.py to train the model first!")
            print("⚠️  Using untrained model for now (results will be random).")
            self.model    = self._build_model()
            self.is_loaded = False

    def _build_model(self) -> tf.keras.Model:
        """
        Build MobileNetV2 transfer learning model.
        
        We use MobileNetV2 because:
        - It's fast and lightweight (works on phones)
        - Already trained on millions of images
        - We just add our own disease classification layer on top
        """
        
        # Load MobileNetV2 pre-trained on ImageNet
        # include_top=False means we remove its final layer
        # and add our own for 38 disease classes
        base_model = tf.keras.applications.MobileNetV2(
            input_shape=(224, 224, 3),
            include_top=False,          # Remove original classifier
            weights="imagenet"          # Use pre-trained weights
        )
        
        # Freeze base model layers — we only train our new layers
        base_model.trainable = False
        
        # Build the full model
        model = tf.keras.Sequential([
            base_model,
            # Convert feature maps to single vector
            tf.keras.layers.GlobalAveragePooling2D(),
            # Dropout prevents overfitting
            tf.keras.layers.Dropout(0.2),
            # Final layer: one output per disease class
            tf.keras.layers.Dense(len(CLASS_NAMES), activation="softmax")
        ])
        
        model.compile(
            optimizer="adam",
            loss="categorical_crossentropy",
            metrics=["accuracy"]
        )
        
        return model

    def predict(self, image_bytes: bytes) -> dict:
        """
        Takes a leaf image and returns disease prediction.
        
        Returns:
            disease: name of the disease
            confidence: how sure the model is (0-1)
            is_healthy: whether the plant is healthy
            treatment: what to do
            prevention: how to prevent
            severity: low/medium/high
        """
        
        # Step 1: Prepare the image
        processed_image = preprocess_image(image_bytes)
        
        # Step 2: Run through the model
        predictions = self.model.predict(processed_image, verbose=0)
        
        # Step 3: Get the highest confidence prediction
        predicted_index = np.argmax(predictions[0])
        confidence      = float(predictions[0][predicted_index])
        disease_name    = CLASS_NAMES[predicted_index]
        
        # Step 4: Check if plant is healthy
        is_healthy = "healthy" in disease_name.lower()
        
        # Step 5: Get treatment info
        disease_info = get_disease_info(disease_name)
        
        # Step 6: Format the disease name nicely for display
        # "Tomato___Late_blight" → "Tomato: Late Blight"
        display_name = disease_name.replace("___", ": ").replace("_", " ")
        
        return {
            "disease":    display_name,
            "raw_name":   disease_name,
            "confidence": round(confidence, 4),
            "is_healthy": is_healthy,
            "treatment":  disease_info["treatment"],
            "prevention": disease_info["prevention"],
            "severity":   disease_info["severity"],
            "model_trained": self.is_loaded
        }


# Create one global instance of the model
# This loads the model once when server starts
print("🧠 Loading AI model...")
disease_model = DiseaseDetectionModel()
print("🧠 AI model ready!")