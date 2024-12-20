import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.utils import custom_object_scope
from attention_layer import AttentionLayer  

import logging
from datetime import datetime
from werkzeug.utils import secure_filename

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
class Config:
    UPLOAD_FOLDER = 'uploads'
    ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov', 'webm'}
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    MODEL_PATH = os.getenv('MODEL_PATH', 'model.h5')
    NUM_FRAMES = 10
    FRAME_SHAPE = (224, 224, 3)
    PREPROCESSING_SIZE = (128, 128)

# Create upload folder if it doesn't exist
os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

# Load the model
try:
    with custom_object_scope({'AttentionLayer': AttentionLayer}):
        model = load_model(Config.MODEL_PATH)
        logger.info("Model loaded successfully")
except Exception as e:
    logger.error(f"Error loading model: {str(e)}")
    model = None

def preprocess_frames(frames, input_size):
    """
    Preprocess frames according to the original logic.
    
    Args:
        frames: List of frames to preprocess
        input_size: Tuple of (width, height) for resizing
    
    Returns:
        List of preprocessed frames
    """
    preprocessed_frames = []
    for frame in frames:
        frame = cv2.resize(frame, input_size)
        frame = frame / 255.0
        preprocessed_frames.append(frame)
    return preprocessed_frames

def predict_violence(video_path):
    """
    Predict violence in video using the original prediction logic.
    
    Args:
        video_path: Path to the video file
    
    Returns:
        dict: Prediction results including label and confidence
    """
    try:
        frames = []
        cap = cv2.VideoCapture(video_path)
        
        if not cap.isOpened():
            raise ValueError("Error opening video file")

        for _ in range(Config.NUM_FRAMES):
            ret, frame = cap.read()
            if not ret:
                break
            frame = cv2.resize(frame, Config.FRAME_SHAPE[:-1])
            frames.append(frame)

        cap.release()

        if len(frames) < Config.NUM_FRAMES:
            raise ValueError(f"Could not extract {Config.NUM_FRAMES} frames from video")

        preprocessed_frames = preprocess_frames(frames, Config.PREPROCESSING_SIZE)
        input_data = np.array(preprocessed_frames)[np.newaxis, ...]

        predictions = model.predict(input_data, verbose=0)
        predicted_class = np.argmax(predictions)
        prediction_label = "Violence" if predicted_class == 1 else "Non-Violence"
        confidence = float(predictions[0][predicted_class])

        return {
            'label': prediction_label,
            'confidence': confidence,
            'is_violent': bool(predicted_class == 1),
            'frames_processed': len(frames)
        }

    except Exception as e:
        logger.error(f"Error in violence prediction: {str(e)}")
        raise

@app.route('/api/detect', methods=['POST'])
def detect_violence():
    """
    API endpoint for violence detection.
    """
    try:
        if model is None:
            return jsonify({'error': 'Model not loaded'}), 500

        if 'video' not in request.files:
            return jsonify({'error': 'No video file provided'}), 400
        
        file = request.files['video']
        
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed'}), 400

        filename = secure_filename(f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename}")
        filepath = os.path.join(Config.UPLOAD_FOLDER, filename)
        
        file.save(filepath)
        
        try:
            results = predict_violence(filepath)
            response_json = {
                'isViolent': results['is_violent'],
                'label': results['label'],
                'confidence': results['confidence'],
                'framesProcessed': results['frames_processed']
            }

            # Print the JSON response to the command line
            print("Response JSON:", response_json)

            return jsonify(response_json)

        finally:
            if os.path.exists(filepath):
                os.remove(filepath)

    except Exception as e:
        logger.error(f"Error in violence detection endpoint: {str(e)}")
        
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'modelLoaded': model is not None,
        'config': {
            'numFrames': Config.NUM_FRAMES,
            'frameShape': Config.FRAME_SHAPE,
            'preprocessingSize': Config.PREPROCESSING_SIZE
        }
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
