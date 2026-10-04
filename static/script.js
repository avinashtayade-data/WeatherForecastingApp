// Get HTML elements

const cityInput = document.getElementById("cityInput");

const searchBtn = document.getElementById("searchBtn");

const loading = document.getElementById("loading");

const errorMessage = document.getElementById("errorMessage");

const weatherDashboard =
    document.getElementById("weatherDashboard");

const cityName =
    document.getElementById("cityName");

const country =
    document.getElementById("country");

const temperature =
    document.getElementById("temperature");

const weatherIcon =
    document.getElementById("weatherIcon");

const condition =
    document.getElementById("condition");

const feelsLike =
    document.getElementById("feelsLike");

const humidity =
    document.getElementById("humidity");

const windSpeed =
    document.getElementById("windSpeed");

const weatherCondition =
    document.getElementById("weatherCondition");

const forecastContainer =
    document.getElementById("forecastContainer");


// Store chart object

let temperatureChart = null;


// Search button

searchBtn.addEventListener("click", function () {

    const city = cityInput.value.trim();

    if (city === "") {

        showError("Please enter a city name.");

        return;
    }

    getWeather(city);
});


// Allow Enter key

cityInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {

        searchBtn.click();
    }

});


// Get weather data from Flask

async function getWeather(city) {

    try {

        // Show loading

        loading.style.display = "block";

        errorMessage.textContent = "";

        weatherDashboard.style.display = "none";


        // Send request to Flask

        const response =
            await fetch(
                `/weather?city=${encodeURIComponent(city)}`
            );


        const data = await response.json();


        // Check for errors

        if (!response.ok) {

            throw new Error(
                data.error ||
                "Something went wrong."
            );
        }


        // Display weather

        displayCurrentWeather(data.current);

        displayForecast(data.forecast);

        createTemperatureChart(data.forecast);


        weatherDashboard.style.display = "block";

    }

    catch (error) {

        showError(error.message);

    }

    finally {

        loading.style.display = "none";
    }

}


// Display current weather

function displayCurrentWeather(data) {

    cityName.textContent = data.city;

    country.textContent = data.country;

    temperature.textContent =
        `${data.temperature}°C`;

    condition.textContent =
        data.description;

    feelsLike.textContent =
        `${data.feels_like}°C`;

    humidity.textContent =
        `${data.humidity}%`;

    windSpeed.textContent =
        `${data.wind_speed} m/s`;

    weatherCondition.textContent =
        data.condition;


    // OpenWeatherMap weather icon

    weatherIcon.src =
        `https://openweathermap.org/img/wn/${data.icon}@2x.png`;

    weatherIcon.alt =
        data.description;
}


// Display forecast

function displayForecast(forecast) {

    forecastContainer.innerHTML = "";


    /*
        OpenWeatherMap gives data
        every 3 hours.

        We select one forecast
        approximately every day.
    */

    const dailyForecast = [];

    const datesUsed = new Set();


    for (const item of forecast) {

        const date =
            item.datetime.split(" ")[0];


        if (!datesUsed.has(date)) {

            datesUsed.add(date);

            dailyForecast.push(item);
        }


        if (dailyForecast.length === 5) {

            break;
        }
    }


    dailyForecast.forEach(function (item) {

        const date =
            new Date(item.datetime);


        const formattedDate =
            date.toLocaleDateString(
                "en-IN",
                {
                    weekday: "short",
                    day: "numeric",
                    month: "short"
                }
            );


        const card =
            document.createElement("div");


        card.classList.add("forecast-card");


        card.innerHTML = `

            <p class="forecast-date">
                ${formattedDate}
            </p>

            <img
                src="https://openweathermap.org/img/wn/${item.icon}@2x.png"
                alt="${item.description}"
            >

            <p class="forecast-temp">
                ${item.temperature}°C
            </p>

            <p class="forecast-condition">
                ${item.description}
            </p>

        `;


        forecastContainer.appendChild(card);

    });
}


// Create temperature chart

function createTemperatureChart(forecast) {

    const ctx =
        document.getElementById(
            "temperatureChart"
        );


    // Take first 10 forecast points

    const chartData =
        forecast.slice(0, 10);


    const labels =
        chartData.map(function (item) {

            const date =
                new Date(item.datetime);

            return date.toLocaleTimeString(
                "en-IN",
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );

        });


    const temperatures =
        chartData.map(function (item) {

            return item.temperature;

        });


    // Delete previous chart

    if (temperatureChart) {

        temperatureChart.destroy();
    }


    // Create new chart

    temperatureChart =
        new Chart(ctx, {

            type: "line",

            data: {

                labels: labels,

                datasets: [{

                    label: "Temperature °C",

                    data: temperatures,

                    borderWidth: 3,

                    tension: 0.4,

                    fill: false,

                    pointRadius: 5

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: true,

                plugins: {

                    legend: {

                        labels: {

                            color: "white"

                        }

                    }

                },

                scales: {

                    x: {

                        ticks: {

                            color: "white"

                        },

                        grid: {

                            color:
                                "rgba(255,255,255,0.1)"

                        }

                    },

                    y: {

                        ticks: {

                            color: "white"

                        },

                        grid: {

                            color:
                                "rgba(255,255,255,0.1)"

                        }

                    }

                }

            }

        });

}


// Display error

function showError(message) {

    errorMessage.textContent = message;

    weatherDashboard.style.display = "none";
}


// Load default city

getWeather("Pune");