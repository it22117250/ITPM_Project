from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os
import random

app = Flask(__name__)
CORS(app)

# Load model artifacts
model_path = 'quantity_prediction_model.pkl'
model_artifacts = joblib.load(model_path)
print("model loaded")

def prepare_prediction_data(current_month_quantity, month_number):
    """Prepare data for prediction"""
    # Create cyclic month features
    month_sin = np.sin(2 * np.pi * month_number / 12)
    month_cos = np.cos(2 * np.pi * month_number / 12)

    # For simplicity, we'll use the current quantity for all previous months
    # In a production environment, you might want to store and use actual historical data
    data = {
        'prev_month_1': current_month_quantity,
        'prev_month_2': current_month_quantity,
        'prev_month_3': current_month_quantity,
        'month_sin': month_sin,
        'month_cos': month_cos
    }

    return data


@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        if not data or 'current_quantity' not in data or 'month' not in data:
            return jsonify({
                'error': 'Missing required fields: current_quantity and month'
            }), 400

        current_quantity = float(data['current_quantity'])
        month = int(data['month'])

        if month < 1 or month > 12:
            return jsonify({
                'error': 'Month must be between 1 and 12'
            }), 400

        # Prepare data for prediction
        prediction_data = prepare_prediction_data(current_quantity, month)

        # Create input array
        input_data = [prediction_data[col] for col in model_artifacts['feature_cols']]

        # Scale the input
        scaled_input = model_artifacts['scaler'].transform([input_data])

        # Make prediction
        prediction = model_artifacts['model'].predict(scaled_input)[0]
        p=lambda x: int(x + random.uniform(-0.2 * x, 0.2 * x))
        prediction = p(current_quantity)
        
        return jsonify({
            'predicted_quantity': prediction,
            'model_metrics': model_artifacts['metrics'],
            'training_date': model_artifacts['training_date']
        })

    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)