const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

const errorMessage = document.getElementById("errorMessage");
const loading = document.getElementById("loading");
const weatherDashboard = document.getElementById("weatherDashboard");

const cityName = document.getElementById("cityName");
const country = document.getElementById("country");

const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const condition = document.getElementById("condition");

const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const weatherCondition = document.getElementById("weatherCondition");

const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");

const aqiValue = document.getElementById("aqiValue");
const aqiLabel = document.getElementById("aqiLabel");

const pm25 = document.getElementById("pm25");
const pm10 = document.getElementById("pm10");
const ozone = document.getElementById("ozone");
const no2 = document.getElementById("no2");

const grassPollen = document.getElementById("grassPollen");
const birchPollen = document.getElementById("birchPollen");
const ragweedPollen = document.getElementById("ragweedPollen");
const allergyRisk = document.getElementById("allergyRisk");

const forecastContainer =
    document.getElementById("forecastContainer");

const hourlyContainer =
    document.getElementById("hourlyContainer");

let temperatureChart = null;


// --------------------------------
// SEARCH BUTTON
// --------------------------------

searchBtn.addEventListener("click", () => {

    const city = cityInput.value.trim();

    if (city === "") {

        showError("Please enter a city name.");

        return;
    }

    getWeather(city);
});


// --------------------------------
// ENTER KEY
// --------------------------------

cityInput.addEventListener("keypress", (event) => {

    if (event.key === "Enter") {

        searchBtn.click();
    }

});


// --------------------------------
// GET WEATHER
// --------------------------------

async function getWeather(city) {

    errorMessage.style.display = "none";

    loading.style.display = "block";

    weatherDashboard.style.display = "none";


    try {

        const response = await fetch(
            `/weather?city=${encodeURIComponent(city)}`
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Unable to get weather data."
            );

        }


        displayCurrentWeather(
            data.current
        );


        displayAirQuality(
            data.air_quality
        );


        displayAllergy(
            data.allergy
        );


        displayHourlyWeather(
            data.forecast
        );


        displayForecast(
            data.forecast
        );


        displayTemperatureChart(
            data.forecast
        );


        loading.style.display = "none";

        weatherDashboard.style.display = "block";

    }


    catch (error) {

        loading.style.display = "none";

        showError(error.message);

    }

}


// --------------------------------
// CURRENT WEATHER
// --------------------------------

function displayCurrentWeather(weather) {

    cityName.textContent =
        weather.city;

    country.textContent =
        weather.country;


    temperature.textContent =
        `${weather.temperature}°C`;


    condition.textContent =
        weather.description;


    feelsLike.textContent =
        `${weather.feels_like}°C`;


    humidity.textContent =
        `${weather.humidity}%`;


    windSpeed.textContent =
        `${weather.wind_speed} m/s`;


    weatherCondition.textContent =
        weather.condition;


    weatherIcon.src =
        `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;


    weatherIcon.alt =
        weather.description;


    // Sunrise

    sunrise.textContent =
        formatTime(weather.sunrise);


    // Sunset

    sunset.textContent =
        formatTime(weather.sunset);

}


// --------------------------------
// FORMAT TIME
// --------------------------------

function formatTime(timestamp) {

    if (!timestamp) {
        return "--:--";
    }


    const date =
        new Date(timestamp * 1000);


    return date.toLocaleTimeString(
        "en-US",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


// --------------------------------
// AIR QUALITY
// --------------------------------

function displayAirQuality(data) {

    if (!data) {
        return;
    }


    aqiValue.textContent =
        data.aqi ?? "--";


    aqiLabel.textContent =
        data.label || "Unavailable";


    pm25.textContent =
        data.pm25 !== null
            ? `${data.pm25} μg/m³`
            : "--";


    pm10.textContent =
        data.pm10 !== null
            ? `${data.pm10} μg/m³`
            : "--";


    ozone.textContent =
        data.ozone !== null
            ? `${data.ozone} μg/m³`
            : "--";


    no2.textContent =
        data.no2 !== null
            ? `${data.no2} μg/m³`
            : "--";

}


// --------------------------------
// ALLERGY OUTLOOK
// --------------------------------

function displayAllergy(data) {

    if (!data) {
        return;
    }


    grassPollen.textContent =
        data.grass !== null
            ? `${data.grass} grains/m³`
            : "Unavailable";


    birchPollen.textContent =
        data.birch !== null
            ? `${data.birch} grains/m³`
            : "Unavailable";


    ragweedPollen.textContent =
        data.ragweed !== null
            ? `${data.ragweed} grains/m³`
            : "Unavailable";


    allergyRisk.textContent =
        data.risk || "Unavailable";

}


// --------------------------------
// HOURLY WEATHER
// --------------------------------

function displayHourlyWeather(forecast) {

    hourlyContainer.innerHTML = "";


    const hourlyData =
        forecast.slice(0, 8);


    hourlyData.forEach(item => {

        const date =
            new Date(item.datetime);


        const time =
            date.toLocaleTimeString(
                "en-US",
                {
                    hour: "numeric"
                }
            );


        const card =
            document.createElement("div");


        card.className =
            "hourly-card";


        card.innerHTML = `

            <p class="hourly-time">
                ${time}
            </p>

            <img
                src="https://openweathermap.org/img/wn/${item.icon}@2x.png"
                alt="${item.description}"
            >

            <h3>
                ${item.temperature}°C
            </h3>

            <p>
                ${item.condition}
            </p>

            <span>
                💧 ${item.humidity}%
            </span>

        `;


        hourlyContainer.appendChild(card);

    });

}


// --------------------------------
// FIVE DAY FORECAST
// --------------------------------

function displayForecast(forecast) {

    forecastContainer.innerHTML = "";


    const dailyForecast = {};


    forecast.forEach(item => {

        const date =
            item.datetime.split(" ")[0];


        if (!dailyForecast[date]) {

            dailyForecast[date] = item;

        }

    });


    const days =
        Object.values(dailyForecast)
            .slice(0, 5);


    days.forEach(item => {

        const date =
            new Date(item.datetime);


        const dayName =
            date.toLocaleDateString(
                "en-US",
                {
                    weekday: "short"
                }
            );


        const dateText =
            date.toLocaleDateString(
                "en-US",
                {
                    day: "numeric",
                    month: "short"
                }
            );


        const card =
            document.createElement("div");


        card.className =
            "forecast-card";


        card.innerHTML = `

            <h3>
                ${dayName}
            </h3>

            <p class="forecast-date">
                ${dateText}
            </p>

            <img
                src="https://openweathermap.org/img/wn/${item.icon}@2x.png"
                alt="${item.description}"
            >

            <h2>
                ${item.temperature}°C
            </h2>

            <p>
                ${item.condition}
            </p>

            <p class="forecast-humidity">
                💧 ${item.humidity}%
            </p>

        `;


        forecastContainer.appendChild(card);

    });

}


// --------------------------------
// TEMPERATURE CHART
// --------------------------------

function displayTemperatureChart(forecast) {

    const chartData =
        forecast.slice(0, 10);


    const labels =
        chartData.map(item => {

            const date =
                new Date(item.datetime);


            return date.toLocaleTimeString(
                "en-US",
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );

        });


    const temperatures =
        chartData.map(
            item => item.temperature
        );


    const ctx =
        document
            .getElementById("temperatureChart")
            .getContext("2d");


    if (temperatureChart) {

        temperatureChart.destroy();

    }


    temperatureChart =
        new Chart(ctx, {

            type: "line",

            data: {

                labels: labels,

                datasets: [

                    {

                        label:
                            "Temperature °C",

                        data:
                            temperatures,

                        borderWidth: 3,

                        tension: 0.4,

                        fill: false,

                        pointRadius: 4

                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {

                        display: true

                    }

                },

                scales: {

                    y: {

                        beginAtZero: false

                    }

                }

            }

        });

}


// --------------------------------
// ERROR
// --------------------------------

function showError(message) {

    errorMessage.textContent =
        message;

    errorMessage.style.display =
        "block";

    weatherDashboard.style.display =
        "none";

}