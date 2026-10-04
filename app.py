from flask import Flask, render_template, request, jsonify
import requests
import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Create Flask application
app = Flask(__name__)

# Get OpenWeatherMap API key
API_KEY = os.getenv("OPENWEATHER_API_KEY")

# OpenWeatherMap API URLs
CURRENT_WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather"
FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast"


# Home page
@app.route("/")
def home():
    return render_template("index.html")


# Weather API route
@app.route("/weather")
def weather():

    # Get city from URL
    city = request.args.get("city")

    # Check whether city was entered
    if not city:
        return jsonify({
            "error": "Please enter a city name."
        }), 400

    # Parameters for current weather
    current_params = {
        "q": city,
        "appid": API_KEY,
        "units": "metric"
    }

    # Parameters for forecast
    forecast_params = {
        "q": city,
        "appid": API_KEY,
        "units": "metric"
    }

    try:

        # Get current weather
        current_response = requests.get(
            CURRENT_WEATHER_URL,
            params=current_params
        )

        # Get 5-day forecast
        forecast_response = requests.get(
            FORECAST_URL,
            params=forecast_params
        )

        # Check API response
        if current_response.status_code != 200:
            return jsonify({
                "error": "City not found or weather data unavailable."
            }), current_response.status_code

        if forecast_response.status_code != 200:
            return jsonify({
                "error": "Unable to get forecast data."
            }), forecast_response.status_code

        current_data = current_response.json()
        forecast_data = forecast_response.json()

        # Prepare current weather information
        current_weather = {
            "city": current_data["name"],
            "country": current_data["sys"]["country"],
            "temperature": round(current_data["main"]["temp"]),
            "feels_like": round(current_data["main"]["feels_like"]),
            "humidity": current_data["main"]["humidity"],
            "wind_speed": current_data["wind"]["speed"],
            "condition": current_data["weather"][0]["main"],
            "description": current_data["weather"][0]["description"],
            "icon": current_data["weather"][0]["icon"]
        }

        # Prepare forecast data
        forecast = []

        for item in forecast_data["list"]:

            forecast.append({
                "datetime": item["dt_txt"],
                "temperature": round(item["main"]["temp"]),
                "humidity": item["main"]["humidity"],
                "condition": item["weather"][0]["main"],
                "description": item["weather"][0]["description"],
                "icon": item["weather"][0]["icon"]
            })

        # Send data to JavaScript
        return jsonify({
            "current": current_weather,
            "forecast": forecast
        })

    except requests.exceptions.RequestException:
        return jsonify({
            "error": "Unable to connect to weather service."
        }), 500


# Run Flask application
if __name__ == "__main__":
    app.run(debug=True)