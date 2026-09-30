from flask import Flask, render_template, request, jsonify
from datetime import datetime

app = Flask(__name__)

# Configurable demonstration thresholds for temperature (in Celsius)
# Note: These are for demonstration purposes and may not represent the actual boiling point of milk.
DEMO_WARNING_TEMP = 85.0
DEMO_CRITICAL_TEMP = 95.0

# In-memory system state
system_state = {
    "temperature": 25.0,
    "water_level": "Normal",
    "gas_heater": "ON",
    "buzzer": "OFF",
    "status": "Safe",
    "last_updated": datetime.now().isoformat()
}

@app.route('/')
def dashboard():
    return render_template('dashboard.html')

@app.route('/api/sensor-data', methods=['POST'])
def receive_sensor_data():
    global system_state
    
    # 1. Missing JSON validation
    if not request.is_json:
        return jsonify({"error": "Missing JSON in request"}), 400
        
    data = request.get_json()
    
    # 2. Missing temperature validation
    if 'temperature' not in data:
        return jsonify({"error": "Missing 'temperature' in JSON data"}), 400
        
    # 3. Invalid temperature validation
    try:
        temp = float(data['temperature'])
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid 'temperature' value, must be a number"}), 400
        
    # 4. Invalid water_level validation
    water_level = data.get('water_level', 'Normal')
    valid_water_levels = ["Normal", "High", "Overflow"]
    if water_level not in valid_water_levels:
        return jsonify({"error": f"Invalid 'water_level'. Must be one of {valid_water_levels}"}), 400
        
    # Update system state values
    system_state['temperature'] = temp
    system_state['water_level'] = water_level
    system_state['last_updated'] = datetime.now().isoformat()
    
    # Simple server-side logic
    if water_level == "Overflow" or temp >= DEMO_CRITICAL_TEMP:
        system_state['status'] = "Critical"
        system_state['gas_heater'] = "OFF"
        system_state['buzzer'] = "ON"
    elif temp >= DEMO_WARNING_TEMP:
        system_state['status'] = "Warning"
        system_state['gas_heater'] = "ON"
        system_state['buzzer'] = "OFF"
    else:
        system_state['status'] = "Safe"
        system_state['gas_heater'] = "ON"
        system_state['buzzer'] = "OFF"
        
    return jsonify({"message": "Data received successfully", "state": system_state}), 200

@app.route('/api/system-status', methods=['GET'])
def get_system_status():
    return jsonify(system_state), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
