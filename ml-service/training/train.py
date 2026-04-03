# train.py — Script to train the disease detection model
# Uses PlantVillage dataset with MobileNetV2 Transfer Learning
#
# HOW TO USE:
# 1. Download PlantVillage dataset from Kaggle:
#    https://www.kaggle.com/datasets/abdallahalidev/plantvillage-dataset
# 2. Place it in: ml-service/training/data/PlantVillage/
# 3. Run: python training/train.py
# 4. Trained model saves to: ml-service/saved_models/

import tensorflow as tf
import os

# ── Settings ──────────────────────────────────────────
DATA_DIR    = "training/data/PlantVillage"  # Path to dataset
MODEL_SAVE  = "saved_models/plant_disease_model.keras"
IMAGE_SIZE  = (224, 224)
BATCH_SIZE  = 32
EPOCHS      = 10
NUM_CLASSES = 38

print("🌱 Starting model training...")
print(f"   Dataset: {DATA_DIR}")
print(f"   Epochs:  {EPOCHS}")

# ── Step 1: Load and Split Dataset ────────────────────
# 80% for training, 20% for validation
train_dataset = tf.keras.utils.image_dataset_from_directory(
    DATA_DIR,
    validation_split=0.2,
    subset="training",
    seed=42,
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    label_mode="categorical"   # One-hot encoding for 38 classes
)

val_dataset = tf.keras.utils.image_dataset_from_directory(
    DATA_DIR,
    validation_split=0.2,
    subset="validation",
    seed=42,
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE,
    label_mode="categorical"
)

# ── Step 2: Data Augmentation ─────────────────────────
# Makes model stronger by showing rotated/flipped versions of images
data_augmentation = tf.keras.Sequential([
    tf.keras.layers.RandomFlip("horizontal"),
    tf.keras.layers.RandomRotation(0.2),
    tf.keras.layers.RandomZoom(0.1),
    tf.keras.layers.RandomBrightness(0.1),
])

# ── Step 3: Normalize Pixel Values ────────────────────
# MobileNetV2 expects values between -1 and 1
normalization = tf.keras.layers.Rescaling(1./127.5, offset=-1)

# ── Step 4: Build the Model ───────────────────────────
base_model = tf.keras.applications.MobileNetV2(
    input_shape=(224, 224, 3),
    include_top=False,
    weights="imagenet"
)
base_model.trainable = False  # Freeze pre-trained layers

inputs = tf.keras.Input(shape=(224, 224, 3))
x      = data_augmentation(inputs)
x      = normalization(x)
x      = base_model(x, training=False)
x      = tf.keras.layers.GlobalAveragePooling2D()(x)
x      = tf.keras.layers.Dropout(0.2)(x)
outputs = tf.keras.layers.Dense(NUM_CLASSES, activation="softmax")(x)

model = tf.keras.Model(inputs, outputs)

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)

model.summary()

# ── Step 5: Train! ────────────────────────────────────
print("\n🚀 Training started...")

# Stop early if model stops improving
early_stop = tf.keras.callbacks.EarlyStopping(
    monitor="val_accuracy",
    patience=3,
    restore_best_weights=True
)

history = model.fit(
    train_dataset,
    validation_data=val_dataset,
    epochs=EPOCHS,
    callbacks=[early_stop]
)

# ── Step 6: Fine-tune (Optional but improves accuracy) ─
print("\n🔧 Fine-tuning top layers...")
base_model.trainable = True

# Only unfreeze the last 30 layers
for layer in base_model.layers[:-30]:
    layer.trainable = False

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.0001),
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)

history_fine = model.fit(
    train_dataset,
    validation_data=val_dataset,
    epochs=5,
    callbacks=[early_stop]
)

# ── Step 7: Save the Model ────────────────────────────
os.makedirs("saved_models", exist_ok=True)
model.save(MODEL_SAVE)
print(f"\n✅ Model saved to {MODEL_SAVE}")

# Show final accuracy
final_acc = history_fine.history["val_accuracy"][-1]
print(f"✅ Final validation accuracy: {final_acc * 100:.1f}%")
print("\n🎉 Training complete! You can now run the ML service.")