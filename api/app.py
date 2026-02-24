from flask import Flask, request, jsonify
import joblib
import numpy as np
from google.cloud import storage
import os
import logging
import tempfile

# Setup logging (for GCP Cloud Logging)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# ✅ CORS - Allow frontend to call this API from any origin
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# ✅ Handle preflight OPTIONS request for /predict
@app.route('/predict', methods=['OPTIONS'])
def predict_options():
    return '', 204

# Load model from GCS
def load_model():
    client = storage.Client()
    bucket = client.bucket(os.environ.get('BUCKET_NAME'))

    # Get OS-safe temp directory
    temp_dir = tempfile.gettempdir()

    model_path = os.path.join(temp_dir, 'iris_model.pkl')
    target_path = os.path.join(temp_dir, 'target_names.pkl')

    # Download model files
    bucket.blob('model/iris_model.pkl').download_to_filename(model_path)
    bucket.blob('model/target_names.pkl').download_to_filename(target_path)

    model = joblib.load(model_path)
    target_names = joblib.load(target_path)
    return model, target_names

model, target_names = load_model()

@app.route('/health', methods=['GET'])
def health():
    logger.info("Health check called")
    return jsonify({"status": "healthy", "model": "iris-classifier"})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        features = data['features']  # [sepal_length, sepal_width, petal_length, petal_width]

        logger.info(f"Prediction request received: {features}")

        # Make prediction
        input_array = np.array(features).reshape(1, -1)
        prediction = model.predict(input_array)[0]
        probability = model.predict_proba(input_array)[0]
        predicted_class = target_names[prediction]

        result = {
            "prediction": int(prediction),
            "class": predicted_class,
            "confidence": round(float(max(probability)) * 100, 2),
            "probabilities": {
                name: round(float(prob) * 100, 2)
                for name, prob in zip(target_names, probability)
            }
        }

        logger.info(f"Prediction result: {result}")
        return jsonify(result)

    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))