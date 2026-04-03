# disease_info.py — Treatment and prevention info for each disease
# This is used after AI detection to tell farmer what to do

DISEASE_INFO = {
    "Tomato___Late_blight": {
        "treatment": "Apply copper-based fungicide immediately. Remove and destroy all infected leaves and stems. Do not compost infected material.",
        "prevention": "Ensure good air circulation between plants. Avoid wetting leaves when watering. Use drip irrigation instead of overhead.",
        "severity": "high"
    },
    "Tomato___Early_blight": {
        "treatment": "Apply chlorothalonil or mancozeb fungicide every 7-10 days. Remove infected lower leaves.",
        "prevention": "Rotate crops every season. Remove plant debris after harvest. Mulch around plants.",
        "severity": "medium"
    },
    "Tomato___Leaf_Mold": {
        "treatment": "Apply fungicide containing chlorothalonil. Improve ventilation in greenhouse if applicable.",
        "prevention": "Keep humidity below 85%. Space plants well for air circulation.",
        "severity": "medium"
    },
    "Tomato___Septoria_leaf_spot": {
        "treatment": "Apply fungicide with copper or chlorothalonil. Remove infected leaves immediately.",
        "prevention": "Avoid overhead watering. Stake plants to improve air flow.",
        "severity": "medium"
    },
    "Tomato___Spider_mites Two-spotted_spider_mite": {
        "treatment": "Apply neem oil or insecticidal soap spray. Spray undersides of leaves where mites live.",
        "prevention": "Keep plants well watered. Mites thrive in dry conditions. Remove weeds nearby.",
        "severity": "low"
    },
    "Tomato___Bacterial_spot": {
        "treatment": "Apply copper-based bactericide. Remove infected plant parts.",
        "prevention": "Use disease-free seeds. Avoid working with plants when wet.",
        "severity": "medium"
    },
    "Tomato___Target_Spot": {
        "treatment": "Apply fungicide with azoxystrobin or chlorothalonil.",
        "prevention": "Rotate crops. Destroy infected plant debris.",
        "severity": "medium"
    },
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": {
        "treatment": "No cure available. Remove and destroy infected plants immediately to stop spread.",
        "prevention": "Control whitefly population which spreads this virus. Use reflective mulch.",
        "severity": "high"
    },
    "Tomato___Tomato_mosaic_virus": {
        "treatment": "No cure. Remove infected plants. Wash hands and tools after handling.",
        "prevention": "Use virus-resistant seed varieties. Control aphids. Do not smoke near plants.",
        "severity": "high"
    },
    "Tomato___healthy": {
        "treatment": "No treatment needed.",
        "prevention": "Continue regular monitoring and good farming practices.",
        "severity": "none"
    },
    "Potato___Late_blight": {
        "treatment": "Apply metalaxyl-based fungicide immediately. Destroy all infected plants.",
        "prevention": "Use certified disease-free seed potatoes. Avoid overhead irrigation.",
        "severity": "high"
    },
    "Potato___Early_blight": {
        "treatment": "Apply mancozeb or chlorothalonil fungicide every 7-14 days.",
        "prevention": "Rotate crops. Use resistant varieties. Remove infected leaves.",
        "severity": "medium"
    },
    "Potato___healthy": {
        "treatment": "No treatment needed.",
        "prevention": "Continue regular monitoring and proper crop rotation.",
        "severity": "none"
    },
    "Corn_(maize)___Common_rust_": {
        "treatment": "Apply triazole fungicide in early stages of infection.",
        "prevention": "Plant resistant hybrid varieties. Monitor regularly from early season.",
        "severity": "medium"
    },
    "Corn_(maize)___Northern_Leaf_Blight": {
        "treatment": "Apply fungicide with propiconazole. Remove infected leaves.",
        "prevention": "Use resistant hybrids. Rotate crops. Till soil after harvest.",
        "severity": "medium"
    },
    "Corn_(maize)___healthy": {
        "treatment": "No treatment needed.",
        "prevention": "Maintain proper spacing and fertilization schedule.",
        "severity": "none"
    },
    "Apple___Apple_scab": {
        "treatment": "Apply fungicide with captan or myclobutanil every 7-10 days.",
        "prevention": "Rake and destroy fallen leaves. Prune for good air circulation.",
        "severity": "medium"
    },
    "Apple___Black_rot": {
        "treatment": "Remove infected fruit and branches. Apply copper fungicide.",
        "prevention": "Prune dead wood. Remove mummified fruit from tree and ground.",
        "severity": "high"
    },
    "Apple___Cedar_apple_rust": {
        "treatment": "Apply myclobutanil fungicide. Remove nearby cedar trees if possible.",
        "prevention": "Plant rust-resistant apple varieties.",
        "severity": "medium"
    },
    "Apple___healthy": {
        "treatment": "No treatment needed.",
        "prevention": "Regular pruning and monitoring. Maintain good orchard hygiene.",
        "severity": "none"
    },
    "Grape___Black_rot": {
        "treatment": "Apply mancozeb or captan fungicide immediately.",
        "prevention": "Remove mummified berries. Prune for air circulation.",
        "severity": "high"
    },
    "Grape___Esca_(Black_Measles)": {
        "treatment": "No effective cure. Remove and destroy infected vines.",
        "prevention": "Protect pruning wounds with fungicide paste.",
        "severity": "high"
    },
    "Grape___healthy": {
        "treatment": "No treatment needed.",
        "prevention": "Regular monitoring and proper vineyard management.",
        "severity": "none"
    },
    "Pepper,_bell___Bacterial_spot": {
        "treatment": "Apply copper-based bactericide spray.",
        "prevention": "Use disease-free seeds. Avoid overhead watering.",
        "severity": "medium"
    },
    "Pepper,_bell___healthy": {
        "treatment": "No treatment needed.",
        "prevention": "Continue good watering and fertilization practices.",
        "severity": "none"
    },
}

def get_disease_info(disease_name: str) -> dict:
    """Get treatment info for a disease. Returns default if not found."""
    
    # Try exact match first
    if disease_name in DISEASE_INFO:
        return DISEASE_INFO[disease_name]
    
    # Try partial match
    for key in DISEASE_INFO:
        if disease_name.lower() in key.lower():
            return DISEASE_INFO[key]
    
    # Default response if disease not in our list
    return {
        "treatment": "Consult your local agricultural extension officer for specific treatment advice.",
        "prevention": "Practice crop rotation, use disease-resistant varieties, and maintain good field hygiene.",
        "severity": "medium"
    }