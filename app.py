from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import requests
import re
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure Google Gemini API - Use environment variable or replace with your key
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', 'AIzaSyBYh1gjvgufjDoLxBZM1X_Bfxo6H0oYVLk')
WEATHER_API_KEY = os.environ.get('WEATHER_API_KEY', 'd663b8fdf85eec8faf5360806fc62c91')

# Configure Google Gemini API
genai.configure(api_key=GEMINI_API_KEY)

# Load the Gemini model
model = genai.GenerativeModel('gemini-1.5-pro-latest')

# Function to detect language type (Hindi, English, or Mixed)
def detect_language(text):
    hindi_chars = re.compile(r'[\u0900-\u097F]')
    english_chars = re.compile(r'[a-zA-Z]')
    
    has_hindi = bool(hindi_chars.search(text))
    has_english = bool(english_chars.search(text))
    
    if has_hindi and has_english:
        return "mixed"
    elif has_hindi:
        return "hindi"
    else:
        return "english"

# Function to get crop info
def get_crop_info(crop_name, lang):
    try:
        if lang == "hindi":
            prompt = f"{crop_name} ki kheti ke baare mein jankari dein."
        elif lang == "mixed":
            prompt = f"Please provide info about {crop_name} ki kheti."
        else:
            prompt = f"Provide information about {crop_name} cultivation."
        
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error getting crop information: {str(e)}"

# Function to get weather info
def get_weather(location, lang):
    try:
        url = f"http://api.openweathermap.org/data/2.5/weather?q={location}&appid={WEATHER_API_KEY}&units=metric"
        
        response = requests.get(url).json()
        
        if response.get('cod') != 200:
            return f"Error fetching weather data: {response.get('message', 'Unknown error')}"
        
        # Extract weather details
        temp = response['main']['temp']
        description = response['weather'][0]['description']
        humidity = response['main']['humidity']
        wind_speed = response['wind']['speed']

        if lang == "hindi":
            return (f"{location} का मौसम:\n"
                    f"Temperature: {temp}°C\n"
                    f"हालत: {description.capitalize()}\n"
                    f"नमी: {humidity}%\n"
                    f"हवा की रफ्तार: {wind_speed} m/s")
        elif lang == "mixed":
            return (f"{location} का weather:\n"
                    f"Temperature: {temp}°C\n"
                    f"Condition: {description.capitalize()}\n"
                    f"Humidity: {humidity}%\n"
                    f"Wind Speed: {wind_speed} m/s")
        else:
            return (f"Weather in {location}:\n"
                    f"Temperature: {temp}°C\n"
                    f"Condition: {description.capitalize()}\n"
                    f"Humidity: {humidity}%\n"
                    f"Wind Speed: {wind_speed} m/s")
    except Exception as e:
        return f"Error getting weather: {str(e)}"

# Function to get disease info
def get_disease_info(crop_name, symptom, lang):
    try:
        if lang == "hindi":
            prompt = f"Meri {crop_name} mein {symptom} hai. Yeh bimari kya hai aur iska ilaj kya hai?"
        elif lang == "mixed":
            prompt = f"My {crop_name} mein {symptom} hai. What is the disease and how to treat it?"
        else:
            prompt = f"My {crop_name} has {symptom}. What disease is it and how do I treat it?"
        
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error getting disease information: {str(e)}"

# Route for weather endpoint
@app.route('/api/weather', methods=['POST'])
def weather_endpoint():
    data = request.json
    location = data.get('location', '')
    
    if not location:
        return jsonify({'error': 'Location is required'}), 400
    
    lang = detect_language(location)
    result = get_weather(location, lang)
    
    return jsonify({'result': result})

# Route for crop endpoint
@app.route('/api/crop', methods=['POST'])
def crop_endpoint():
    data = request.json
    crop = data.get('crop', '')
    
    if not crop:
        return jsonify({'error': 'Crop name is required'}), 400
    
    lang = detect_language(crop)
    result = get_crop_info(crop, lang)
    
    return jsonify({'result': result})

# Route for disease endpoint
@app.route('/api/disease', methods=['POST'])
def disease_endpoint():
    data = request.json
    crop = data.get('crop', '')
    symptom = data.get('symptom', '')
    
    if not crop or not symptom:
        return jsonify({'error': 'Crop name and symptom are required'}), 400
    
    lang = detect_language(crop + " " + symptom)
    result = get_disease_info(crop, symptom, lang)
    
    return jsonify({'result': result})

# Route for other queries
@app.route('/api/other', methods=['POST'])
def other_endpoint():
    data = request.json
    query = data.get('query', '')
    
    if not query:
        return jsonify({'error': 'Query is required'}), 400
    
    try:
        response = model.generate_content(query)
        result = response.text
    except Exception as e:
        result = f"Error processing query: {str(e)}"
    
    return jsonify({'result': result})

# Serve static files (if needed)
@app.route('/')
def index():
    return app.send_static_file('index.html')

if __name__ == '__main__':
    app.run(debug=True)


# OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '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')
# WEATHER_API_KEY = os.environ.get('WEATHER_API_KEY', 'd663b8fdf85eec8faf5360806fc62c91')