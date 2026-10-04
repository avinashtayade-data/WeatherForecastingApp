from flask import Flask, render_template, request, jsonify
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

API_KEY = os.getenv("OPENWEATHER_API_KEY")

CURRENT_WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather"
FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast"
AIR_POLLUTION_URL = "https://api.openweathermap.org/data/2.5/air_pollution"

OPEN_METEO_AIR_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/weather")
def weather():

    city = request.args.get("city")

    if not city:
        return jsonify({
            "error": "Please enter a city name."
        }), 400

    if not API_KEY:
        return jsonify({
            "error": "OpenWeather API key is not configured."
        }), 500

    current_params = {
        "q": city,
        "appid": API_KEY,
        "units": "metric"
    }

    forecast_params = {
        "q": city,
        "appid": API_KEY,
        "units": "metric"
    }

    try:

        # --------------------------------
        # CURRENT WEATHER
        # --------------------------------

        current_response = requests.get(
            CURRENT_WEATHER_URL,
            params=current_params,
            timeout=10
        )

        if current_response.status_code != 200:

            api_error = current_response.json().get(
                "message",
                "Weather data unavailable."
            )

            return jsonify({
                "error": api_error.capitalize()
            }), current_response.status_code


        current_data = current_response.json()

        latitude = current_data["coord"]["lat"]
        longitude = current_data["coord"]["lon"]


        # --------------------------------
        # 5 DAY / 3 HOUR FORECAST
        # --------------------------------

        forecast_response = requests.get(
            FORECAST_URL,
            params=forecast_params,
            timeout=10
        )

        if forecast_response.status_code != 200:

            api_error = forecast_response.json().get(
                "message",
                "Forecast data unavailable."
            )

            return jsonify({
                "error": api_error.capitalize()
            }), forecast_response.status_code


        forecast_data = forecast_response.json()


        # --------------------------------
        # AIR QUALITY
        # --------------------------------

        air_quality = {
            "aqi": None,
            "label": "Unavailable",
            "pm25": None,
            "pm10": None,
            "ozone": None,
            "no2": None
        }


        try:

            air_response = requests.get(
                AIR_POLLUTION_URL,
                params={
                    "lat": latitude,
                    "lon": longitude,
                    "appid": API_KEY
                },
                timeout=10
            )

            if air_response.status_code == 200:

                air_data = air_response.json()

                air_item = air_data["list"][0]

                aqi = int(
                    air_item["main"]["aqi"]
                )

                aqi_labels = {
                    1: "Good",
                    2: "Fair",
                    3: "Moderate",
                    4: "Poor",
                    5: "Very Poor"
                }

                components = air_item["components"]

                air_quality = {
                    "aqi": aqi,
                    "label": aqi_labels.get(
                        aqi,
                        "Unknown"
                    ),
                    "pm25": round(
                        components.get("pm2_5", 0),
                        1
                    ),
                    "pm10": round(
                        components.get("pm10", 0),
                        1
                    ),
                    "ozone": round(
                        components.get("o3", 0),
                        1
                    ),
                    "no2": round(
                        components.get("no2", 0),
                        1
                    )
                }

        except requests.exceptions.RequestException:
            pass


        # --------------------------------
        # ALLERGY / POLLEN DATA
        # --------------------------------

        allergy = {
            "grass": None,
            "birch": None,
            "ragweed": None,
            "risk": "Unavailable"
        }


        try:

            pollen_params = {
                "latitude": latitude,
                "longitude": longitude,
                "current": (
                    "grass_pollen,"
                    "birch_pollen,"
                    "ragweed_pollen"
                ),
                "timezone": "auto"
            }

            pollen_response = requests.get(
                OPEN_METEO_AIR_URL,
                params=pollen_params,
                timeout=10
            )

            if pollen_response.status_code == 200:

                pollen_data = pollen_response.json()

                current_pollen = pollen_data.get(
                    "current",
                    {}
                )

                grass = current_pollen.get(
                    "grass_pollen"
                )

                birch = current_pollen.get(
                    "birch_pollen"
                )

                ragweed = current_pollen.get(
                    "ragweed_pollen"
                )

                values = [
                    value
                    for value in [
                        grass,
                        birch,
                        ragweed
                    ]
                    if value is not None
                ]

                maximum = max(values) if values else 0

                if maximum < 10:
                    risk = "Low"

                elif maximum < 50:
                    risk = "Moderate"

                else:
                    risk = "High"


                allergy = {
                    "grass": grass,
                    "birch": birch,
                    "ragweed": ragweed,
                    "risk": risk
                }

        except requests.exceptions.RequestException:
            pass


        # --------------------------------
        # CURRENT WEATHER DATA
        # --------------------------------

        current_weather = {

            "city": current_data["name"],

            "country":
                current_data["sys"]["country"],

            "latitude":
                latitude,

            "longitude":
                longitude,

            "temperature":
                round(current_data["main"]["temp"]),

            "feels_like":
                round(current_data["main"]["feels_like"]),

            "humidity":
                current_data["main"]["humidity"],

            "wind_speed":
                current_data["wind"]["speed"],

            "condition":
                current_data["weather"][0]["main"],

            "description":
                current_data["weather"][0]["description"],

            "icon":
                current_data["weather"][0]["icon"],

            "sunrise":
                current_data["sys"]["sunrise"],

            "sunset":
                current_data["sys"]["sunset"]

        }


        # --------------------------------
        # FORECAST DATA
        # --------------------------------

        forecast = []

        for item in forecast_data["list"]:

            forecast.append({

                "datetime":
                    item["dt_txt"],

                "temperature":
                    round(item["main"]["temp"]),

                "humidity":
                    item["main"]["humidity"],

                "condition":
                    item["weather"][0]["main"],

                "description":
                    item["weather"][0]["description"],

                "icon":
                    item["weather"][0]["icon"]

            })


        # --------------------------------
        # FINAL RESPONSE
        # --------------------------------

        return jsonify({

            "current":
                current_weather,

            "forecast":
                forecast,

            "air_quality":
                air_quality,

            "allergy":
                allergy

        })


    except requests.exceptions.Timeout:

        return jsonify({
            "error":
                "Weather service request timed out."
        }), 504


    except requests.exceptions.RequestException:

        return jsonify({
            "error":
                "Unable to connect to weather service."
        }), 500


    except Exception as error:

        print("ERROR:", error)

        return jsonify({
            "error":
                "An unexpected error occurred."
        }), 500


if __name__ == "__main__":
    app.run(debug=True)